/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


__webpack_require__(2)().resolve(

    // Synchrounus callback
    function (err, ds18x20) {

        if (err) { throw err; }

        module.exports = ds18x20;
    }
);


/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = function () {

	var Sandal = __webpack_require__(3),
		sandal = new Sandal();

	sandal
		// External dependencies
		.object('fs', __webpack_require__(4))
		.object('exec', Object(function webpackMissingModule() { var e = new Error("Cannot find module 'child_process'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()))
		.object('execSync', (__webpack_require__(5).run))

		// Configurations
		.object('driverBasePath', '/sys/bus/w1')
		.object('listPath', '/sys/devices/w1_bus_master1/w1_master_slaves')
		.object('basePath', '/sys/bus/w1/devices/')

		// Library components
		.service('ds18x20', __webpack_require__(6))

		.service('driver', __webpack_require__(8))
		.service('lister', __webpack_require__(9))
		.service('reader', __webpack_require__(11))
		.object('parser', __webpack_require__(12))

		// Logger functionality
		.object('logger', console)
	;

	return sandal;

};


/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);


var Sandal = (function () {

    var Sandal, _getArgumentNames, _register, _hasCircularDependencies, _callResolvedCallbacks, _createObjectSync, _resolve;

	_register = function (container, name, item) {
		if (name === 'done' || container[name]) {
			throw new Error(name + ' is already registered');
		}
		container[name] = item;
	};

	_getArgumentNames = function (func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if (argumentList === null) {
			argumentList = [];
		}
		return argumentList;
	};

	_hasCircularDependencies = function (dependencyNames, resolveChain) {
		var i, j;
		for (j = 0; j < dependencyNames.length; j++) {
			for (i = 0; i < resolveChain.length; i++) {
				if (resolveChain[i] === dependencyNames[j]) {
					return true;
				}
			}
		}
		return false;
	};

	_callResolvedCallbacks = function (err, item) {
		for (var i = 0; i < item.resolvedCallbacks.length; i++) {
            item.resolvedCallbacks[i](err);
		}
        item.resolvedCallbacks = [];
        item.isResolving = false;
	};

    _createObjectSync = function (item, dependencies) {
        if (item.ctor) {
            var obj = Object.create(item.ctor.prototype);
            item.ctor.prototype.constructor.apply(obj, dependencies);
            return obj;
        } else {
            return item.factory.apply(null, dependencies);
        }
    };

	_resolve = function (name, container, resolveChain, callback) {

		var i, obj, resolvingDone, isDone, item, dependencyNames, dependencyCount, dependencies, hasDoneCallback, resolvedDependenciesCount;

        resolveChain.push(name);

        item = container[name];

        if (!item) {
            callback(new Error('No implementation registered for ' + name));
            return;
        }

		resolvingDone = function (err, obj) {
            if (!isDone) {
                isDone = true;
                if (item.lifecycle === 'singleton') {
                    item.singleton = obj;
                    _callResolvedCallbacks(err, item);
                } else {
                    callback(err, obj);
                }
            }
        };

        if (item.lifecycle === 'singleton') {

            item.resolvedCallbacks = item.resolvedCallbacks || [];
            item.resolvedCallbacks.push(function (err) {
                callback(err, item.singleton);
            });

            if (item.isResolving) {
                return;
            }
            item.isResolving = true;

            if (item.hasOwnProperty('singleton')) {
				resolvingDone(null, item.singleton);
                return;
            }

        }

		if (!item.ctor && !item.factory) {
			resolvingDone(new Error('No valid implementation registered for ' + name));
			return;
		}

		dependencyNames = _getArgumentNames(item.ctor || item.factory);
		if (_hasCircularDependencies(dependencyNames, resolveChain)) {
			resolvingDone(new Error('There are circular dependencies in resolve chain: ' + resolveChain));
            return;
		}

		dependencyCount = dependencyNames.length;
		if (dependencyCount === 0) {
            try {
                obj = _createObjectSync(item, []);
				resolvingDone(null, obj);
            } catch (err) {
				resolvingDone(err);
            }
			return;
		}

		dependencies = [];
		hasDoneCallback = false;
		resolvedDependenciesCount = 0;
		for (i = 0; i < dependencyCount; i++) {

			(function (index) {

				var dependencyCallback = function (err, dependency) {

                    if (err) {
						resolvingDone(err);
						return;
					}
					dependencies[index] = dependency;
					resolvedDependenciesCount++;

					if (resolvedDependenciesCount === dependencyCount) {

                        try {
                            obj = _createObjectSync(item, dependencies);
                        } catch (err) {
							resolvingDone(err);
                        }

						if (!hasDoneCallback) {
							resolvingDone(null, obj);
						}
					}
				};

                if (dependencyNames[index] === 'done') {
                    hasDoneCallback = true;
					if (item.factory && hasDoneCallback) {
						dependencyCallback(null, resolvingDone);
					} else {
						dependencyCallback(null, function (err) {
							resolvingDone(err, obj);
						});
					}
                    return;
                }

				_resolve(dependencyNames[index], container, resolveChain.slice(0), dependencyCallback);

			})(i);

		}

	};

	Sandal = function () {
		this.clear();
	};

	Sandal.prototype.service = function (name, ctor, transient) {
		if (typeof ctor !== 'function') {
			throw new Error('Service "' + name + '" must be a function');
		}
		_register(this.container, name, {
			ctor: ctor,
			lifecycle: transient ? 'transient' : 'singleton'
		});
		return this;
	};

	Sandal.prototype.factory = function (name, factory, transient) {
		if (typeof factory !== 'function') {
			throw new Error('Factory "' + name + '" must be a function');
		}
		_register(this.container, name, {
			factory: factory,
			lifecycle: transient ? 'transient' : 'singleton'
		});
		return this;
	};

	Sandal.prototype.object = function (name, obj) {
		_register(this.container, name, {
			singleton: obj,
			lifecycle: 'singleton'
		});
		return this;
	};

	Sandal.prototype.resolve = function (arg1, arg2) {

		var that = this, callback, itemNames, itemCount, resolvedCount, resolved, i;

		if (typeof arg1 === 'string') {
            itemNames = [ arg1 ];
			callback = arg2;
		} else if (typeof arg1 === 'function') {
			callback = arg1;
		} else {
            itemNames = arg1;
			callback = arg2;
		}

		if (typeof callback !== 'function') {
			throw new Error('Callback function required');
		}

		if (!itemNames) {
            itemNames = _getArgumentNames(callback);
            itemNames = itemNames.splice(1);
		}

        itemCount = itemNames.length;
        if (itemCount === 0) {
            callback(null);
            return;
        }

		resolvedCount = 0;
		resolved = [];
		for (i = 0; i < itemCount; i++) {
			(function (index) {
				_resolve(itemNames[index], that.container, [], function (err, svc) {
					resolvedCount++;
					resolved[0] = resolved[0] || err;
					resolved[index + 1] = svc;
					if (resolvedCount === itemCount) {
						callback.apply({}, resolved);
					}
				});
			})(i);
		}
		return this;
	};

	Sandal.prototype.remove = function (names) {
		if (!names) {
			return this;
		}
		if (typeof names === 'string') {
			names = [ names ];
		}
		for (var i = 0; i < names.length; i++) {
			if (names[i] === 'sandal' || names[i] === 'done') {
				throw new Error('Removing ' + names[i] + ' is not allowed');
			}
			delete this.container[names[i]];
		}
		return this;
	};

	Sandal.prototype.clear = function () {
		this.container = {
			sandal: {
				singleton: this,
				lifecycle: 'singleton'
			}
		};
		return this;
	};

	return Sandal;

})();

if (module && module.exports) {
	module.exports = Sandal;
}

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),
/* 5 */
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// Generated by CoffeeScript 1.9.1
(function() {
  var child_process, create_pipes, dir, fs, i, len, name, proxy, read_pipes, ref, timeout, tmp_dir;

  child_process = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'child_process'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

  fs = __webpack_require__(4);

  tmp_dir = '/tmp';

  ref = ['TMPDIR', 'TMP', 'TEMP'];
  for (i = 0, len = ref.length; i < len; i++) {
    name = ref[i];
    if ((dir = process.env[name]) != null) {
      tmp_dir = dir.replace(/\/$/, '');
    }
  }

  timeout = function(limit, msg) {
    if ((new Date).getTime() > limit) {
      throw new Error(msg);
    }
  };

  create_pipes = function() {
    var created, t_limit;
    t_limit = (new Date).getTime() + 1000;
    while (!created) {
      try {
        dir = tmp_dir + '/sync-exec-' + Math.floor(Math.random() * 1000000000);
        fs.mkdir(dir);
        created = true;
      } catch (_error) {}
      timeout(t_limit, 'Can not create sync-exec directory');
    }
    return dir;
  };

  read_pipes = function(dir, max_wait) {
    var deleted, j, len1, pipe, read, ref1, result, t_limit;
    t_limit = (new Date).getTime() + max_wait;
    while (!read) {
      try {
        if (fs.readFileSync(dir + '/done').length) {
          read = true;
        }
      } catch (_error) {}
      timeout(t_limit, 'Process execution timeout or exit flag read failure');
    }
    while (!deleted) {
      try {
        fs.unlinkSync(dir + '/done');
        deleted = true;
      } catch (_error) {}
      timeout(t_limit, 'Can not delete exit code file');
    }
    result = {};
    ref1 = ['stdout', 'stderr', 'status'];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      pipe = ref1[j];
      result[pipe] = fs.readFileSync(dir + '/' + pipe, {
        encoding: 'utf-8'
      });
      read = true;
      fs.unlinkSync(dir + '/' + pipe);
    }
    try {
      fs.rmdirSync(dir);
    } catch (_error) {}
    result.status = Number(result.status);
    return result;
  };

  proxy = function(cmd, max_wait, options) {
    var err, orig_write, status, stderr, stdout, t0;
    options.timeout = max_wait;
    stdout = stderr = '';
    status = 0;
    t0 = (new Date).getTime();
    orig_write = process.stderr.write;
    process.stderr.write = function() {};
    try {
      stdout = child_process.execSync(cmd, options);
      process.stderr.write = orig_write;
    } catch (_error) {
      err = _error;
      process.stderr.write = orig_write;
      if (err.signal === 'SIGTERM' && t0 <= (new Date).getTime() - max_wait) {
        throw new Error('Timeout');
      }
      stdout = err.stdout, stderr = err.stderr, status = err.status;
    }
    return {
      stdout: stdout,
      stderr: stderr,
      status: status
    };
  };

  module.exports = function(cmd, max_wait, options) {
    var ref1;
    if (max_wait && typeof max_wait === 'object') {
      ref1 = [max_wait, null], options = ref1[0], max_wait = ref1[1];
    }
    if (options == null) {
      options = {};
    }
    if (!options.hasOwnProperty('encoding')) {
      options.encoding = 'utf8';
    }
    if (!(typeof options === 'object' && options)) {
      throw new Error('options must be an object');
    }
    if (max_wait == null) {
      max_wait = options.timeout || options.max_wait || 3600000;
    }
    if (!((max_wait == null) || max_wait >= 1)) {
      throw new Error('`options.timeout` must be >=1 millisecond');
    }
    delete options.max_wait;
    if (child_process.execSync) {
      return proxy(cmd, max_wait, options);
    }
    delete options.timeout;
    dir = create_pipes();
    cmd = '((((' + cmd + ' > ' + dir + '/stdout 2> ' + dir + '/stderr ) ' + '&& echo 0 > ' + dir + '/status) || echo 1 > ' + dir + '/status) &&' + ' echo 1 > ' + dir + '/done) || echo 1 > ' + dir + '/done';
    child_process.exec(cmd, options, function() {});
    return read_pipes(dir, max_wait);
  };

}).call(this);


/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var async = __webpack_require__(7);

var Ds18x20 = function (driver, lister, reader, parser) {
    this.driver = driver;
    this.lister = lister;
    this.reader = reader;
    this.parser = parser;
};

Ds18x20.prototype.isDriverLoaded = function (callback) {
	return this.driver.isLoaded(callback);
};

Ds18x20.prototype.loadDriver = function (callback) {
	return this.driver.load(callback);
};

Ds18x20.prototype.list = function (callback) {
    return this.lister.get(callback);
};

Ds18x20.prototype.get = function (input, callback) {

    var that = this,
        isArray = (input instanceof Array),
        ids = (isArray ? input : [input]);

    function parseResult(input) {

        var result = input.map(function (item) { return that.parser(item); });
        return (isArray ? result : result[0]);
    }

    if (typeof callback === "function") {

        return async.map(ids, function (id, done) {
            that.reader.read(id, function (err, result) {

                if (err) { return done(err); }
                return done(null, result);
            });
        }, function (err, results) {
            if (err) return callback(err);

            return callback(null, parseResult(results));
        });
    }

    return parseResult(ids.map(function (id) { return that.reader.read(id); }));
};

Ds18x20.prototype.getAll = function (callback) {

    function compileResult(idList, input) {

        var result = {};

        idList.forEach(function (key, index) { result[key] = input[index]; });

        return result;
    }

    if (typeof callback === "function") {

        var that = this;

        return this.list(function (err, idList) {

            if (err) { return callback(err); }
            that.get(idList, function (err, result) {

                if (err) { return callback(err); }
                callback(null, compileResult(idList, result));
            });
        });
    }

    var idList = this.list(),
        result = this.get(idList);

    return compileResult(idList, result);
};

Ds18x20.prototype.configure =  function(driverBasePath,basePath,listPath){
    if(driverBasePath !== undefined){
        this.driver.path=driverBasePath;
    }
    if(listPath !== undefined){
        this.lister.path=listPath;
    }
    if(basePath !== undefined){
        this.reader.basePath=basePath;
    }

};

module.exports = Ds18x20;


/***/ }),
/* 7 */
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                }
            }));
        });
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = function () {};
            }
        });

        _each(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor !== Array) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (test()) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            if (!test()) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if(data.constructor !== Array) {
              data = [data];
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain) cargo.drain();
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.compose = function (/* functions... */) {
        var fns = Array.prototype.reverse.call(arguments);
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // AMD / RequireJS
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
            return async;
        }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }
    // Node.js
    else {}

}());


