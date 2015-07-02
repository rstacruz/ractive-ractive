/* global describe, it, beforeEach */
/* global expect, suite */
if (typeof require === 'function') require('./setup');

/*
 * These tests are part of a long discussion on:
 * - https://github.com/rstacruz/ractive-ractive/issues/2
 * - https://github.com/rstacruz/ractive-ractive/issues/3
 */

suite('Ractive adaptor', function (Ractive) {
  var child, parent;

  describe('Leaking tests', function () {
    beforeEach(function () {
      parent = new Ractive();
      child = new Ractive();
    });

    it('.data on child is left alone', function () {
      child.set('data', 'datum');
      parent.set('child', child);
      expect(child.get('data')).eql('datum');
    });

    describe.skip('failing cases (as of v1.1.0)', function () {
      it('.data accessed via parent', function () {
        child.set('data', 'datum');
        parent.set('child', child);
        expect(parent.get('child.data')).eql('datum');
        // seems to return child.data the instance variable
      });

      it('setting child.data on the parent', function () {
        parent.set('child', child);
        parent.set('child.data', 'other_value');
        expect(child.get('data')).eql('other_value');
      });
    });
  });
});
