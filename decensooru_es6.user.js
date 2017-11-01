// ==UserScript==
// @id             decensooru
// @name           decensooru
// @version        0.9.0.0
// @namespace      friendlyanon
// @author         friendlyanon
// @description    Addon for Better Better Booru to reveal hidden content.
// @license        WTFPL; http://www.wtfpl.net/about/
// @match          *://*.donmai.us/*
// @grant          none
// ==/UserScript==

/* This program is free software. It comes without any warranty, to the extent
 * permitted by applicable law. You can redistribute it and/or modify it under
 * the terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar. See http://www.wtfpl.net/ for more details. */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var regeneratorRuntime = require("regenerator-runtime/runtime");

/**
 * BASIC CONSTANTS
 */
var DEBUG_SAFE = false;
var d = document;
var w = window;
var notInDatabase = " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAMAAAAL34HQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABhQTFRF/52d//b2/9HRAAAA/8LC/7Ky/4iI/+LjcCOcXAAAA0BJREFUeNrsl4u2oyAMRSMHyv//8WhLK48AKtrGOwkrigHSwzZ4Z2gSaaSyVJbKUlkqS2WpLJWlslSWyurJ8vNVnAt+iefv14/mEFxbAhtNImteKi2R3wfBtCQ2pbWTlvc99xvmnLtWKq10T9yds6kyPjXWTcz4VBmXS0ui0UA1X+hiadWqrlWhE1PNvvJl8BvyF6ftEC0g3C+trStl4auysFeW+YaswOtKWqbafG0EZv651z1uWKwT2dgO0nrhAlNxuJyWadD6eEQm3FNeR/LPtExUk7H7LB73EdggnovQRzIfppK71R+gtdABx+UsWvsbwhWF1uIc4JCqAVoGEEnLFF8DRsdRWmY2H5wzz/Tx6gPp1PCVyoNlDp/1czfHaF3fyIg0CuQ8Q9NnfV+lvo55pu+Z9bXfC3GxtFTWH5Bl56s4F0xLYDtMy5roL9Gg2Qto4RJaIt8hT8v+vraGMyB9o8s/bk6gZUcNyQPelzHjadnsTVrmzdqMll3rH/ka26gU7rdOp1WGDtOyQ474Gc87RnPKpSVWlgteM9eMI16PZx/8Grex7wTTchIbre+w5rbzvHf9lnGptNzOvX/HD9JyA7GNtCQ2cmFPslwuLYlGTuRbzGhheJ84jdZqNksa7yGPczbH0ZtrK/dkfC8t/IKWKFmRNFAUI2YOmLXJPKTP+dapRME9r6HlP3j5Xp+x7BmtCYvuMsZNY0ORstCwXAFycUPwNELpqnQN4IpYmQfEZv5EspeDXrFsnYD2tNowMlqIdpHsHU1az5dR8GOoZnmQ5wnr3rneuEKtI61JrDUcHGktI1lDYb8U8n3mIuRqVBteFuY0aVUqIHvq0wLHOSOWZqEW+/qvdnWjk4ef4/g5TJ2gRwv9kwieTeskplVZVmpx1pFVfJG9OAVMHhRnqTg9JNQltlVfbFzcMfF8nJjxWh6qcHqPyKQl1SRW/J2Mq+pWxe85DdSJ342V2u3sMeSPk9aUMam0Vr15v9fohDlUicqlJa+RSJdKq32Gf8lT25lfHm0fWg/GqOGPSj+OPZjnXt40331osQAHjXbPv09t/d5IpoulJZKX4NpSWSpLZakslaWyVJbKUln/nax/AgwAE+Yw8Q3qDzQAAAAASUVORK5CYII=";
var postsAreObserved = void 0;

/**
 * VARIABLE TO HELP WITH STAGGERING REFRESHES IN `DataBase.pullBatch`
 */
var counter = 0;

/**
 * UTILITIES
 */
var $$ = function $$(a) {
  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : d;
  return b.querySelectorAll(a);
};
var $ = function $(a, b) {
  return $$(a, b)[0] || null;
};

