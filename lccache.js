/**
 * lccache library
 * Copyright (c) 2011, Pamela Fox, John Munsch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Creates a namespace for the lccache functions.
 */
var lccache = function() {
  // Prefixes the key name on the expiration items in localStorage 
  var CACHESUFFIX = '-cacheexpiration';

  var supportsStorage = function () {
    // This is a temporary kludge. The old code performed its own tests but it
    // was looking specifically for localStorage. What we need to know is that
    // Lawnchair found some adapter that worked within the current environment.
    return true;
  }();

  // The old code checked to see if JSON was supported. Since we're using
  // Lawnchair, we can just pass through and assume that it will take JSON and
  // will give JSON back.
  // 
  // Note: If there's no native support for JSON in the browser, Lawnchair will
  // thrown an error instructing you to add json2.js to polyfill the 
  // functionality.

  /**
   * Returns the full string for the localStorage expiration item.
   * @param {String} key
   * @return {string}
   */
  function expirationKey(key) {
    return key + CACHESUFFIX;
  }

  /**
   * Returns the number of minutes since the epoch.
   * @return {number}
   */
  function currentTime() {
    return Math.floor((new Date().getTime())/60000);
  }

  return {

    /**
     * Stores the value in Lawnchair. Expires after specified number of minutes.
     * @param {string} key
     * @param {Object|string} value
     * @param {number} time
     */
    set: function(key, value, time) {
      if (!supportsStorage) return;

      // The lscache code turned anything non JSON into a string at this point.
      // We kind of need to go the other way. Anything non-JSON needs to become
      // JSON because that's what Lawnchair expects.
      if (typeof value != "object") {
        // We didn't get a JSON value, let's do something to create one.
        value = { "lccacheNonJSONValue": value };
      }

      try {
        Lawnchair(function () {
          var storedValue = {"key": key, "value": value};
          
          // If a time is specified, store expiration info as part of the JSON.
          if (time) {
            storedValue.expiration = currentTime() + time;
          }
          
          this.save(storedValue);
        });
      } catch (e) {
        if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name == 'NS_ERROR_DOM_QUOTA_REACHED') {
          // If we exceeded the quota, then we will sort
          // by the expire time, and then remove the N oldest
//          var storedKey, storedKeys = [];
//          for (var i = 0; i < localStorage.length; i++) {
//            storedKey = localStorage.key(i);
//            if (storedKey.indexOf(CACHESUFFIX) > -1) {
//              var mainKey = storedKey.split(CACHESUFFIX)[0];
//              storedKeys.push({key: mainKey, expiration: parseInt(localStorage[storedKey], 10)});
//            }
//          }
//          storedKeys.sort(function(a, b) { return (a.expiration-b.expiration); });
//
//          for (var i = 0, len = Math.min(30, storedKeys.length); i < len; i++) {
//            localStorage.removeItem(storedKeys[i].key);
//            localStorage.removeItem(expirationKey(storedKeys[i].key));
//          }
//          // TODO: This could still error if the items we removed were small and this is large
//          localStorage.setItem(key, value);
        } else {
          // If it was some other error, just give up.
          return;
        }
      }
    },

    /**
     * Retrieves specified value from localStorage, if not expired.
     * @param {string} key
     * @return {string|Object}
     */
    get: function(key) {
      if (!supportsStorage) return null;

      Lawnchair(function () {
        this.get(key, function (obj) {
          if (obj != null) {
            // Return the found item if not expired.
            if (obj.expiration != null) {
              // Check if we should actually kick item out of Lawnchair.
              if (currentTime() >= obj.expiration) {
                Lawnchair(function () {
                  this.remove(key);
                });
              } else {
                if (obj.value.lccacheNonJSONValue != null) {
                  return obj.value.lccacheNonJSONValue;
                } else {
                  return obj.value;                
                }
              }
            } else {
              // No expiration was specified. Just return what we found.
              if (obj.value.lccacheNonJSONValue != null) {
                return obj.value.lccacheNonJSONValue;
              } else {
                return obj.value;                
              }
            }
          }
        });
      });

      return null;
    },

    /**
     * Removes a value from Lawnchair.
     * Equivalent to 'delete' in memcache, but that's a keyword in JS.
     * @param {string} key
     */
    remove: function(key) {
      if (!supportsStorage) return null;
      
      Lawnchair(function () {
        this.remove(key);
      });
    }
  };
}();
