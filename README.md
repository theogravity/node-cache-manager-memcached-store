# Node Cache Manager store for Memcached
 
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com) [![Build Status](https://travis-ci.org/theogravity/node-cache-manager-memcached-store.svg?branch=master)](https://travis-ci.org/theogravity/node-cache-manager-memcached-store) [![npm version](https://badge.fury.io/js/cache-manager-memcached-store.svg)](https://badge.fury.io/js/cache-manager-memcached-store)

The Memcached store for the [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager)

Module can use different compatible memcache clients as the underlying memcache library:

 * [memcache-pp](https://github.com/RomanBurunkov/memcache-pp)
 * [memcache-plus](https://github.com/victorquinn/memcache-plus)

### Installation

Install one of the memcached clients from above and `cache-manager-memcached-store`

```sh
npm i memcache-pp --save
```

```sh
npm i cache-manager-memcached-store --save
```

### Acknowledgements

Some of the project scaffolding and test/comments are lifted from [node-cache-manager-redis](https://github.com/dial-once/node-cache-manager-redis)

Till version 3.0.0 `cache-manager-memcached-store` uses `memcache-plus` as the underlying memcached library.
Newer versions allow to choose any compatible library by passing it's constructor in a driver option. See example below.

### Usage examples

```js
const Memcache = require('memcache-pp')
const cacheManager = require('cache-manager')
const memcachedStore = require('cache-manager-memcached-store')

const memcachedCache = cacheManager.caching({
    store: memcachedStore,
    driver: Memcache,
    // http://memcache-plus.com/initialization.html - see options
    options: {
        hosts: ['127.0.0.1:11211']
    } 
})

const ttl = 30

// Compression must be manually set - see memcached-plus documentation
// The key must always be a string
// http://memcache-plus.com/set.html
memcachedCache.set('foo', 'bar', ttl, function(err) {
  if (err) {
    throw err
  }
    
  // http://memcache-plus.com/get.html
  memcachedCache.get('foo', function(err, result) {
      console.log(result)
      // >> 'bar'
      memcachedCache.del('foo', function(err) {})
  })
})
```
