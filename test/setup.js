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

  global.suite = function (name, fn) {
    mdescribe(name, versions, fn);
  };
} else {
  window.Adaptor = window.Ractive.adaptors.Ractive;
  window.Adaptor.maxKeyLength = 64;
  window.expect = window.chai.expect;
  window.semver = window.semver;

  window.suite = function (name, fn) {
    describe(name, function () {
      fn(window.Ractive);
    });
  };
}
