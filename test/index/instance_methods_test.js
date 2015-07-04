/* global describe, it, beforeEach, afterEach, before */
/* global expect, Adaptor, suite */
/* jshint expr: true */
require('../setup');

suite('Instance methods', function (Ractive) {
  var child, parent, subchild, user;

  beforeEach(function () {
    child = new Ractive();
    parent = new Ractive();
    parent.set('child', child);
  });

  describe('.set():', function () {
    it('with value', function () {
      parent.set('child.counter', 1);
      expect(child.get('counter')).toEqual(1);
    });

    it('via object', function () {
      parent.set({ 'child.counter': 1 });
      expect(child.get('counter')).toEqual(1);
    });

    it('via nested object', function () {
      parent.set({ child: { counter: 1 }});
      expect(child.get('counter')).toEqual(1);
    });
  });

  describe('numbers:', function () {
    beforeEach(function () {
      child.set('price', 10);
    });

    it('add()', function () {
      parent.add('child.price', 10);
      expect(child.get('price'), 20);
    });

    it('subtract()', function () {
      parent.subtract('child.price', 3);
      expect(child.get('price'), 7);
    });
  });

  describe('lists:', function () {
    beforeEach(function () {
      child.set('list', ['a', 'b']);
    });

    it('.merge()', function () {
      parent.merge('child.list', ['a', 'b', 'c']);
      expect(child.get('list')).toEqual(['a', 'b', 'c']);
    });

    it('.push()', function () {
      parent.push('child.list', 'c');
      expect(child.get('list')).toEqual(['a', 'b', 'c']);
    });

    it('.pop()', function () {
      parent.pop('child.list');
      expect(child.get('list')).toEqual(['a']);
    });

    it('.unshift()', function () {
      parent.unshift('child.list', 'x');
      expect(child.get('list')).toEqual(['x', 'a', 'b']);
    });
  });
});
