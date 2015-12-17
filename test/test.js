'use strict';
var mocha = require('mocha');
var assert = require('assert');

var EE = require('../lib/emmi').Emmi;
var em = new EE;

var emmi = require('../lib/emmi').emmi;

/*
var iit = it;
it = function(){}; 
//*/

describe('EE event emitter', function() {
	describe('Event emitter', function() {
		it('should have 1 event handler', function() {
			var em = new EE();
			em.on('test', function() {});
			assert.equal(em.getListeners('test').length, 1);
		});
		it('should have 2 event handlers', function() {
			var em = new EE();
			em.on('test', function() {});
			em.on('test', function() {});
			assert.equal(em.getListeners('test').length, 2);
		});
		it('should call 2 event handlers', function() {
			var em = new EE();
			var a = 0, b = 0;
			em.on('test', function() { a = 1; });
			em.on('test', function() { b = 1; });
			em.emit('test');
			assert.equal(a, 1);
			assert.equal(b, 1);
		});		
		it('shoudl call all event handlers', function() {
			var em = new EE(),
				res = {
					a: 0,
					ab: 0,
					a_asterix: 0,
					acd_asterix: 0
				};

			em.on('a', function() {
				res.a += 1;
			});

			em.on('a', function() {
			  res.a += 1;
			});

			em.on('a.b', function() {
			  res.ab += 1;
			});

			em.on('a.*', function() {
			  res.a_asterix += 1;
			});

			em.on('a.c.d.*', function(){
			  res.acd_asterix += 1;
			});

			em.emit('a', 1, 2, 3);
			em.emit('a.b');
			em.emit('a.c');
			em.emit('a.c.d');
			em.emit('a.c.d.e');

			assert.equal(res.a, 2);
			assert.equal(res.ab, 1);
			assert.equal(res.a_asterix, 5);
			assert.equal(res.acd_asterix, 1);			
		});

		it('should left with 1 event handler', function() {
			var em = new EE();

			var x = function(){},
				y = function(){};

			em.on('test', x);
			em.on('test', y);

			em.off('test', x);

			assert.equal(em.getListeners('test').length, 1);
		});	


		it('should add and remove all event handlers', function() {
			var em = new EE();
			em.on('test', function() {});
			em.on('test', function() {});
			em.on('test', function() {});

			em.offAll('test');

			assert.equal(em.getListeners('test').length, 0);
		});	

		it('shoudl call event handler once', function() {
			var em = new EE(),
				count = 0;

			em.once('a', function() {
			  count += 1;
			});

			for (var i = 0; i < 5; i++) {
				em.emit('a', 1);
			}

			assert(count === 1);
		});		

		it('shoudl call event handler 4 times', function() {
			var em = new EE(),
				count = 0;

			em.many('a', 4, function() {
			  count += 1;
			});

			for (var i = 0; i < 10; i++) {
				em.emit('a', 1);
			}

			assert(count === 4);
		});				

		it('shoudl call newListener event handler', function() {
			var em = new EE(),
				count = 0;

			em.on('newListener', function(){
				count += 1;
			});

			em.on('a', function() {});
			em.once('a', function() {});
			em.many('a', 4, function() {});

			assert(count === 3);
		});					

		it('should call event handler binded with wildcard selector', function(done){
			var em = new EE();

			em.on('*', function(){
				done();
			});
			em.emit('add');
		});

		it('should call event handler binded with wildcard selector', function(done){
			var em = new EE();

			var c = 0, expectedCalls = 2;
			function check() {
				c++;
				if ( c === expectedCalls ) {
					done();
				} else if ( c > expectedCalls ) {
					console.error('Callback fired '+c+' times. Expected '+expectedCalls);
				}
			}

			em.on('a.*', function(){
				check();
			});

			em.on('*', function(){
				check();
			});
			em.emit('a.b', 123);
		});		

		it('should call 2 event handlers ( with catch all )', function() {
			var em = new EE();
			var a = 0, b = 0;
			em.on('change.*', function() { a = 1; });
			em.on('change.f', function() { b = 1; });
			em.emit('change.f', 5, 6, 7);
			assert.equal(a, 1);
			assert.equal(b, 1);
		});

		it('should create emmi with the passed prototype', function(done) {
			var myObj = {
				shout: function(){
					return 'Hey! Hey! Hey!';
				}
			};
			var e = emmi(myObj);
			assert.equal(e.shout(), 'Hey! Hey! Hey!')
			e.on('x', function(){ done(); });
			e.emit('x');
		});		

		it('shoudl call asterics event handler on root event call', function(done) {
			// should call 'a.*' handler on emitting 'a'

			var em = new EE(),
				res = {
					a: 0,
					ab: 0,
					a_asterix: 0,
					acd_asterix: 0
				};

			em.on('a.*', function(v) {
			assert(v === 1);
			  done()
			});
			em.emit('a', 1);
		});		
	});
});