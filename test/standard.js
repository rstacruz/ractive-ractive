/* global it, describe */
var semistandard = require('mocha-standard/semistandard');

describe('coding style', function () {
  this.timeout(5000);
  it('conforms to semistandard', semistandard.files([
    'index.js', 'test/*.js'
  ]));
});
