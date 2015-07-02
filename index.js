/* global define, Ractive */
void (function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    Ractive.adaptors.Ractive = factory(root.Ractive);
  }

}(this, function () {

  var Adaptor = {
    filter: filter,
    wrap: wrap
  };

  /*
   * Advanced options:
   * You can adjust these settings via `Ractive.adaptors.Ractive.maxKeyLength`
   * and so on. There's usually no need to do that, but it may be good for
   * optimizing tests.
   */

  Adaptor.fireWrapEvents = true;
  Adaptor.maxKeyLength = 2048;

  /*
   * Check if the child is an Ractive instance.
   *
   * Also, if this key has been wrapped before, don't rewrap it. (Happens on
   * deeply-nested values, and .reset() for some reason.)
   */

  function filter (child, keypath, parent) {
    if (!isRactiveInstance(child)) return false;

    if (parent &&
        parent._ractiveWraps &&
        parent._ractiveWraps[keypath]) {
      return false;
    }

    return true;
  }

  /*
   * Global write lock.
   * This prevents infinite loops from happening where a parent will set a
   * value on the child, and the child will attempt to write back to the
   * parent, and so on.
   */

  var locked = Adaptor.locked = {};

  function lock (key, fn) {
    if (locked[key]) return;
    try {
      locked[key] = true;
      return fn();
    } finally {
      delete locked[key];
    }
  }

  /*
   * Returns a wrapped Adaptor for Ractive.
   * See: http://docs.ractivejs.org/latest/writing-adaptor-plugins
   */

  function wrap (parent, child, keypath, prefixer) {
    setup();

    return {
      get: get,
      set: set,
      reset: reset,
      teardown: teardown
    };

    /*
     * Initializes the adaptor. Performs a few tricks:
     *
     * [1] If the child has its own Ractive instances, recurse upwards. This
     * will do `parent.set('child.grandchild', instance)` so that the
     * `parent` can listen to the grandchild.
     */

    function setup () {
      checkForRecursion();
      markAsWrapped();
      parent.set(prefixer(get())); // [1]
      child.on('change', onChange);

      if (Adaptor.fireWrapEvents) {
        child.fire('wrap', parent, keypath);
        parent.fire('wrapchild', child, keypath);
      }
    }

    function teardown () {
      delete parent._ractiveWraps[keypath];
      child.off('change', onChange);

      if (Adaptor.fireWrapEvents) {
        child.fire('unwrap', parent, keypath);
        parent.fire('unwrapchild', child, keypath);
      }
    }

    /*
     * Propagate changes from child to parent.
     * We well break it apart into key/vals and set those individually because
     * some values may be locked.
     */

    function onChange (updates) {
      each(updates, function (value, key) {
        lock(child._guid + key, function () {
          parent.set(keypath + '.' + key, value);
        });
      });
    }

    /*
     * Returns all attributes of the child, including computed properties.
     * See: https://github.com/ractivejs/ractive/issues/1250
     */

    function get () {
      // Optimization: if there are no computed properties, returning all
      // non-computed data should suffice.
      if (!child.computed) return child.get();

      var re = {};

      each(child.get(), function (val, key) {
        re[key] = val;
      });

      each(child.computed, function (_, key) {
        if (typeof re[key] === 'undefined') {
          re[key] = child.get(key);
        }
      });

      return re;
    }

    function set (key, value) {
      lock(child._guid + key, function () {
        child.set(key, value);
      });
    }

    /*
     * Allow setting values by passing a POJO to .set(), for instance,
     * `.set('child', { ... })`. If anything else is passed onto .set()
     * (like another Ractive instance, or another adaptor'able), destroy
     * this wrapper.
     */

    function reset (object) {
      if (object && object.constructor === Object) {
        child.set(object);
      } else {
        return false;
      }
    }

    /*
     * Die on recursion.
     * Keypath will look like 'child.sub.parent.child.sub.parent' ad nauseum.
     */

    function checkForRecursion () {
      if (keypath && keypath.length > Adaptor.maxKeyLength) {
        throw new Error('Keypath too long (possible circular dependency)');
      }
    }

    /*
     * Let future wrappers know what we have wrapped Ractive instances.
     * This value is used on `filter()`.
     */

    function markAsWrapped () {
      if (!parent._ractiveWraps) parent._ractiveWraps = {};
      parent._ractiveWraps[keypath] = child;
    }
  }

  /*
   * Cross-browser forEach helper.
   */

  function each (obj, fn) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) fn(obj[key], key);
    }
  }

  /*
   * Check if an `obj instanceof Ractive`. This check will not require a
   * reference to the root Ractive instance.
   */

  function isRactiveInstance (obj) {
    return obj && obj.constructor &&
      typeof obj._guid === 'string' &&
      typeof obj.set === 'function' &&
      typeof obj.off === 'function' &&
      typeof obj.on === 'function' &&
      typeof obj.constructor.defaults === 'object';
  }

  return Adaptor;

}));
