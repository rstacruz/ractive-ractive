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
   * Ractive instance accessor methods that will be proxied by Ractive-Ractive.
   */
  
  var ractiveMethods = {
    add: {
      modifiesData: true,
      mapAllowed: false
    },
    animate: {
      modifiesData: true,
      mapAllowed: true
    },
    get: {
      modifiesData: false,
      mapAllowed: false
    },
    merge: {
      modifiesData: true,
      mapAllowed: false
    },
    observe: {
      modifiesData: false,
      mapAllowed: true
    },
    observeOnce: {
      modifiesData: false,
      mapAllowed: false
    },
    pop: {
      modifiesData: true,
      mapAllowed: false
    },
    push: {
      modifiesData: true,
      mapAllowed: false
    },
    set: {
      modifiesData: true,
      mapAllowed: true
    },
    shift: {
      modifiesData: true,
      mapAllowed: false
    },
    splice: {
      modifiesData: true,
      mapAllowed: false
    },
    subtract: {
      modifiesData: true,
      mapAllowed: false
    },
    toggle: {
      modifiesData: true,
      mapAllowed: false
    },
    unshift: {
      modifiesData: true,
      mapAllowed: false
    },
    update: {
      modifiesData: false,
      mapAllowed: false
    },
    updateModel: {
      modifiesData: false,
      mapAllowed: false
    }
  };

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
        parent._children &&
        parent._children[keypath])
      return false;

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
     * Initializes the adaptor.
     */

    function setup () {
      hookAccessors();
      checkForRecursion();
      updateRoot(parent.root);
      storeReferences();
      child.on('change', onChange);

      if (Adaptor.fireWrapEvents) {
        child.fire('wrap', parent, keypath);
        parent.fire('wrapchild', child, keypath);
      }
    }

    function teardown () {
      delete parent._children[keypath];
      delete child._parents[parent._guid];
      updateChildrenPattern();

      if (parent._childKeys.length === 0) {
        unhookAccessors();
      }

      // Assign the child as its own root
      updateRoot(child);

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
        if (typeof re[key] === 'undefined')
          re[key] = child.get(key);
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
     * Update the parent's child key RegEx pattern used by accessors
     */
    
    function updateChildrenPattern () {
      if (!parent._children) {
        delete parent._childrenPattern;
        return;
      }

      // Collect the current `_children` keys
      parent._childKeys = [];
      each(parent._children, function (value, key) {
        parent._childKeys.push(key);
      });

      if (parent._childKeys.length === 0) {
        delete parent._childrenPattern;
        return;
      }

      parent._childrenPattern = new RegExp("^(" + parent._childKeys.join(")\\..+?|(") + ")\\..+?$");
    }

    /*
     * Generates a Ractive accessor proxy for the given method and configuration.
     */
    
    function generateAccessor(method, config) {
      config = config || {};

      return function (keypath) {
        var child;
        var childKey;
        var result;
        
        // Exit early if there aren't any children or we're not targeting a keypath
        if (parent._childrenPattern == null || keypath == null) {
          return parent["_" + method].apply(parent, arguments);
        }

        // Handle a `key, value` set
        if (isString(keypath) === true) {
           childKey = parseAccessorKey(keypath);
           child = parent._children[childKey];

          // The key isn't a child of parent
          if (child == null) {
            return parent["_" + method].apply(parent, arguments);
          }

          // Remove the root of the key before marshalling it to the child
          arguments[0] = arguments[0].replace(childKey + ".", "");
          result = child[method].apply(child, arguments);

          if (config.modifiesData === true) {
            parent._update(childKey + "." + arguments[0]);
          }

          return result;
        }

        // Handle when only a value object is passed to the Ractive instance
        if (config.mapAllowed === true) {
          // Filter out and marshall keys which apply to children
          each(keypath, function (value, key) {
            childKey = parseAccessorKey(keypath);
            child = parent._children[childKey];

            if (child == null) {
              return;
            }
            
            delete keypath[key];

            // Remove the root of the key before marshalling it to the child
            key = key.replace(childKey + ".", "");
            child[method].call(child, key, value);

            if (config.modifiesData === true) {
              parent._update(childKey + "." + key);
            }
          });
        }

        // Default behavior
        return parent["_" + method].apply(parent, arguments);
      };
    }

    /*
     * Check all children to see if there are any matches and return the result.
     */

    function parseAccessorKey(keypath) {
      if (parent._childrenPattern == null) {
        return;
      }

      var childKeys = parent._childrenPattern.exec(keypath);

      if (childKeys == null) {
        return;
      }
      
      return childKeys[1];
    }

    /*
     * Overwrite the original Ractive methods with Ractive-Ractive accessor proxies.
     */
    
    function hookAccessors () {
      // Only hook the accessors once
      if (parent._accessorsHooked === true) {
        return;
      }
      
      parent._accessorsHooked = true;

      each(ractiveMethods, function (config, method) {
        parent["_" + method] = parent[method];
        parent[method] = generateAccessor(method, config);
      });
    }

    /*
     * Replace the Ractive-Ractive accessor proxies with the original implementations.
     */
    
    function unhookAccessors () {
      // Only hook the accessors once
      if (parent._accessorsHooked !== true) {
        return;
      }

      delete parent._accessorsHooked;

      each(ractiveMethods, function (config, method) {
        parent[method] = parent["_" + method];
        delete parent["_" + method];
      });
    }

    /*
     * Updates the root reference of the child and its descendants.
     */

    function updateRoot (root) {
      if (child._updateRoot == null) {
        child._updateRoot = function (root) {
          var args = arguments;

          this.root = root;

          if (this._ractiveWraps != null) {
            each(this._ractiveWraps, function (child) {
              // Prevent infinite recursion
              if (child.root === root) {
                return;
              }

              child._updateRoot.apply(child, args);
            });
          }
        };
      }

      child._updateRoot(root);
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

    function storeReferences () {
      if (!parent._children) parent._children = {};
      if (!child._parents) child._parents = {};
      
      parent._children[keypath] = child;
      child._parents[parent._guid] = parent;

      updateChildrenPattern();
    }
  }

  /*
   * Cross-browser forEach helper
   */

  function each (obj, fn) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) fn(obj[key], key);
    }
  }

  /*
   * isString helper
   */
  
   function isString (string) {
    return typeof string == 'string' || (!!string && typeof string == 'object' && Object.prototype.toString.call(string) == '[object String]');
   }
}));
