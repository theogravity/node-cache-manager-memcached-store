/* global describe, it, expect, beforeAll, afterAll */

// Uncomment line below to enable memcache-plus debug logging.
// process.env.DEBUG = 'memcache-plus:*'

const config = require('../config.json')
const memcachedStore = require('../../index')

let memcachedCache

const cacheKeys = ['foo', 'foo1']

beforeAll(function () {
  memcachedCache = require('cache-manager').caching({
    store: memcachedStore,
    options: {
      hosts: [process.env.MEMCACHED__HOST || config.memcached.host + ':' + config.memcached.port],
      testOption: true
    }
  })
})

afterAll(function () {
  cacheKeys.forEach(function (key) {
    memcachedCache.del(key)
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

  it('should store a value & return promise if no callback provided', function (done) {
    const result = memcachedCache.set('foo', 'bar')
    expect(result.then).toBeInstanceOf(Function)
    result.then(function (ok) {
      expect(ok).toBe(true)
      done()
    }).catch(function (err) {
      done(err)
    })
  })
})

describe('get', function () {
  it('should retrieve a value for a given key', function (done) {
    const value = 'bar'
    memcachedCache.set('foo', value, function () {
      memcachedCache.get('foo', function (err, result) {
        expect(err).toBe(null)
        expect(result).toBe(value)
        done()
      })
    })
  })

  it('should retrieve a value for a given key if options provided', function (done) {
    const value = 'bar'
    memcachedCache.set('foo', value, function () {
      memcachedCache.get('foo', {}, function (err, result) {
        expect(err).toBe(null)
        expect(result).toBe(value)
        done()
      })
    })
  })

  it('should retrieve a value for a given key & return promise if no cb passed', function (done) {
    const value = 'bar'
    memcachedCache.set('foo', value)
      .then(function () {
        const res = memcachedCache.get('foo')
        expect(res.then).toBeInstanceOf(Function)
        return res
      }).then(function (result) {
        expect(result).toBe(value)
        done()
      }).catch(function (err) {
        done(err)
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

  it('should delete a value for a given key & return promise if no cb passed', function (done) {
    const value = 'bar'
    memcachedCache.set('foo', value)
      .then(function () {
        const res = memcachedCache.del('foo')
        expect(res.then).toBeInstanceOf(Function)
        return res
      }).then(function (result) {
        expect(result).toBe(null)
        done()
      }).catch(function (err) {
        done(err)
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

  it('should flush underlying db & return promise if no cb passed', function (done) {
    memcachedCache.set('foo', 'bar')
      .then(function () {
        const res = memcachedCache.reset()
        expect(res.then).toBeInstanceOf(Function)
        return res
      }).then(function (result) {
        expect(result).toBe(null)
        return memcachedCache.get('foo')
      }).then(function (result) {
        expect(result).toBe(null)
        done()
      }).catch(function (err) {
        done(err)
      })
  })
})

describe('keys', function () {
  it('should get all the keys', function (done) {
    memcachedCache.reset(function (err) {
      expect(err).toBe(null)

      memcachedCache.set('foo', 'bar', function () {
        setTimeout(function () {
          memcachedCache.keys(function (err, keys) {
            expect(err).toBe(null)
            expect(keys.length).toBe(1)
            done()
          })
        }, 1000)
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
  let memcachedCache2

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
