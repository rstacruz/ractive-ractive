;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['ractive'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ractive'));
  } else {
    factory(root.Ractive);
  }

}(this, function (Ractive) {

  var Adaptor = Ractive.adaptors.Ractive = {
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
    if (!(child instanceof Ractive))
      return false;

    if (parent &&
        parent._ractiveWraps &&
        parent._ractiveWraps[keypath])
      return false;

    return true;
  }

  /*
   * Returns a wrapped Adaptor for Ractive.
   * See: http://docs.ractivejs.org/latest/writing-adaptor-plugins
   */

  function wrap (parent, child, keypath, prefixer) {
    var pause;
    setup();

    return {
      get: get,
      set: set,
      reset: reset,
      teardown: teardown
    };

    function setup () {
      checkForRecursion();
      markAsWrapped();

      // If the child has its own Ractive instances, recurse upwards.
      // This will do `parent.set('child.grandchild', instance)` so that
      // the `parent` can listen to the grandchild.
      parent.set(prefixer(get()));

      // Propagate child changes to parent.
      child.on('change', observer);

      if (Adaptor.fireWrapEvents) {
        child.fire('wrap', parent, keypath);
        parent.fire('wrapchild', child, keypath);
      }
    }

    function teardown () {
      delete parent._ractiveWraps[keypath];
      child.off('change', observer);

      if (Adaptor.fireWrapEvents) {
        child.fire('unwrap', parent, keypath);
        parent.fire('unwrapchild', child, keypath);
      }
    }

    function observer (updates) {
      if (pause) return;
      pause = true;
      parent.set(prefixer(updates));
      pause = false;
    }

    function get () {
      return child.get();
    }

    function set (key, value) {
      if (pause) return;
      pause = true;
      child.set(key, value);
      pause = false;
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
      if (keypath && keypath.length > Adaptor.maxKeyLength)
        throw new Error("Keypath too long (possible circular dependency)");
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

}));
