/**
 * Created by Rytis Alekna (r.alekna@gmail.com) on 2016-07-20.
 */
"use strict";
var yoke = (function() {

  /**
   * @typedef {Array} Binding
   * @property  0 - context
   * @property  1 - function
   * @property  2 - supplied data
   * @property  3 - bound function
   */

  yoke.CONTEXT_IS_FUNCTION_WARNING           = true;
  yoke.CONTEXT_IS_FUNCTION_EXCEPTION         = false;
  yoke.CONTEXT_IS_GLOBAL_OBJECT_WARNING      = true;
  yoke.CONTEXT_IS_GLOBAL_OBJECT_EXCEPTION    = false;

  var FUNCTION_BINDING_SUPPORTED = (typeof Function.prototype.bind === 'function');

  var globalStorage = [];
  var creatingInstance = false;

  /**
   * @private
   * @return {Binding[]}
   */
  function getStorage() {
    return globalStorage;
  }

  /**
   * @private
   * @param storage
   * @param context
   * @param fn
   * @param data
   * @return {Binding}
   */
  function getBinding(storage, context, fn, data) {
    return storage.filter(function filterStorageItem(item) {
      return item[0] === context && item[1] === fn; // && item[2] === data;
    })[0];
  }

  /**
   * @private
   * @param storage
   * @param context
   * @param fn
   * @param data
   * @return {*}
   */
  function createBinding(storage, context, fn, data) {
    var binding;
    var boundFn;
    if (binding = getBinding(storage, context, fn, data)) {
      return binding[3];
    }
    if (FUNCTION_BINDING_SUPPORTED) {
      boundFn = fn.bind.apply(fn, [context].concat(data));
    } else {
      boundFn = function boundFunction() {
        return fn.apply(context, data.concat(Array.prototype.slice.apply(arguments)));
      }
    }
    storage.push([context, fn, data, boundFn]);
    return boundFn;
  }

  function yoke(fnOrContext, context) {
    var fn;
    if (!creatingInstance) {
      if (typeof fnOrContext === 'undefined') {
        throw new Error('At least one argument must be specified!');
      }

      if (isGlobalObject(context)) {
        var message = 'Specified context is global object!';
        if (yoke.CONTEXT_IS_GLOBAL_OBJECT_WARNING) {
          console.log('WARNING: ' + message);
        }
        if (yoke.CONTEXT_IS_GLOBAL_OBJECT_EXCEPTION) {
          throw new Error(message);
        }
      }

      if (typeof context === 'undefined') {
        context = fnOrContext;
        // there might be a situations where in EcmaScript "strict mode" supplied `this` as context points to `undefined`, `window` or `global`
        if (typeof context === 'function') {
          var message = 'Specified context is type of function!';
          if (yoke.CONTEXT_IS_FUNCTION_WARNING) {
            console.log('WARNING: ' + message);
          }
          if (yoke.CONTEXT_IS_FUNCTION_EXCEPTION) {
            throw new Error(message);
          }
        }
      } else {
        fn = fnOrContext;
      }

      var data = Array.prototype.slice.call(arguments, 2);

      if (fn) {
        // don't create instance - return binding instead
        return createBinding(getStorage(), context, fn, data);
      }
    }

    if (this instanceof yoke) {
      context = fnOrContext;
      var storage = [];

      this.bind = function bind(fn) {
        return createBinding(storage, context, fn, Array.prototype.slice.call(arguments, 1));
      };

      this.clear = function clear() {
        storage.length = 0;
      };
      creatingInstance = false;
    } else {
      creatingInstance = true;
      return new yoke(context);
    }
  }

  return yoke;

})();
module.exports = yoke;

function isGlobalObject(object) {
  return object && (object.window === object || (object.global === object) || (typeof object.setInterval === 'function'));
}