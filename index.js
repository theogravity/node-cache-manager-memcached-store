var Memcached = require('memcached')
var EventEmitter = require('events').EventEmitter

function MemcachedClient (args) {
  this.options = args || {}
  var servers = null

  if (args.host && args.port) {
    servers = args.host + ':' + args.port
  } else if (args.servers) {
    servers = args.servers
  } else {
    throw new Error('[cache-manager] Memcache connection not defined')
  }

  this.memcached = new Memcached(servers, this.options.memcached)
  this._initMemcachedEvents()
}

MemcachedClient.prototype.events = new EventEmitter()

MemcachedClient.prototype._initMemcachedEvents = function () {
  this.memcached.on('issue', function (details) {
    this.events.emit('memcachedIssue', details)
  }.bind(this))

  this.memcached.on('failure', function (details) {
    this.events.emit('memcachedFailure', details)
  }.bind(this))

  this.memcached.on('reconnecting', function (details) {
    this.events.emit('memcachedReconnecting', details)
  }.bind(this))

  this.memcached.on('reconnect', function (details) {
    this.events.emit('memcachedReconnect', details)
  }.bind(this))

  this.memcached.on('remove', function (details) {
    this.events.emit('memcachedRemove', details)
  }.bind(this))
}

MemcachedClient.prototype.name = 'memcached'

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
  }

  this.memcached.get(key, handleError(cb))
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
  } else if (typeof options === 'number') {
    opt = {
      ttl: options
    }
  } else if (typeof options === 'object') {
    opt = options
  }

  this.memcached.set(key, value, opt.ttl, handleError(cb))
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

  this.memcached.del(key, handleError(cb))
}

/**
 * Delete all the keys
 * @method reset
 * @param {Function} [cb] - A callback that returns a potential error, otherwise null
 */
MemcachedClient.prototype.reset = function (cb) {
  this.memcached.flush(handleError(cb))
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
