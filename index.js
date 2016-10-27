var Memcached = require('memcache-plus')

function MemcachedClient (options) {
  this.options = options

  if (!this.options) {
    throw new Error('[cache-manager] memcache options not defined')
  }

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
  if (typeof options === 'function') {
    cb = options

    this.memcached.get(key).then(function (value) {
      cb(null, value)
    }).catch(function (err) {
      cb(err, null)
    })
  } else {
    this.memcached.get(key, options).then(function (value) {
      cb(null, value)
    }).catch(function (err) {
      cb(err, null)
    })
  }
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
  var opt = {
    ttl: 2592000
  }

  if (typeof options === 'function') {
    cb = options

    this.memcached.set(key, value).then(function () {
      cb(null, true)
    }).catch(function (err) {
      cb(err, null)
    })
  } else if (typeof options === 'number') {
    opt = {
      ttl: options
    }

    this.memcached.set(key, value, opt.ttl).then(function () {
      cb(null, true)
    }).catch(function (err) {
      cb(err, null)
    })
  } else if (typeof options === 'object') {
    this.memcached.set(key, value, options).then(function () {
      cb(null, true)
    }).catch(function (err) {
      cb(err, null)
    })
  }
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
  } else if (!options) {
    cb = function () {}
  }

  this.memcached.delete(key).then(function () {
    cb(null, null)
  }).catch(function (err) {
    cb(err, null)
  })
}

/**
 * Delete all the keys
 * @method reset
 * @param {Function} [cb] - A callback that returns a potential error, otherwise null
 */
MemcachedClient.prototype.reset = function (cb) {
  if (typeof cb !== 'function') {
    cb = function () {}
  }

  this.memcached.flush().then(function () {
    cb(null)
  }).catch(function (err) {
    cb(err, null)
  })
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
  create: function (args) {
    return new MemcachedClient(args)
  }
}

function handleError (cb) {
  cb = cb || function () {}

  return function (err, resp) {
    if (!err) {
      return cb(null, resp)
    }

    return cb(err, resp)
  }
}

// from: http://blog.pointerstack.com/2012/08/nodejs-extract-keys-from-memcache-server.html
function getKeys (memcached, cb) {
  var keyArray = []
  var keyLength = 0

  memcached.items().then(function (items) {
    items.forEach(function (item) {
      keyLength += item.data.number

      memcached.cachedump(item.slab_id, item.data.number).then(function (dataSet) {
        dataSet.forEach(function (data) {
          if (data.key) {
            memcached.get(data.key).then(function (val) {
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
  }).catch(function (err) {
    cb(err)
  })
}
