/*
var tree = {
	a: {
		_listeners: [

		],
		_all: [

		],
		b: {
			_listeners: [],
			_all: [],
			c: {
				_listeners: [
					function(){ return true; },
				]
			}
		}
	},
	_all: [
	]
}

x.on('a');
x.on('a.b.c');
x.on('a.*');

x.emit('a.b.c', 1);
//*/


(function(exports, undefined) {

	"use strict";

	function extend(target, source) {
		for ( var p in source ) {
			if ( source.hasOwnProperty(p) ) {
				target[p] = source[p];
			}
		}
	}

	function Emmi() {
		this.handlersMap = {};
		this.tree = {};
		this._newEventListeners = [];
	}

	var proto = Emmi.prototype;

	// a.b.c

	// a._all
	// b._all
	// c._listeners

	proto.getListeners = function(name) {
		var i,
			na = name.split('.'),
			len = na.length,
			last = len-1,
			t = this.tree,
			branch,
			listeners = t._all ? [].concat(t._all) : [];

		if ( len === 1 ) {
			if ( t[name] ) {
				if ( t[name]._listeners ) { listeners = listeners.concat(t[name]._listeners); }
				if ( t[name]._all ) { listeners = listeners.concat(t[name]._all); }				
			}
			return listeners;
		}

		// a.b.c

		// _all - already concatenated at the top
		// a._all
		// a.b._all
		// a.b.c._listeners


		for (i = 0; i < len; i++) {
			branch = na[i];

			if ( !t[branch] ) { return listeners; }

			t = t[branch];

			if ( t._all && i !== last ) {
				listeners = listeners.concat(t._all);
			}
		}

		if ( t && t._listeners ) { // if we got to the last section
			listeners = listeners.concat(t._listeners);
		}

		return listeners;
	};

	proto._debugTree = function(){
		if ( typeof require !== 'undefined' ) {
			var util = require('util');
			console.log(util.inspect(this.tree, { showHidden: true, depth: null }));
		} else {
			console.log(this.tree);
		}
	};

	proto.on = function(name, handler) {

		if ( name.indexOf(',') >= 0 ) {
			var that = this;
			name.split(/\s*,\s*/).forEach(function(evName) {
				that.on(evName, handler);
			});
			return;
		}

		if ( name === 'newListener' ) { return this._addNewEventListener(handler); }

		var i, et,
			na = name.split('.'),
			len = na.length,
			branch,
			t = this.tree;

		for (i = 0; i < len; i++) {
			branch = na[i];

			if ( branch !== '*' ) {
				if ( typeof t[branch] === 'undefined' ) { t[branch] = {}; }
				t = t[branch];
			}
		}

		// last banch name
		et = ( branch === '*' ) ? '_all' : '_listeners';

		if ( !t[et] ) {
			t[et] = [handler];
		} else {
			if (Emmi.handlersLimit && t[et].length > Emmi.handlersLimit ) { throw new Error('You are trying to add to many('+t[et].length+') handlers to '+name+', '+handler.toString()); }
			t[et].push(handler);
		}
		// emitting newListener event
		if ( this._newEventListeners.length > 0 ) {
			this._emitNewEventListener(name, handler);
		}
		// returning off function
		return function(){
			this.off(name, handler);
		}.bind(this);
	};

	proto.off = function(name, cb) {
		if ( name === 'newListener' ) { return this._removeNewEventListener(cb); }
		return this.removeListeners(name, cb);
	};

	proto.many = function(name, runCount, cb) {
		var that = this;

		function wrapper() {
		  if (--runCount === 0) {
		  	that.off(name, wrapper);
		  }
		  cb.apply(this, arguments);
		}

		wrapper._handler = cb;

		this.on(name, wrapper);

		return this;
	};

	proto.once = function(name, cb) {
		return this.many(name, 1, cb);
	};

	proto.removeListeners = function(name, cb) {
		var i, et,
			na = name.split('.'),
			len = na.length,
			branch,
			t = this.tree;

		for (i = 0; i < len; i++) {
			branch = na[i];

			if ( branch !== '*' ) {
				if ( !t[branch] ) { return; }
				t = t[branch];
			}
		}

		// last banch name
		et = ( branch === '*' ) ? '_all' : '_listeners';

		var handlers = t[et];

		if ( handlers ) {
			var idx = handlers.indexOf(cb);
			if ( idx > -1 ) {
				handlers.splice(idx, 1);
			}
		}
		return this;
	};

	proto.removeAllListeners = function(name) {
		if ( name === 'newListener' ) { return this._removeAllNewEventListeners(); }

		var i, et,
			na = name.split('.'),
			len = na.length,
			branch,
			t = this.tree;

		for (i = 0; i < len; i++) {
			branch = na[i];

			if ( branch !== '*' ) {
				if ( !t[branch] ) { return; }
				t = t[branch];
			}
		}

		// last banch name
		et = ( branch === '*' ) ? '_all' : '_listeners';

		if ( t[et] ) {
			t[et] = null;
		}
		return this;
	};

	proto.offAll = proto.removeAllListeners;

	proto.emit = function(name) {
		var i, j, listener, len;

		this.event = name;

		var listeners = this.getListeners(name);

		for (i = 0, len = listeners.length; i < len; i++) {
			listener = listeners[i];

			if (arguments.length === 1) {
				listener.call(this);
			} else if ( arguments.length > 1 ) {
				switch (arguments.length) {
					case 2:
						listener.call(this, arguments[1]);
						break;
					case 3:
						listener.call(this, arguments[1], arguments[2]);
						break;
					default:
						var l = arguments.length,
							args = [];
						for (j = 1; j < l; j++) { args[j - 1] = arguments[j]; }
						listener.apply(this, args);
				}
			}
		}
	};


	proto._addNewEventListener = function(cb) {
		return this._newEventListeners.push(cb);
	};

	proto._removeNewEventListener = function(cb) {
		var handlers = this._newEventListeners,
			idx = handlers.indexOf(cb);

		if ( idx > -1 ) {
			handlers.splice(idx, 1);
		}
	};

	proto._removeAllNewEventListeners = function() {
		this._newEventListeners = [];
	};

	proto._emitNewEventListener = function(eventName, cb) {
		var i, len, listeners = this._newEventListeners;

		for (i = 0, len = listeners.length; i < len; i++) {
			listeners[i].call(this, eventName, cb);
		}
	};

	exports.emmi = function(oldObject) {
		oldObject = oldObject || {};
		var o = Object.create(oldObject);
		extend(o, proto);
		Emmi.apply(o);
		return o;
	};

	exports.Emmi = Emmi;

}(typeof module !== 'undefined' ? module.exports : this));
