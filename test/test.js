/* jshint expr: true */
var expect = require('chai').expect;
var Ractive = require('ractive');

var child, parent, adapt, subchild, user;

before(function () {
  require('../index');
  adapt = Ractive.adaptors.Ractive;
  Ractive.defaults.adapt = ['Ractive'];
});

// Makes tests faster
before(function () {
  adapt.maxKeyLength = 64;
});

/*
 * simple cases
 */

describe('simple', function () {
  this.timeout(250);

  beforeEach(function () {
    child  = new Ractive();
    parent = new Ractive();
  });

  it(".get picks up the child's value", function () {
    child.set('one', 1);
    parent.set('child', child);

    expect(parent.get('child.one')).eql(1);
  });

  it('propagates changes from child to parent', function () {
    child.set('two', 1);
    parent.set('child', child);
    child.set('two', 2);

    expect(parent.get('child.two')).eql(2);
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

  // ensure that you can observe changes in the child via the parent.
  it('can observe changes of the child', function (next) {
    var runs = 0;
    parent.set('child', child);

    parent.observe('child.three', function (val) {
      runs++;
      if (runs === 1) {
        expect(val).be.undefined;
      }
      else if (runs === 2) {
        expect(val).eql(3);
        next();
      }
    });

    child.set('three', 3);
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

describe('using with deeply-nested cases', function () {
  beforeEach(function () {
    subchild = new Ractive({ data: { name: "subchild" }});
    child    = new Ractive({ data: { name: "child" }});
    parent   = new Ractive({ data: { name: "parent" }});
  });

  it('catches circular dependencies', function () {
    expect(function () {
      parent.set('child', child);
      child.set('subchild', subchild);
      subchild.set('parent', parent);
    }).throw(/circular/);
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

/*
 * using set on observe shouldn't interfere with locks
 */

describe('set on observe', function () {
  beforeEach(function () {
    parent = new Ractive();
    child  = new Ractive();
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
});

/*
 * computed properties
 */

describe('computed properties', function () {
  beforeEach(function () {
    user = new Ractive({
      data: { first: 'Jon', last: 'Snow' },
      computed: {
        full: function () {
          return [this.get('first'), this.get('last')].join(' ');
        }
      }
    });
  });

  beforeEach(function () {
    parent = new Ractive();
  });

  it('sanity check', function () {
    expect(user.get('full')).eql('Jon Snow');
  });

  it('works on the first run', function () {
    parent.set('user', user);
    expect(parent.get('user.full')).eql('Jon Snow');
  });

  it('propagates when something changes by proxy', function () {
    parent.set('user', user);
    parent.set('user.last', 'Stewart');
    expect(user.get('full')).eql('Jon Stewart');
  });

  it('propagates when something changes by proxy, and checked on parent', function () {
    parent.set('user', user);
    parent.set('user.last', 'Stewart');
    expect(parent.get('user.full')).eql('Jon Stewart');
  });

  it('propagates when something changes', function () {
    parent.set('user', user);
    parent.set('user.last', 'Stewart');
    expect(parent.get('user.full')).eql('Jon Stewart');
  });
});
