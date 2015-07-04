/* global describe, it, beforeEach */
/* global expect, suite */
/* jshint expr: true */
require('../setup');

suite('Deeply-nested cases', function (Ractive) {
  var child, parent, subchild;

  beforeEach(function () {
    subchild = new Ractive({ data: { name: 'subchild' }});
    parent = new Ractive({ data: { name: 'parent' }});
    child = new Ractive({ data: { name: 'child' }});
  });

  it('catches circular dependencies', function () {
    expect(function () {
      parent.set('child', child);
      child.set('subchild', subchild);
      subchild.set('parent', parent);
    }).toThrow(/circular/);
  });

  describe('when organized linearly', function () {
    beforeEach(function () {
      parent.set('child', child);
      child.set('subchild', subchild);
    });

    it('works upwards', function () {
      subchild.set('enabled', 20);
      expect(parent.get('child.subchild.enabled')).toEqual(20);

      subchild.set('enabled', 200);
      expect(parent.get('child.subchild.enabled')).toEqual(200);
    });

    it('works downwards', function () {
      parent.set('child.subchild.enabled', 20);

      expect(subchild.get('enabled')).toEqual(20);
      expect(child.get('subchild.enabled')).toEqual(20);
      expect(parent.get('child.subchild.enabled')).toEqual(20);
    });

    it('handles teardown properly', function () {
      parent.set('child.subchild.enabled', 20);
      child.set('subchild', undefined);

      expect(parent.get('child.subchild.enabled')).toEqual(undefined);
      expect(child.get('subchild.enabled')).toEqual(undefined);
    });
  });

  describe('when organized non-linearly', function () {
    beforeEach(function () {
      child.set('subchild', subchild);
      parent.set('child', child);
    });

    it('works upwards', function () {
      subchild.set('enabled', 20);
      expect(parent.get('child.subchild.enabled')).toEqual(20);

      subchild.set('enabled', 200);
      expect(parent.get('child.subchild.enabled')).toEqual(200);
    });

    it('works downwards', function () {
      parent.set('child.subchild.enabled', 19);

      expect(subchild.get('enabled')).toEqual(19);
      expect(child.get('subchild.enabled')).toEqual(19);
      expect(parent.get('child.subchild.enabled')).toEqual(19);
    });

    it('handles teardown properly', function () {
      parent.set('child.subchild.enabled', 20);
      child.set('subchild', undefined);

      expect(parent.get('child.subchild.enabled')).toEqual(undefined);
      expect(child.get('subchild.enabled')).toEqual(undefined);
    });
  });
});
