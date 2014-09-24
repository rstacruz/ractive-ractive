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
      // Usually happens on deeply-nested values.
      if (parent._ractiveWraps && parent._ractiveWraps[keypath]) {
        skipped = true;
        return;
      }

      // Register.
      if (!parent._ractiveWraps) parent._ractiveWraps = {};
      parent._ractiveWraps[keypath] = child;

      // If the child has its own Ractive instances, recurse upwards.
      if (child._ractiveWraps) {
        for (var key in child._ractiveWraps) {
          if (child._ractiveWraps.hasOwnProperty(key)) {
            var subchild = child._ractiveWraps[key];
            parent.set(keypath+'.'+key, subchild);
          }
        }
      }

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
