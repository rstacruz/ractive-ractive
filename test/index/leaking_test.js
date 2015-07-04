/* global it, beforeEach, before */
/* global expect, Adaptor, suite */
require('../setup');

/*
 * These tests are part of a long discussion on:
 * - https://github.com/rstacruz/ractive-ractive/issues/2
 * - https://github.com/rstacruz/ractive-ractive/issues/3
 */

suite('Leaking tests', function (Ractive) {
  var child, parent;

  beforeEach(function () {
    parent = new Ractive();
    child = new Ractive();
  });

  it('.data on child is left alone', function () {
    child.set('data', 'datum');
    parent.set('child', child);
    expect(child.get('data')).toEqual('datum');
  });

  it('.data accessed via parent', function () {
    child.set('data', 'datum');
    parent.set('child', child);
    expect(parent.get('child.data')).toEqual('datum');
  });

  it('setting child.data on the parent', function () {
    parent.set('child', child);
    parent.set('child.data', 'other_value');
    expect(child.get('data')).toEqual('other_value');
  });
});
