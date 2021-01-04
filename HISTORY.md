# 2.3.0 (2021-01-04)

* Updated `memcache-plus` version to 0.2.22

# 2.2.0 (2019-10-18)

* Updated `memcache-plus` version to 0.2.20

# 2.1.0 (2016-10-27)

  * The API for sending options through was incorrect.
  * Because of the fix, the `hosts` was defaulted to the library default.
  * `hosts` must always be an array

# 2.0.0 (2016-10-24)

  * Replace `memcached` library with `memcached-plus`. 
    * There are slight changes to the API (eg the absence of an event listener) and you can only use a string as a key. 
    * The library also includes Amazon elasticache discovery support as well.
    * See [http://memcache-plus.com/](http://memcache-plus.com/) for options information

# 1.1.0 (2016-07-13)

  * Implement `keys` method. May be slow to use.

# 1.0.1 (2016-07-13)

  * Fix bug where in `set`, sending `options` as an object does not get used at all

# 1.0.0 (2016-07-11)

  * First release
