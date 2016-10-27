# Node Cache Manager store for Memcached
 
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com) [![Build Status](https://travis-ci.org/theogravity/node-cache-manager-memcached-store.svg?branch=master)](https://travis-ci.org/theogravity/node-cache-manager-memcached-store) [![npm version](https://badge.fury.io/js/cache-manager-memcached-store.svg)](https://badge.fury.io/js/cache-manager-memcached-store)

The Memcached store for the [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) module and uses [memcached-plus](https://github.com/victorquinn/memcache-plus) as the underlying memcache library.

### Installation

```sh
npm i cache-manager-memcached-store --save
```

### Acknowledgements

Some of the project scaffolding and test/comments are lifted from [node-cache-manager-redis](https://github.com/dial-once/node-cache-manager-redis)

### Usage examples

```js
var cacheManager = require('cache-manager')
var memcachedStore = require('cache-manager-memcached-store')

var memcachedCache = cacheManager.caching({
    store: memcachedStore,
    // http://memcache-plus.com/initialization.html - see options
    options: {
        hosts: ['127.0.0.1:11211']
    } 
})

var ttl = 30

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