/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";


function isSuperUser() { return (process.env['USER'] === 'root'); }


var Driver = function (fs, exec, execSync, driverBasePath) {
    this.fs = fs;
    this.exec = exec;
    this.execSync = execSync;
    this.path = driverBasePath;
};

Driver.prototype._isLoadedAsync = function (callback) {

	this.fs.exists(this.path, function (exists) {
		return callback(null, exists);
	});
};
Driver.prototype._isLoadedSync = function () {

	return this.fs.existsSync(this.path);
};

Driver.prototype._loadAsync = function (callback) {

    var that = this

    that.exec('modprobe w1-gpio', function (err) {

        if (err) { return callback(err); }

        return that.exec('modprobe w1-therm', function (err) {

            if (err) { return callback(err); }

            return callback();
        });
    });
};
Driver.prototype._loadSync = function () {

    return (this.execSync('modprobe w1-gpio') && this.execSync('modprobe w1-therm'));
};

Driver.prototype.isLoaded = function (callback) {

	if (typeof callback === "function") {
		return this._isLoadedAsync(callback);
	}

	return this._isLoadedSync();
};
Driver.prototype.load = function (callback) {

    var isAsync = (typeof callback === "function"),
        err;

	if (!isSuperUser()) {
        err = new Error('Cannot load modprobe driver when not root user');
        if (isAsync) { return callback(err); }
        throw err;
	}

    if (typeof callback === "function") {
        return this._loadAsync(callback);
    }

	return this._loadSync();
};

