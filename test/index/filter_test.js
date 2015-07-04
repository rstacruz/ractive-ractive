/* global it */
/* global expect, Adaptor, suite */
require('../setup');

suite('Filter', function (Ractive) {
  it('works', function () {
    var obj = new Ractive();
    expect(Adaptor.filter(obj)).toEqual(true);
  });

  it('works for negatives: object', function () {
    var obj = {};
    expect(Adaptor.filter(obj)).toEqual(false);
  });

  it('works for negatives: array', function () {
    var obj = [];
    expect(Adaptor.filter(obj)).toEqual(false);
  });
});