$.keys = Object.keys;

$.extend = function (obj, props) {
  var _setAttribute = void 0,
      _event = void 0,
      _children = void 0,
      _dataset = void 0;
  if (props.hasOwnProperty("_setAttribute")) {
    _setAttribute = props._setAttribute;
    delete props._setAttribute;
  }
  if (props.hasOwnProperty("_children")) {
    _children = props._children;
    delete props._children;
  }
  if (props.hasOwnProperty("_event")) {
    _event = props._event;
    delete props._event;
  }
  if (props.hasOwnProperty("dataset")) {
    _dataset = props.dataset;
    delete props.dataset;
  }
  for (var i = 0, arr = $.keys(props), len = arr.length, key; i < len; ++i) {
    obj[key = arr[i]] = props[key];
  }
  if (obj instanceof Node) {
    if (_setAttribute) {
      var _props = _setAttribute,
          _arr = $.keys(_props);
      for (var _i = 0, _len = _arr.length, _key; _i < _len; ++_i) {
        obj.setAttribute(_key = _arr[_i], _props[_key]);
      }
    }
    if (_children) {
      var _arr2 = _children;
      for (var _i2 = 0, _len2 = _arr2.length; _i2 < _len2; ++_i2) {
        $.add(_arr2[_i2], obj);
      }
    }
    if (_event) {
      var _arr3 = $.keys(_event);
      for (var _i3 = 0, _len3 = _arr3.length, _key2, evt; _i3 < _len3; ++_i3) {
        var opts = [];
        if ((_key2 = _arr3[_i3]).endsWith("_o")) {
          evt = _key2.substring(0, _key2.length - 2);
          opts[0] = { once: true };
        }
        obj.addEventListener.apply(obj, [evt || _key2, _event[_key2]].concat(opts));
      }
    }
    if (_dataset) {
      $.extend(obj.dataset, _dataset);
    }
  }
  return obj;
};

$.extend($, {
  c: function c(_c, o) {
    var el = d.createElement(_c);
    return o ? $.extend(el, o) : el;
  },

  r: function () {
    var queue = [];
    d.addEventListener("DOMContentLoaded", function () {
      for (var i = 0, len = queue.length; i < len; ++i) {
        $.safe.apply($, [queue[i].fn].concat(_toConsumableArray(queue[i].args)));
      }
      queue = $.u;
    }, { once: true });
    return function (fn) {
      for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key3 = 1; _key3 < _len4; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      return queue ? queue[queue.length] = { fn: fn, args: args } : $.safe.apply($, [fn].concat(args));
    };
  }(),
  _rm: function _rm(el) {
    el.parentNode.removeChild(el);
  },
  rm: function rm(el) {
    $.safe($._rm, el);
  },
  _add: function _add(el, to) {
    to.appendChild(el);
  },
  add: function add(el) {
    var to = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : d.body;

    $.safe($._add, el, to);
    return el;
  },
  _replace: function _replace(o, n) {
    o.parentNode.replaceChild(n, o);
    return n;
  },
  replace: function replace(old, replacement) {
    return $.safe($._replace, old, replacement);
  },
  safe: function safe(fn) {
    var ret = void 0;
    try {
      for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key4 = 1; _key4 < _len5; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      ret = fn.apply(undefined, args);
    } catch (err) {
      if (DEBUG_SAFE) console.error(err);
    }
    return ret;
  },
  eval: function _eval() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    var script = $.c("script");
    if (typeof text === "function") {
      text = "(" + String(text) + ")()";
    }
    $.add(new Text(text), script);
    $.add(script, d.documentElement);
    $.rm(script);
  },
  get: function get(key) {
    return localforage.getItem(key);
  },
  set: function set(key, value) {
    if ($._regex[1].test(key)) {
      var _key$split = key.split(":");

      var _key$split2 = _slicedToArray(_key$split, 2);

      key = _key$split2[0];
      value = _key$split2[1];
    }
    if (++counter > 100) {
      counter = 0;
      localStorage.setItem("ayy", String(Math.random().toString(32)).substr(2));
    }
    return localforage.setItem(key, value);
  },
  propSet: function propSet(parent, prop, value) {
    parent[prop] = value;
  },

  u: void 0,
  _regex: [/^\/posts\/\d+$/,, /* 0 *//\d+:\w+\.(?:mp4|bmp|jpg|jpeg|gif|webm|png|zip)/i] /* 1 */
});