module.exports = Driver;


/***/ }),
/* 9 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var path = __webpack_require__(10);

var DeviceLister = function (fs, listPath) {
	this.fs = fs;
	this.path = listPath;
};

function toArray(buffer) {

	var result = buffer
        .toString()
        .split('\n')
        .map(function (i) { return i.trim(); });
	
	return result.filter(function (item) { return !!item; });
}

DeviceLister.prototype._readAsync = function (callback) {

	this.fs.readFile(this.path, function (err, content) {
        if (err) { return callback(err); }
		return callback(null, toArray(content));
	});
};

DeviceLister.prototype._readSync = function () {

	return toArray(this.fs.readFileSync(this.path));
};

DeviceLister.prototype.get = function (callback) {

	var isAsyncRequest = (!!callback && typeof callback === "function");

	if (isAsyncRequest) {
		return this._readAsync(callback);
	}

	return this._readSync();
};

module.exports = DeviceLister;


/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 11 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var path = __webpack_require__(10);

function checkErrors(err, deviceId) {

    if (err.code === 'ENOENT') {
        err = new Error('Could not read device content. Device \'' + deviceId + '\' not found');
    }

    return err;
}

var DeviceReader = function (fs, basePath) {
	this.fs = fs;
	this.basePath = basePath;
};

DeviceReader.prototype._getFileName = function (deviceId) {
	return path.resolve(this.basePath, deviceId, 'w1_slave');
};

DeviceReader.prototype._readAsync = function (deviceId, callback) {

	this.fs.readFile(this._getFileName(deviceId), function (err, result) {
        if (err) {
            return callback(checkErrors(err, deviceId));
        }
		return callback(null, result.toString());
	});
};

DeviceReader.prototype._readSync = function (deviceId) {

    try {
        var filename = this._getFileName(deviceId),
            result = this.fs.readFileSync(filename);

        return result.toString();

    } catch (err) {
        throw checkErrors(err, deviceId);
    }
};

DeviceReader.prototype.read = function (deviceId, callback) {

	var err,
		isAsyncRequest = (typeof callback === "function");

	if (!deviceId) {
		err = new Error('deviceId was not provided');
		if (isAsyncRequest) { return callback(err); }
		throw err;
	}

	if (isAsyncRequest) {
		return this._readAsync(deviceId, callback);
	}

	return this._readSync(deviceId);
};

module.exports = DeviceReader;


/***/ }),
/* 12 */
/***/ ((module) => {

"use strict";


function round(number, places) {
	var pow = Math.pow(10, places);
	return Math.round(number * pow) / pow;
}

module.exports = function (input) {

    if (input && input.indexOf('YES') > -1) {
        var temp = input.match(/t=(-?(\d+))/);

        if (temp)
            return round(parseInt(temp[1], 10) / 1000, 1);
    }

    return false;
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var sensor = __webpack_require__(1);
var tempObj = sensor.getAll();
console.log(tempObj);
})();

/******/ })()
;