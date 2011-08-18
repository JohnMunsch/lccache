lccache
===============================
This is a port of Pamela Fox's nifty little library 
[lscache](https://github.com/pamelafox/lscache) to use 
[Lawnchair](http://westcoastlogic.com/lawnchair/) for 
storage rather than HTML5 localStorage. 

In either case, if what you need is a simple library that emulates `memcache` 
functions so that you can cache data on the client and associate an expiration 
time with each piece of data, then you want one of these libraries. The question
you need to answer is, "Do I only need to support newer browsers that have HTML5 
localStorage, or will I need to support older browsers as well?" If the former, 
lscache is your ticket, if the latter, please check out this version.

Methods
-------

The library exposes 3 methods: `set()`, `get()`, and `remove()`.

* * *

### lccache.set
Stores the value in Lawnchair. Expires after specified number of minutes.
#### Arguments
1. `key` (**string**)
2. `value` (**Object|string**)
3. `time` (**number: optional**)

* * *

### lccache.get
Retrieves specified value from Lawnchair, if not expired.
#### Arguments
1. `key` (**string**)
#### Returns
**string | Object** : The stored value.

* * *

### lccache.remove
Removes a value from Lawnchair.
#### Arguments
1. `key` (**string**)


Usage
-------

The interface should be familiar to those of you who have used `memcache`, and 
should be easy to understand for those of you who haven't.

For example, you can store a string for 2 minutes using `lccache.set()`:

```js
lccache.set('greeting', 'Hello World!', 2);
```

You can then retrieve that string with `lccache.get()`:

```js
alert(lccache.get('greeting'));
```

You can remove that string from the cache entirely with `lccache.remove()`:

```js
lccache.remove('greeting');
```

The library handles JSON objects so you aren't restricted to only storing strings:

```js
lccache.set('data', {'name': 'Pamela', 'age': 26}, 2);
```

And then when you retrieve it, you will get it back as an object:

```js
alert(lccache.get('data').name);
```

For more live examples, play around with the demo here:
http://johnmunsch.github.com/lccache/demo.html


Real-World Usage
----------
These are the original examples given by Pamela, note that I've not changed any 
of the references from lscache to lccache because she used lscache for all of 
her work. However, the examples of why you want to use something like this are 
just as relevant to both libraries.

This library was originally developed with the use case of caching results of 
JSON API queries to speed up my webapps and give them better protection against 
flaky APIs. (More on that in this [blog post](http://blog.pamelafox.org/2010/10/lscache-localstorage-based-memcache.html))

For example, [RageTube](http://ragetube.net) uses `lscache` to fetch Youtube API 
results for 10 minutes:

```js
var key = 'youtube:' + query;
var json = lscache.get(key);
if (json) {
  processJSON(json);
} else {
  fetchJSON(query);
}

function processJSON(json) {
  // ..
}

function fetchJSON() {
  var searchUrl = 'http://gdata.youtube.com/feeds/api/videos';
  var params = {
   'v': '2', 'alt': 'jsonc', 'q': encodeURIComponent(query)
  }
  JSONP.get(searchUrl, params, null, function(json) {
    processJSON(json);
    lscache.set(key, json, 60*10);
  });
}
```

It does not have to be used for only expiration-based caching, however. It can 
also be used as just a wrapper for `localStorage`, as it provides the benefit 
of handling JS object (de-)serialization.

For example, the [QuizCards](http://quizcards.info) Chrome extensions use 
`lscache` to store the user statistics for each user bucket, and those stats are 
an array of objects.

```js
function initBuckets() {
  var bucket1 = [];
  for (var i = 0; i < CARDS_DATA.length; i++) {
    var datum = CARDS_DATA[i];
    bucket1.push({'id': datum.id, 'lastAsked': 0});
  }
  lscache.set(LS_BUCKET + 1, bucket1);
  lscache.set(LS_BUCKET + 2, []);
  lscache.set(LS_BUCKET + 3, []);
  lscache.set(LS_BUCKET + 4, []);
  lscache.set(LS_BUCKET + 5, []);
  lscache.set(LS_INIT, 'true')
}
```

Browser Support
----------------

The `lccache` library should work in all browsers for which a Lawnchair adapter
exists. At the time of writing there were adapters for storing data in 
localStorage, the Blackberry persistent store, window name, Google Gears SQLite,
IE userdata, Indexed DB, and memory.

The current list of those is here:
http://westcoastlogic.com/lawnchair/adapters/

