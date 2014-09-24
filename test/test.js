/* jshint expr: true */
var expect = require('chai').expect;
var Ractive = require('ractive');

var child, parent, adapt, subchild;

describe('ractive-ractive', function () {
  before(function () {
    require('../index');
    adapt = Ractive.adaptors.Ractive;
    Ractive.defaults.adapt = ['Ractive'];
  });

  /*
   * simple cases
   */

  describe('simple', function () {
    beforeEach(function () {
      child  = new Ractive();
      parent = new Ractive();
    });

    it(".get picks up the child's value", function () {
      child.set('enabled', 1);
      parent.set('child', child);

      expect(parent.get('child.enabled')).eql(1);
    });

    it('propagates changes from child to parent', function () {
      child.set('enabled', 1);
      parent.set('child', child);
      child.set('enabled', 2);

      expect(parent.get('child.enabled')).eql(2);
    });

    /*
     * ensure that you can observe changes in the child via the parent.
     */

    it('can observe changes of the child', function (next) {
      var runs = 0;
      parent.set('child', child);

      parent.observe('child.enabled', function (val) {
        runs++;
        if (runs === 1) {
          expect(val).be.undefined;
        }
        else if (runs === 2) {
          expect(val).eql(2);
          next();
        }
      });

      child.set('enabled', 2);
    });

    it('updates the parent HTML when the child updates', function () {
      parent = new Ractive({
        template: "{{#child}}value={{enabled}}{{/child}}"
      });

      parent.set('child', child);

      child.set('enabled', 1);
      expect(parent.toHTML()).eql('value=1');

      child.set('enabled', 2);
      expect(parent.toHTML()).eql('value=2');
    });

    it('works bidirectionally by propagating parent changes to child', function () {
      parent.set('child', child);
      parent.set('child.enabled', 2);

      expect(child.get('enabled')).eql(2);
    });

    it('works bidirectionally with html', function () {
      child = new Ractive({
        template: "value={{enabled}}"
      });

      expect(child.toHTML()).eql('value=');

      parent.set('child', child);
      expect(child.toHTML()).eql('value=');

      parent.set('child.enabled', 2);
      expect(child.toHTML()).eql('value=2');
    });

    it('handles being reset to an object', function () {
      parent.set('child', child);
      parent.set('child', { enabled: 300 });

      expect(child.get('enabled')).eql(300);
    });

    it('handles being reset to undefined', function () {
      parent.set('child', child);
      parent.set('child', undefined);
    });
  });

  /*
   * deep nesting
   */

  describe('deeply-nested cases', function () {
    beforeEach(function () {
      subchild = new Ractive({ data: { name: "subchild" }});
      child    = new Ractive({ data: { name: "child" }});
      parent   = new Ractive({ data: { name: "parent" }});
    });

    describe('organized linearly', function () {
      beforeEach(function () {
        parent.set('child', child);
        child.set('subchild', subchild);
      });

      it('works upwards', function () {
        subchild.set('enabled', 20);
        expect(parent.get('child.subchild.enabled')).eql(20);

        subchild.set('enabled', 200);
        expect(parent.get('child.subchild.enabled')).eql(200);
      });

      it('works downwards', function () {
        parent.set('child.subchild.enabled', 20);

        expect(subchild.get('enabled')).eql(20);
        expect(child.get('subchild.enabled')).eql(20);
        expect(parent.get('child.subchild.enabled')).eql(20);
      });

      it('handles teardown properly', function () {
        parent.set('child.subchild.enabled', 20);
        child.set('subchild', undefined);

        expect(parent.get('child.subchild.enabled')).be.undefined;
        expect(child.get('subchild.enabled')).be.undefined;
      });
    });

    describe('organized non-linearly', function () {
      beforeEach(function () {
        child.set('subchild', subchild);
        parent.set('child', child);
      });

      it('works upwards', function () {
        subchild.set('enabled', 20);
        expect(parent.get('child.subchild.enabled')).eql(20);

        subchild.set('enabled', 200);
        expect(parent.get('child.subchild.enabled')).eql(200);
      });

      /* NB: this case doesn't work yet. child.set() doesn't get called. */
      it('works downwards', function () {
        parent.set('child.subchild.enabled', 19);

        expect(subchild.get('enabled')).eql(19);
        expect(child.get('subchild.enabled')).eql(19);
        expect(parent.get('child.subchild.enabled')).eql(19);
      });

      it('handles teardown properly', function () {
        parent.set('child.subchild.enabled', 20);
        child.set('subchild', undefined);

        expect(parent.get('child.subchild.enabled')).be.undefined;
        expect(child.get('subchild.enabled')).be.undefined;
      });
    });
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
});
