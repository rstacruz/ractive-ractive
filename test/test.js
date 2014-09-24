/* jshint expr: true */
var expect = require('chai').expect;
var Ractive = require('ractive');

var left, right, adapt;

describe('ractive-ractive', function () {
  before(function () {
    require('../index');
    adapt = Ractive.adaptors.Ractive;
  });

  /*
   * filter function
   */

  describe('filter', function () {
    it('works', function () {
      var obj = new Ractive();
      expect(adapt.filter(obj)).eql(true);
    });

    it('works for negatives: object', function () {
      var obj = {};
      expect(adapt.filter(obj)).eql(false);
    });

    it('works for negatives: array', function () {
      var obj = [];
      expect(adapt.filter(obj)).eql(false);
    });
  });

  /*
   * simple cases
   */

  describe('simple', function () {
    beforeEach(function () {
      left  = new Ractive({ adapt: ['Ractive'] });
      right = new Ractive({ adapt: ['Ractive'] });
    });

    it('.get works', function () {
      left.set('enabled', 1);
      right.set('left', left);

      expect(right.get('left.enabled')).eql(1);
    });

    it('propagates changes', function () {
      left.set('enabled', 1);
      right.set('left', left);
      left.set('enabled', 2);

      expect(right.get('left.enabled')).eql(2);
    });

    it('can observe changes', function (next) {
      var runs = 0;
      right.set('left', left);

      right.observe('left.enabled', function (val) {
        runs++;
        if (runs === 1) {
          expect(val).be.undefined;
        } else if (runs === 2) {
          expect(val).eql(2);
          next();
        }
      });

      left.set('enabled', 2);
    });
  });
});
