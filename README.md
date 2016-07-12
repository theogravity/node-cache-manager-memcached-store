# Node Cache Manager store for Memcached
 
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com) [![Build Status](https://travis-ci.org/theogravity/node-cache-manager-memcached.svg?branch=master)](https://travis-ci.org/theogravity/node-cache-manager-memcached)

The Memcached store for the [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) module.

### Installation

```sh
npm i cache-manager-memcached --save
```
### Acknowledgements

Some of the project scaffolding and test/comments are lifted from [node-cache-manager-redis](https://github.com/dial-once/node-cache-manager-redis)

### Usage examples

```js
var cacheManager = require('cache-manager')
var memcachedStore = require('cache-manager-memcached')

var memcachedCache = cacheManager.caching({
    store: memcachedStore,
    host: 'localhost',
    port: 11211
    // https://github.com/3rd-Eden/memcached#options 
    memcached: { } 
})

// listen for memcached connection error event
// see https://github.com/3rd-Eden/memcached#events
// all events have memcached prepended to their event name
memcachedCache.store.events.on('memcachedFailure', function(error) {
    // handle error here
    console.log(error)
})

var ttl = 30

memcachedCache.set('foo', 'bar', ttl, function(err) {
  if (err) {
    throw err
  }
    
  memcachedCache.get('foo', function(err, result) {
      console.log(result)
      // >> 'bar'
      memcachedCache.del('foo', function(err) {})
  })
})
```