/**
 * SVG CONSTANTS
 */
var SVG = {
  spinner: 'px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring-alt"><rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect><circle cx="50" cy="50" r="40" stroke="#b4b197" fill="none" stroke-width="10" stroke-linecap="round"></circle><circle cx="50" cy="50" r="40" stroke="#f4efcc" fill="none" stroke-width="6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="1s" repeatCount="indefinite" from="0" to="502"></animate><animate attributeName="stroke-dasharray" dur="1s" repeatCount="indefinite" values="150.6 100.4;1 250;150.6 100.4"></animate></circle></svg>'
};
$.extend(SVG, {
  spinner100: '<svg width="100px" height="100' + SVG.spinner,
  spinner34: '<svg width="34px" height="34' + SVG.spinner
});

/**
 * NAMESPACES
 */
var Main = void 0,
    DataBase = void 0,
    Decensor = void 0;

/**
 * RESTORE THE `HIDDEN` THUMBNAILS OR IMAGE VIEW ON A POST'S PAGE
 */
Decensor = {
  listing: function listing(node) {
    var _this = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var href, path, id, md5, reveal;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              href = node.parentNode.getAttribute("href");
              path = href.split("?")[0];
              id = path.split("/").pop();
              _context.next = 5;
              return $.get(id);

            case 5:
              md5 = _context.sent;
              reveal = void 0;

              if (md5) {
                reveal = "/data/preview/" + md5.split(".")[0] + ".jpg";
              }
              node.setAttribute("src", reveal || notInDatabase);

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, _this);
    }))();
  },
  _notes: function _notes() {
    var D = w.Danbooru;
    D.Note.embed = "true" === D.meta("post-has-embedded-notes");
    D.Note.load_all("bbb");
    D.Note.initialize_shortcuts();
    D.Note.initialize_highlight();
    w.$(w).on("hashchange", D.Note.initialize_highlight);
  },
  notes: function notes(id) {
    var _this2 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var request, json, _children, i, len, note;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return fetch("/notes.json?group_by=note&search[post_id]=" + id);

            case 3:
              request = _context2.sent;
              _context2.t0 = JSON;
              _context2.next = 7;
              return request.json();

            case 7:
              _context2.t1 = _context2.sent;
              json = _context2.t0.parse.call(_context2.t0, _context2.t1);
              _children = [];

              for (i = 0, len = json.length; i < len; ++i) {
                note = json[i];

                _children[i] = $.c("article", {
                  id: note.id,
                  textContent: note.body,
                  dataset: {
                    x: note.x,
                    y: note.y,
                    width: note.width,
                    height: note.height,
                    body: note.body
                  }
                });
              }
              $.add($.extend(d.createDocumentFragment(), { _children: _children }), $("#notes"));
              _context2.next = 16;
              break;

            case 14:
              _context2.prev = 14;
              _context2.t2 = _context2["catch"](0);

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, _this2, [[0, 14]]);
    }))();
  },
  _post: function _post(e) {
    e.preventDefault();
    $.safe(w.Danbooru.Note.Box.toggle_all);
  },
  _error: function _error(_ref) {
    var e = _ref.currentTarget;

    e.src = "/cached" + e.getAttribute("src");
  },
  post: function post() {
    var _this3 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var id, data, parent, lastEl, _data$split, _data$split2, md5, ext, width, height, type, ugoira, img, _children;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              Main.postInit();
              $.safe($.propSet, $("#image-container object"), "id", "image");

              if (!$("#image")) {
                _context3.next = 4;
                break;
              }

              return _context3.abrupt("return");

            case 4:
              console.log("Post page mode");
              id = $("#post-information li").textContent.trim().split(" ")[1];
              _context3.next = 8;
              return $.get(id);

            case 8:
              data = _context3.sent;

              if (data) {
                _context3.next = 11;
                break;
              }

              return _context3.abrupt("return", $.replace(lastEl, $.c("img", {
                src: notInDatabase
              })));

            case 11:
              parent = $("#image-container");
              lastEl = parent.lastElementChild;

              $.safe(function () {
                return $("#bbb-notice-close").click();
              });
              _data$split = data.split("."), _data$split2 = _slicedToArray(_data$split, 2), md5 = _data$split2[0], ext = _data$split2[1];
              width = $("span[itemprop='width']").textContent.trim();
              height = $("span[itemprop='height']").textContent.trim();
              type = void 0, ugoira = void 0, img = void 0;
              _context3.t0 = ext;
              _context3.next = _context3.t0 === "swf" ? 21 : _context3.t0 === "zip" ? 25 : _context3.t0 === "webm" ? 26 : 29;
              break;

            case 21:
              type = "flash";
              $.replace(lastEl, $.c("object", {
                id: "image",
                innerHTML: "<params name=\"movie\" value=\"/data/" + data + "\"></params>",
                width: width, height: height
              }));
              img = $.add($.c("embed", {
                src: "/data/" + data,
                width: width, height: height, _setAttribute: { allowscriptaccess: "never" }
              }), $("params"));
              return _context3.abrupt("break", 31);

            case 25:
              ugoira = true;

            case 26:
              type = "video";
              img = $.replace(lastEl, $.c("video", {
                src: "/data/" + (ugoira ? "sample/sample-" : "") + (md5 + ".webm"),
                id: "image",
                autoplay: true,
                loop: true,
                controls: true,
                alt: parent.dataset.tags,
                _setAttribute: { style: "max-width: 100%" }
              }));
              return _context3.abrupt("break", 31);

            case 29:
              img = $.replace(lastEl, $.c("img", {
                src: "/data/" + data,
                id: "image",
                alt: parent.dataset.tags,
                _setAttribute: { style: "max-width: 100%" }
              }));
              return _context3.abrupt("break", 31);

            case 31:
              $.extend(img, {
                _event: { error_o: Decensor._error, load_o: Decensor.notes }
              });

              if (type) {
                _context3.next = 34;
                break;
              }

              return _context3.abrupt("return", $.add($.c("p", {
                className: "desc",
                textContent: d.title.substring(0, d.title.length - 11)
              }), parent));

            case 34:
              _children = ugoira ? [new Text(" | "), $.c("a", {
                textContent: "Toggle notes", href: "#",
                _event: { click: Decensor._post }
              })] : [];

              $.add($.c("p", {
                innerHTML: "<a href=\"/data/" + data + "\">Save this " + type + " (right click and save)</a>",
                _children: _children
              }), parent);

            case 36:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }))();
  }
};

