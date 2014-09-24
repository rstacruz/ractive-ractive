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
    var pause;
    setup();

    return {
      get: get,
      set: set,
      reset: reset,
      teardown: teardown
    };

    function setup () {
      child.on('change', observer);
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

    function set (keypath, value) {
      if (pause) return;
      pause = true;
      child.set(keypath, value);
      pause = false;
    }

    function reset (object) {
      if (object && object.constructor === Object) {
        child.set(object);
      } else {
        return false;
      }
    }

    function teardown () {
      child.off('change', observer);
    }
  }
}));
