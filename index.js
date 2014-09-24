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

  function wrap (ractive, obj, keypath, prefixer) {
    var pause;
    var data = {};
    setup();

    return {
      get: get,
      set: set,
      reset: reset,
      teardown: teardown
    };

    function setup () {
      obj.on('change', observer);
    }

    function observer (updates) {
      if (pause) return;
      pause = true;
      ractive.set(prefixer(updates));
      pause = false;
    }

    function get () {
      return obj.get();
    }

    function set (keypath, value) {
      if (pause) return;
      pause = true;
      other.set(keypath, value);
      pause = false;
    }

    function reset (object) {
      console.log('reset');
      // if pojo, reset, else return false
      return false;
    }

    function teardown () {
      console.log('teardown');
    }
  }
}));
