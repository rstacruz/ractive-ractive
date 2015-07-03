/* global it, beforeEach */
/* global expect, suite */
require('../setup');

suite('Wrap event', function (Ractive) {
  var child, parent;

  beforeEach(function () {
    child = new Ractive();
    parent = new Ractive();
  });

  it('fires the "wrap" event', function (next) {
    child.on('wrap', function (_parent, key) {
      expect(key).eql('child');
      next();
    });

    parent.set('child', child);
  });

  it('fires the "unwrap" event after reset', function (next) {
    child.on('unwrap', function (_parent, key) {
      expect(key).eql('child');
      next();
    });

    parent.set('child', child);
    parent.set('child', undefined);
  });
});