/**
 * HANDLE THE RETRIEVAL AND UPDATE OF DATABASE
 */
DataBase = {
  notDone: true,
  batches: "https://cdn.rawgit.com/friendlyanon/decensooru/master/batches/",
  _initDB: function _initDB(_ref2) {
    var _this4 = this;

    var key = _ref2.key,
        newValue = _ref2.newValue;
    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var el, svg;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!(key === "ayy")) {
                _context4.next = 11;
                break;
              }

              if (!(newValue === "done")) {
                _context4.next = 10;
                break;
              }

              w.removeEventListener("storage", DataBase._initDB);
              _context4.next = 5;
              return $.get("db_version");

            case 5:
              DataBase.batchNumber = _context4.sent;

              localStorage.removeItem("ayy");
              Main.init();
              _context4.next = 11;
              break;

            case 10:
              if (newValue === "startInit") {
                DataBase.cleanUp();
              } else {
                el = $(".decensooru");

                if (el) {
                  svg = $("svg", el);

                  if (!svg) {
                    $.rm(el);
                  }
                }
                Main.postInit();
              }

            case 11:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, _this4);
    }))();
  },
  initDB: function initDB() {
    var _this5 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              $("body").classList.add("decensooru");
              $.add($.c("div", {
                id: "populating",
                innerHTML: "<div class=\"loadingSpinner\"><div>" + SVG.spinner100 + "</div></div><div class=\"loadingText\">Downloading batch #<span class=\"progress\">0</span> . . .<br /><br /><strong>Your browser might freeze for several minutes. Don't panic!</strong><br />This is the initial setup and will only occur this one time.<br />Future updates to the local database will happen in a non-intrusive way.<br />Happy Booru browsing!</div>"
              }));
              DataBase.displayProgress = $("#populating .progress").lastChild;
              DataBase.batchNumber = 0;

            case 4:
              if (!DataBase.notDone) {
                _context5.next = 9;
                break;
              }

              _context5.next = 7;
              return DataBase.pullBatch();

            case 7:
              _context5.next = 4;
              break;

            case 9:
              localStorage.setItem("ayy", "done");
              w.close();

            case 11:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, _this5);
    }))();
  },
  pullBatch: function pullBatch() {
    var _this6 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var _DataBase, batchNumber, request, networkError, _404;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _DataBase = DataBase, batchNumber = _DataBase.batchNumber;
              _context6.next = 4;
              return fetch(DataBase.batches + batchNumber);

            case 4:
              request = _context6.sent;
              networkError = true, _404 = false;

              switch (request.status) {
                case 404:
                  _404 = true;
                case 200:
                case 304:
                  networkError = false;
              }

              if (!_404) {
                _context6.next = 10;
                break;
              }

              DataBase.notDone = false;
              return _context6.abrupt("break", 22);

            case 10:
              if (!networkError) {
                _context6.next = 12;
                break;
              }

              throw new Error("Network error");

            case 12:
              $.safe($.propSet, DataBase.displayProgress, "data", batchNumber);
              _context6.t0 = Promise;
              _context6.next = 16;
              return request.text();

            case 16:
              _context6.t1 = $.set;
              _context6.t2 = _context6.sent.trim().split("\n").reverse().map(_context6.t1);
              _context6.next = 20;
              return _context6.t0.all.call(_context6.t0, _context6.t2);

            case 20:
              _context6.next = 22;
              return $.set("db_version", batchNumber);

            case 22:
              _context6.next = 27;
              break;

            case 24:
              _context6.prev = 24;
              _context6.t3 = _context6["catch"](0);

              DataBase.notDone = null;

            case 27:
              _context6.prev = 27;
              _context6.t4 = DataBase.notDone;
              _context6.next = _context6.t4 === true ? 31 : _context6.t4 === false ? 33 : _context6.t4 === null ? 35 : 36;
              break;

            case 31:
              ++DataBase.batchNumber;
              return _context6.abrupt("break", 36);

            case 33:
              _context6.next = 35;
              return $.set("timestamp", Date.now());

            case 35:
              DataBase.cleanUp();

            case 36:
              return _context6.finish(27);

            case 37:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, _this6, [[0, 24, 27, 37]]);
    }))();
  },
  update: function update() {
    var _this7 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              $.add($.c("div", {
                id: "update",
                className: "decensooru",
                innerHTML: SVG.spinner34 + "<br />Updating to #<span class=\"progress\">" + DataBase.batchNumber + "</span>"
              }));
              DataBase.displayProgress = $("#update.decensooru .progress").lastChild;

            case 2:
              if (!DataBase.notDone) {
                _context7.next = 7;
                break;
              }

              _context7.next = 5;
              return DataBase.pullBatch();

            case 5:
              _context7.next = 2;
              break;

            case 7:
              Main.pageMode();

            case 8:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, _this7);
    }))();
  },
  cleanUp: function cleanUp() {
    var _this8 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      var i, arr, len;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              for (i = 0, arr = $$(".decensooru"), len = arr.length; i < len; ++i) {
                $.rm(arr[i]);
              }

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, _this8);
    }))();
  }
};

