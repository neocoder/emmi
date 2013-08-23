
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();

var Emmi = require('../../lib/emmi').Emmi;
var em = new Emmi();

var EventEmitter2 = require('eventemitter2').EventEmitter2;
var emitter2 = new EventEmitter2({
  wildcard: true, // should the event emitter use wildcards.
  delimiter: '.', // the delimiter used to segment namespaces, defaults to `.`.
});

suite

  .add('EventEmitter2', function() {
    emitter2.on('test2.a.b', function () { 1==1; });
    emitter2.on('test2.a.*', function () { 2==2; });
    emitter2.on('test2.*', function () { 3==3; });
    emitter2.emit('test2.a.b');
    emitter2.removeAllListeners('test2.a.b');
    emitter2.removeAllListeners('test2.a.*');
    emitter2.removeAllListeners('test2.*');

  })
  .add('Emmi', function() {
    em.on('test2.a.b', function () { 1==1; });
    em.on('test2.a.*', function () { 2==2; });
    em.on('test2.*', function () { 3==3; });
    em.emit('test2.a.b');
    em.offAll('test2.a.b');
    em.offAll('test2.a.*');
    em.offAll('test2.*');

  })

  .on('cycle', function(event, bench) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })

  .run({ async: true });