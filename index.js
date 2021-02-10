
/**
 * @constructor
 * @param {Object} options cache-manager options.
 * @param {Object} options.options Memcache driver options.
 * @param {Function} options.driver Memcache driver constructor/class e.g. memcache-plus.
 */
function MemcachedClient (options) {
  this.options = options

  if (!this.options) {
    throw new Error('[cache-manager] memcache options not defined')
  } else if (!this.options.driver) {
    throw new Error('[cache-manager] memcache driver not specified')
  }

  const Memcached = this.options.driver

  this.memcached = new Memcached(this.options.options)
}

MemcachedClient.prototype.name = 'memcached'

/**
 * Used for testing; Gets the set options
 * @returns {object}
 * @private
 */
MemcachedClient.prototype._getOptions = function () {
  return this.options
}

/**
 * See https://github.com/BryanDonovan/node-cache-manager/blob/master/lib/caching.js
 * for the interface methods that need to be implemented
 */

/**
 * Get a value for a given key.
 * @method get
 * @param {String} key - The cache key
 * @param {Object} [options] - The options (optional)
 * @param {Function} cb - A callback that returns a potential error and the response
 */
MemcachedClient.prototype.get = function (key, options, cb) {
  const args = [key]

  if (typeof options === 'function') {
    cb = options
  } else if (options !== null && typeof options === 'object') {
    args.push(options)
  }

  const result = this.memcached.get(...args)
  if (typeof cb !== 'function') return result

  result
    .then(val => cb(null, val))
    .catch(err => cb(err, null))
}

/**
 * Set a value for a given key.
 * @method set
 * @param {String} key - The cache key
 * @param {String} value - The value to set
 * @param {Object} [options] - The options (optional)
 * @param {Object} options.ttl - The ttl value. Default is 2592000 seconds
 * @param {Function} [cb] - A callback that returns a potential error, otherwise null
 */
MemcachedClient.prototype.set = function (key, value, options, cb) {
  const args = [key, value]

  if (typeof options === 'function') {
    cb = options
  } else if (typeof options === 'number' || (options !== null && typeof options === 'object')) {
    args.push(options)
  }

  const result = this.memcached.set(...args)
  if (typeof cb !== 'function') {
    return result.then(() => true)
  }

  result
    .then(() => cb(null, true))
    .catch(err => cb(err, null))
}

/**
 * Delete value of a given key
 * @method del
 * @param {String} key - The cache key
 * @param {Object} [options] - The options (optional)
 * @param {Function} [cb] - A callback that returns a potential error, otherwise null
 */
MemcachedClient.prototype.del = function (key, options, cb) {
  if (typeof options === 'function') {
    cb = options
  }

  const result = this.memcached.delete(key)
  if (typeof cb !== 'function') {
    return result.then(() => null)
  }

  result
    .then(() => cb(null, null))
    .catch(err => cb(err, null))
}

/**
 * Delete all the keys
 * @method reset
 * @param {Function} [cb] - A callback that returns a potential error, otherwise null
 */
MemcachedClient.prototype.reset = function (cb) {
  const result = this.memcached.flush()

  if (typeof cb !== 'function') {
    return result.then(() => null)
  }

  result
    .then(() => cb(null, null))
    .catch(err => cb(err, null))
}

/**
 * Specify which values should and should not be cached.
 * If the function returns true, it will be stored in cache.
 * By default, it caches everything except null and undefined values.
 * Can be overriden via standard node-cache-manager options.
 * @method isCacheableValue
 * @param {String} value - The value to check
 * @return {Boolean} - Returns true if the value is cacheable, otherwise false.
 */
MemcachedClient.prototype.isCacheableValue = function (value) {
  if (this.options.isCacheableValue) {
    return this.options.isCacheableValue(value)
  }

  return value !== null && value !== undefined
}

/**
 * Returns the underlying memcached client connection
 * @method getClient
 * @param {Function} cb - A callback that returns a potential error and an object containing the Redis client and a done method
 */
MemcachedClient.prototype.getClient = function (cb) {
  return cb(null, {
    client: this.memcached
  })
}

/**
 * Returns all keys. Warning: Potentially very expensive function as memcache does not have a simple way to get key data.
 * @method keys
 * @param {String} [pattern] - Has no use, retained for interface compat.
 * @param {Function} cb - A callback that returns a potential error and the response
 */
MemcachedClient.prototype.keys = function (pattern, cb) {
  if (typeof pattern === 'function') {
    cb = pattern
  }

  getKeys(this.memcached, handleError(cb))
}

module.exports = {
  create: args => new MemcachedClient(args)
}

function handleError (cb) {
  cb = cb || function () {}

  return function (err, resp) {
    return cb(err || null, resp)
  }
}

// from: http://blog.pointerstack.com/2012/08/nodejs-extract-keys-from-memcache-server.html
function getKeys (memcached, cb) {
  memcached.items().then((items) => {
    // Returns an empty array if no items in cache.
    if (items.length === 0) {
      return cb(null, [])
    }

    const keyArray = []
    let keyLength = 0

    items.forEach((item) => {
      keyLength += item.data.number

      memcached.cachedump(item.slab_id, item.data.number).then((dataSet) => {
        dataSet.forEach((data) => {
          if (data.key) {
            memcached.get(data.key).then((val) => {
              if (val) {
                keyArray.push(data.key)
              }

              keyLength -= 1

              if (keyLength === 0) {
                cb(null, keyArray)
              }
            })
          }
        })
      })
    })
  }).catch(err => cb(err))
}
