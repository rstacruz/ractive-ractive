/**
 * mdescribe() : mdescribe(name, specs, fn)
 * makes multiple `describe` blocks that iterates through given `specs`.
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
 */

global.mdescribe = function (name, specs, fn) {
  Object.keys(specs).forEach(function (key) {
    var item = specs[key];
    describe(name + " (" + key + ")", function () {
      return fn.call(this, item, key);
    });
  });
};
