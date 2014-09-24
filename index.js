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
   * and so on. There's usually no need to do that, but it helps in tests.
   */

  Adaptor.fireWrapEvents = true;
  Adaptor.maxKeyLength = 2048;

  function filter (child, keypath, parent) {
    if (!(child instanceof Ractive))
      return false;

    // If this key has been wrapped before, don't rewrap it. This can happen on
    // deeply-nested values, and .reset() for some reason.
    if (parent &&
        parent._ractiveWraps &&
        parent._ractiveWraps[keypath])
      return false;

    return true;
  }

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
      checkKeypath();

      // Let future wrappers know what we have wrapped Ractive instances.
      if (!parent._ractiveWraps) parent._ractiveWraps = {};
      parent._ractiveWraps[keypath] = child;

      // If the child has its own Ractive instances, recurse upwards.
      // This will do `parent.set('child.grandchild', instance)` so that
      // the `parent` can listen to the grandchild.
      parent.set(prefixer(get()));

      // Propagate child changes to parent.
      child.on('change', observer);

      // Fire wrap events
      if (Adaptor.fireWrapEvents) {
        child.fire('wrap', parent, keypath);
        parent.fire('wrapchild', child, keypath);
      }
    }

    function teardown () {
      delete parent._ractiveWraps[keypath];
      child.off('change', observer);

      // Fire wrap events
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

    function reset (object) {
      // Allow setting values by passing a POJO to .set(), for instance,
      // `.set('child', { ... })`. If anything else is passed onto .set()
      // (like another Ractive instance, or another adaptor'able), destroy
      // this wrapper.
      if (object && object.constructor === Object) {
        child.set(object);
      } else {
        return false;
      }
    }

    // keypath will look like 'child.sub.parent.child.sub.parent' ad nauseum.
    function checkKeypath () {
      if (keypath && keypath.length > Adaptor.maxKeyLength)
        throw new Error("Keypath too long (possible circular dependency)");
    }
  }

}));
