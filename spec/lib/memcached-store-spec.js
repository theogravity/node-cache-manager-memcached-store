/*global describe, it, expect, beforeAll */

var config = require('../config.json')
var memcachedStore = require('../../index')

var memcachedCache

beforeAll(function () {
  memcachedCache = require('cache-manager').caching({
    store: memcachedStore,
    options: {
      hosts: [process.env.MEMCACHED__HOST || config.memcached.host + ':' + config.memcached.port],
      testOption: true
    }
  })
})

describe('options', function () {
  it('should return the options', function (done) {
    memcachedCache.store.getClient(function (err, memcached) {
      expect(err).toBe(null)
      expect(memcached.client.testOption).toBe(true)
      done()
    })
  })
})

describe('set', function () {
  it('should store a value without ttl', function (done) {
    memcachedCache.set('foo', 'bar', function (err, ok) {
      expect(err).toBe(null)
      expect(ok).toBe(true)
      done()
    })
  })

  it('should store a value with a specific ttl', function (done) {
    memcachedCache.set('foo', 'bar', config.memcached.maxExpiration, function (err, ok) {
      expect(err).toBe(null)
      expect(ok).toBe(true)
      done()
    })
  })

  it('should store a value with a specific ttl 2', function (done) {
    memcachedCache.set('foo', 'bar', 30, function (err, ok) {
      expect(err).toBe(null)
      expect(ok).toBe(true)
      done()
    })
  })

  it('should not store an invalid value', function (done) {
    memcachedCache.set('foo1', null, function () {
      memcachedCache.get('foo1', function (err, value) {
        expect(err).toBe(null)
        expect(value).toBe(null)
        done()
      })
    })
  })
})

describe('get', function () {
  it('should retrieve a value for a given key', function (done) {
    var value = 'bar'
    memcachedCache.set('foo', value, function () {
      memcachedCache.get('foo', function (err, result) {
        expect(err).toBe(null)
        expect(result).toBe(value)
        done()
      })
    })
  })

  it('should retrieve a value for a given key if options provided', function (done) {
    var value = 'bar'
    memcachedCache.set('foo', value, function () {
      memcachedCache.get('foo', {}, function (err, result) {
        expect(err).toBe(null)
        expect(result).toBe(value)
        done()
      })
    })
  })
})

describe('del', function () {
  it('should delete a value for a given key', function (done) {
    memcachedCache.set('foo', 'bar', function () {
      memcachedCache.del('foo', function (err) {
        expect(err).toBe(null)
        done()
      })
    })
  })

  it('should delete a value for a given key without callback', function (done) {
    memcachedCache.set('foo', 'bar', function () {
      memcachedCache.del('foo')
      done()
    })
  })
})

describe('reset', function () {
  it('should flush underlying db', function (done) {
    memcachedCache.set('foo', 'bar', function () {
      memcachedCache.reset(function (err) {
        expect(err).toBe(null)

        memcachedCache.get('foo', function (err, value) {
          expect(err).toBe(null)
          expect(value).toBe(null)
          done()
        })
      })
    })
  })
})

describe('keys', function () {
  it('should get all the keys', function (done) {
    memcachedCache.reset(function (err) {
      expect(err).toBe(null)

      memcachedCache.set('foo', 'bar', function () {
        memcachedCache.keys(function (err, keys) {
          expect(err).toBe(null)
          expect(keys.length).toBe(1)
          done()
        })
      })
    })
  })
})

describe('isCacheableValue', function () {
  it('should return true when the value is not null or undefined', function (done) {
    expect(memcachedCache.store.isCacheableValue(0)).toBe(true)
    expect(memcachedCache.store.isCacheableValue(100)).toBe(true)
    expect(memcachedCache.store.isCacheableValue('')).toBe(true)
    expect(memcachedCache.store.isCacheableValue('test')).toBe(true)
    done()
  })

  it('should return false when the value is null or undefined', function (done) {
    expect(memcachedCache.store.isCacheableValue(null)).toBe(false)
    expect(memcachedCache.store.isCacheableValue(undefined)).toBe(false)
    done()
  })
})

describe('getClient', function () {
  it('should return memcached client', function (done) {
    memcachedCache.store.getClient(function (err, memcached) {
      expect(err).toBe(null)
      expect(memcached).not.toBe(null)
      expect(memcached.client).not.toBe(null)
      done(done)
    })
  })

  it('should handle no done callback without an error', function (done) {
    memcachedCache.store.getClient(function (err, memcached) {
      expect(err).toBe(null)
      expect(memcached).not.toBe(null)
      expect(memcached.client).not.toBe(null)
      done()
    })
  })
})

describe('overridable isCacheableValue function', function () {
  var memcachedCache2

  beforeAll(function () {
    memcachedCache2 = require('cache-manager').caching({
      store: memcachedStore,
      host: process.env.MEMCACHED__HOST || config.memcached.host,
      port: config.memcached.port,
      isCacheableValue: function () { return 'I was overridden' }
    })
  })

  it('should return its return value instead of the built-in function', function (done) {
    expect(memcachedCache2.store.isCacheableValue(0)).toBe('I was overridden')
    done()
  })
})
