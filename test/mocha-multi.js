/**
 * mdescribe() : mdescribe(name, specs, fn)
 * Wakes multiple `describe` blocks that iterates through given `specs`.
 *
 *     stubs = {
 *       'jquery-1.9': require('../vendor/jquery-1.9.js'),
 *       'jquery-2.0': require('../vendor/jquery-2.0.js'),
 *       'jquery-2.1': require('../vendor/jquery-2.1.js'),
 *     };
 *
 *     mdescribe("Tests", stubs, function (jquery) {
 *       // tests here. `jquery` will be the values of stubs
 *     })
 *
 * If the `specs` has array values, they will be spread through the function
 * args:
 *
 *     stubs = {
 *       'bb1.0 + u1.2': [ backbone['1.0'], underscore['1.2'] ],
 *       'bb1.0 + u1.3': [ backbone['1.0'], underscore['1.3'] ],
 *       'bb1.0 + u1.4': [ backbone['1.0'], underscore['1.4'] ],
 *       'bb1.3 + u1.2': [ backbone['1.3'], underscore['1.2'] ],
 *       'bb1.3 + u1.3': [ backbone['1.3'], underscore['1.3'] ],
 *       'bb1.3 + u1.4': [ backbone['1.3'], underscore['1.4'] ],
 *     }
 *
 *     mdescribe("Tests", stubs, function (Backbone, _) {
 *     });
 */

global.mdescribe = function (name, specs, fn) {
  Object.keys(specs).forEach(function (key) {
    var item = specs[key];
    describe(name + " (" + key + ")", function () {
      var args = Array.isArray(item) ? item : [ item ];
      args.push(key);
      return fn.apply(this, args);
    });
  });
};
