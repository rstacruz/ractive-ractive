/* global describe, it, beforeEach */
/* global expect, suite */
require('../setup');

/*
/* See: https://github.com/rstacruz/ractive-ractive/pull/2#issuecomment-118074794
 */

suite('Leaking params to instance variables (#2)', function (Ractive) {
  var child, parent, subchild;

  beforeEach(function () {
    subchild = new Ractive({ data: {
      name: 'subchild',
      subchildProperty: 'subchild property'
    }});
    child = new Ractive({ data: {
      name: 'child',
      childProperty: 'child property'
    }});
    parent = new Ractive({ data: {
      name: 'parent',
      parentProperty: 'parent property'
    }});
  });

  it('doesn\'t leak data properties on to the Ractive instances', function () {
    expect(subchild.subchildProperty).be.undefined;
    expect(child.childProperty).be.undefined;
    expect(parent.parentProperty).be.undefined;
  });
});
