/* global it, beforeEach, afterEach */
/* global expect, Adaptor, suite */
/* jshint expr: true */
require('../setup');

/*
 * using set on observe shouldn't interfere with locks
 */

suite('Set on observe', function (Ractive) {
  var parent, child;

  beforeEach(function () {
    parent = new Ractive();
    child = new Ractive();
  });

  it('works when observed from child', function () {
    parent.set('child', child);

    child.observe('banana', function (val) {
      parent.set('apple', val);
    });

    child.set('banana', 'pancake');

    expect(child.get('banana')).eql('pancake');
    expect(parent.get('apple')).eql('pancake');
  });

  it('works when observed from parent', function () {
    parent.set('child', child);

    parent.observe('child.banana', function (val) {
      parent.set('apple', val);
    });

    child.set('banana', 'pancake');

    expect(child.get('banana')).eql('pancake');
    expect(parent.get('apple')).eql('pancake');
  });

  afterEach(function expectLocksReleased () {
    expect(Object.keys(Adaptor.locked)).length(0);
  });
});
