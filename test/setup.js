/* global describe */

/*
 * Set up a jsdom environment
 */

if (typeof process === 'object') {
  var mdescribe = require('mocha-repeat');
  var versions = require('./support/versions');

  global.expect = require('chai').expect;
  global.semver = require('semver');
  global.Adaptor = require('../index');
  global.Adaptor.maxKeyLength = 64; // faster tests

  /*
   * Make the Ractive instance act like how it would in the browser, ie, with
   * the adaptor autoloaded. Also disable DEBUG mode (introduced in 0.7) which
   * is needlessly noisy.
   */

  Object.keys(versions).forEach(function (version) {
    var Ractive = versions[version];
    Ractive.DEBUG = false;
    Ractive.adaptors.Ractive = global.Adaptor;
    Ractive.defaults.adapt = ['Ractive'];
  });

  /*
   * A sorta drop-in for `describe()` to run in multiple Ractive versions
   */

  global.suite = function (name, fn) {
    mdescribe(name, versions, function (Ractive) {
      Ractive.DEBUG = false;
      fn(Ractive);
    });
  };
} else {
  window.Ractive.defaults.adapt = ['Ractive'];
  window.Adaptor = window.Ractive.adaptors.Ractive;
  window.Adaptor.maxKeyLength = 64;
  window.expect = window.chai.expect;
  window.semver = window.semver;
  window.require = function () { /* noop */ };

  window.suite = function (name, fn) {
    describe(name, function () {
      fn(window.Ractive);
    });
  };
}
