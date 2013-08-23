# Emmi

Emmi is a an event emitter library with event namespaces and wildcards.
Emmi is inspired by the hij1nx's EventEmitter2.

## Main goals

 - Wildcard support
 - Small size
 - Speed 
 - Should work in node and in browsers
 
## Performance
EventEmitter2 is configured with wildcard support here.
```
EventEmitter2 x 53,722 ops/sec ±0.58% (95 runs sampled)
Emmi x 272,354 ops/sec ±0.80% (96 runs sampled)
Fastest is Emmi
```
 
Note: EventEmitter2 is a way faster than Emmi in standard mode(without namespaces and wildcards). You can check the EventEmitter performance stats here https://github.com/hij1nx/EventEmitter2.

## API

#### Special event `newListener`

And event emitter object emits the `newListener` event when new listeners are
added.

#### Event names convention

`.` character is an event namespace separator.
`*` character is used to define catch-all event handlers for eg. 'a.b.*' which will be fired when any
underlying event( like 'a.b.c', 'a.b.c.d', etc. ) is fired.

#### emitter.on(event, listener)

Adds a listener to the listeners array for the specified event.

```javascript
    emitter.on('data', function() {
      console.log('The "data" event was fired!');
    });
```

#### emitter.once(event, listener)

Adds a self removing listener for the event. The listener is called only once when the event is fired for the first time, then the listener is removed.

```javascript
    emitter.once('chunk', function (value) {
      console.log('We got the first data chunk!');
    });
```

#### emitter.many(event, runCount, listener)

This is an extension of the `once` method. The listener will be executed **runCount** times before it will be removed.
```javascript
    emitter.many('get', 4, function (value) {
      console.log('This event will be listened to exactly four times.');
    });
```

#### emitter.off(event, listener)

Removes a listener from the listeners array for the specified event.

```javascript
    var callback = function(value) {
      console.log('someone connected!');
    };
    server.on('get', callback);
    // ...
    server.removeListener('get', callback);
```


#### emitter.offAll(event)

Removes all listeners of the specified event.

#### emitter.getListeners(event)

Returns an array of listeners for the specified event. This array **cannot** be manipulated, to remove listeners use the `off` method.

```javascript
    server.on('get', function(value) {
      console.log('someone connected!');
    });
    console.log(console.log(server.getListeners('get')); // [ [Function] ]
```

#### emitter.emit(event, [arg1], [arg2], [...])

Execute each of the listeners that may be listening for the specified event name in order with the list of arguments.

## Tests

Run `mocha` form the project directory to run the test suite.

## Licence

(The MIT License)

Copyright (c) 2013 Alex Ladyga <http://tweakmode.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