/**
 * ENTRYPOINT
 */
Main = {
  _setup: function _setup() {
    var _this9 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              localforage.config({
                name: "hiddenContent"
              });
              _context9.next = 3;
              return localforage.ready();

            case 3:
              _context9.next = 5;
              return $.get("db_version");

            case 5:
              DataBase.batchNumber = _context9.sent;
              _context9.prev = 6;
              _context9.next = 9;
              return Main.init();

            case 9:
              _context9.next = 14;
              break;

            case 11:
              _context9.prev = 11;
              _context9.t0 = _context9["catch"](6);
              console.error(_context9.t0);
            case 14:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, _this9, [[6, 11]]);
    }))();
  },
  setup: function setup() {
    console.log("Decensooru!");
    $.add($.c("style", { textContent: Main.css }), d.head);
    Main.polyfill();
  },
  polyfill: function polyfill() {
    if (!w.fetch) {
      console.log("Polyfilling `fetch`");
      $.add($.c("script", {
        type: "text/javascript",
        src: "https://cdn.rawgit.com/github/fetch/master/fetch.js",
        _event: { load_o: Main.localForage }
      }), d.head);
    } else {
      Main.localForage();
    }
  },
  localForage: function localForage() {
    $.add($.c("script", {
      type: "text/javascript",
      src: "https://cdn.rawgit.com/mozilla/localForage/master/dist/localforage.js",
      _event: { load_o: Main._setup }
    }), d.head);
  },
  init: function init() {
    var _this10 = this;

    return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              if (!(location.pathname === "/" && location.search === "?initDB")) {
                _context10.next = 2;
                break;
              }

              return _context10.abrupt("return", DataBase.initDB());

            case 2:
              if (!(DataBase.batchNumber == null)) {
                _context10.next = 5;
                break;
              }

              w.addEventListener("storage", DataBase._initDB);
              return _context10.abrupt("return", $.add($.c("div", {
                id: "update",
                className: "decensooru",
                innerHTML: "Click here to begin initial Decensooru setup",
                _setAttribute: { style: "padding: 5px" },
                _event: {
                  click: function click() {
                    localStorage.setItem("ayy", "startInit");
                    return w.open(location.origin + "/?initDB", "initDB", "width=600,height=300,toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=0");
                  }
                }
              })));

            case 5:
              _context10.t0 = Date.now() - 288e5 /* 8 HOURS */;
              _context10.next = 8;
              return $.get("timestamp");

            case 8:
              _context10.t1 = _context10.sent;

              if (!(_context10.t0 > _context10.t1)) {
                _context10.next = 12;
                break;
              }

              ++DataBase.batchNumber;
              DataBase.update();

            case 12:
              $.safe(Main.pageMode);

            case 13:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, _this10);
    }))();
  },
  pageMode: function pageMode() {
    if (location.pathname.endsWith("/posts") && !postsAreObserved) {
      postsAreObserved = true;
      console.log("Post listing mode");
      var mutObserver = new MutationObserver(Main.postInit);
      mutObserver.observe(d.body, {
        childList: true,
        subtree: true
      });
      return Main.postInit();
    }
    if ($._regex[0].test(location.pathname) && !$("#image")) {
      return d.hidden ? setTimeout(Decensor.post, 500) : Decensor.post();
    }
  },
  postInit: function postInit() {
    var arr = $$("img[src^='data:image']");
    for (var i = 0, len = arr.length; i < len; ++i) {
      $.safe(Decensor.listing, arr[i]);
    }
  },

  css: "\nbody.decensooru > *:not(#populating) {\n  display: none ! important;\n}\n#populating {\n  text-align: center;\n  width: 100vw;\n  height: 100vh;\n}\n#populating > div {\n  height: 50vh;\n}\n.loadingSpinner {\n  position: relative;\n}\n.loadingSpinner > div {\n  position: absolute;\n  bottom: 0;\n  width: 100%;\n  text-align: center;\n}\n#update.decensooru {\n  background: white;\n  text-align: center;\n  display: inline-block;\n  position: fixed;\n  top: 0;\n  right: 0;\n  border-bottom: 1px solid black;\n  border-left: 1px solid black;\n  font-size: 16px;\n}\n"
};

Main.setup();
},{"regenerator-runtime/runtime":1}]},{},[2]);
