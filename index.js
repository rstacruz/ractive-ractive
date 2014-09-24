;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['ractive'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ractive'));
  } else {
    factory(root.Ractive);
  }

}(this, function (Ractive) {

  Ractive.adaptors.Ractive = {
    filter: isRactive,
    wrap: wrap
  };

  function isRactive (obj) {
    return obj instanceof Ractive;
  }

  function wrap (parent, child, keypath, prefixer) {
    var pause, skipped;
    setup();

    return {
      get: get,
      set: set,
      reset: reset,
      teardown: teardown
    };

    function setup () {
      // If this key has been wrapped before, don't rewrap it.
      // This can happen on deeply-nested values, and .reset() for some reason.
      if (parent._ractiveWraps && parent._ractiveWraps[keypath]) {
        skipped = true;
        return;
      }

      // Let future wrappers know what we have wrapped Ractive instances.
      if (!parent._ractiveWraps) parent._ractiveWraps = {};
      parent._ractiveWraps[keypath] = child;

      // If the child has its own Ractive instances, recurse upwards.
      // This will do `parent.set('child.grandchild', instance)` so that
      // the `parent` can listen to the grandchild.
      parent.set(prefixer(get()));

      child.on('change', observer);
    }

    function teardown () {
      if (skipped) return;

      delete parent._ractiveWraps[keypath];
      child.off('change', observer);
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
      if (object && object.constructor === Object) {
        child.set(object);
      } else {
        return false;
      }
    }
  }

}));
