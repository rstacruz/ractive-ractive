/* global it, beforeEach, before */
/* global expect, Adaptor, suite */
require('../setup');

suite('Arrays', function (Ractive) {
  var parent, children;

  beforeEach(function () {
    children = [];
    parent = new Ractive();
    children.push(new Ractive({ data: { name: 'Alice' }}));
    children.push(new Ractive({ data: { name: 'Bert' }}));
    children.push(new Ractive({ data: { name: 'Cass' }}));
  });

  it('works', function () {
    parent.set('children', children);
    expect(parent.get('children[0].name')).toEqual('Alice');
    expect(parent.get('children[1].name')).toEqual('Bert');
    expect(parent.get('children[2].name')).toEqual('Cass');
  });

  it('propagates .set()', function () {
    parent.set('children', children);
    parent.set('children[0].name', 'Zanna');
    expect(parent.get('children[0].name')).toEqual('Zanna');
  });

  it('propagates changes up', function () {
    parent.set('children', children);
    children[0].set('name', 'Zanna');
    expect(parent.get('children[0].name')).toEqual('Zanna');
  });

  it('observe', function (next) {
    var run = 0;
    parent.set('children', children);
    parent.observe('children[0].name', function (val) {
      run++;
      if (run === 1) {
        expect(val).toEqual('Alice');
      } else if (run === 2) {
        expect(val).toEqual('Zanna');
        next();
      }
    });
    children[0].set('name', 'Zanna');
  });

  it('can be pushed to', function () {
    parent.set('children', children);
    parent.push('children', new Ractive({ data: { name: 'Dave' }}));

    expect(parent.get('children[3].name')).toEqual('Dave');
  });

  it('can be popped', function () {
    parent.set('children', children);
    parent.pop('children');

    expect(parent.get('children[2].name')).toEqual(undefined);
  });
});
