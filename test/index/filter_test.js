/* global it */
/* global expect, Adaptor, suite */
require('../setup');

suite('Filter', function (Ractive) {
  it('works', function () {
    var obj = new Ractive();
    expect(Adaptor.filter(obj)).eql(true);
  });

  it('works for negatives: object', function () {
    var obj = {};
    expect(Adaptor.filter(obj)).eql(false);
  });

  it('works for negatives: array', function () {
    var obj = [];
    expect(Adaptor.filter(obj)).eql(false);
  });
});
