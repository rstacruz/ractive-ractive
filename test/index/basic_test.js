/* global describe, it, beforeEach, afterEach */
/* global expect, Adaptor, suite */
/* jshint expr: true */
require('../setup');

suite('Basic cases', function (Ractive) {
  var child, parent, subchild;

  /*
   * simple cases
   */

  describe('simple', function () {
    this.timeout(250);

    beforeEach(function () {
      child = new Ractive();
      parent = new Ractive();
    });

    it(".get picks up the child's value", function () {
      child.set('one', 1);
      parent.set('child', child);

      expect(parent.get('child.one')).eql(1);
    });

    it('.reset on child gets picked up', function () {
      parent.set('child', child);
      child.reset({ ten: 10, eleven: 11 });

      expect(parent.get('child.ten')).eql(10);
      expect(parent.get('child.eleven')).eql(11);
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
        } else if (runs === 2) {
          expect(val).eql(3);
          next();
        }
      });

      child.set('three', 3);
    });

    it('updates the parent HTML when the child updates', function () {
      parent = new Ractive({
        template: '{{#child}}value={{enabled}}{{/child}}'
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
        template: 'value={{enabled}}'
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

    it('doesnt bleed to instance properties', function () {
      var original = child.template;

      parent.set('child', child);
      parent.set('child.template', 'jade');
      expect(child.template).eql(original);
    });

    it('allows the name "data"', function () {
      parent.set('child', child);
      parent.set('child.data', 'this is data');
      expect(child.get('data')).eql('this is data');
    });

    // https://github.com/rstacruz/ractive-ractive/pull/2/files
    it('proxies to a childs data object, not the instance properties', function () {
      var template = child.template;

      parent.set('child', child);
      parent.set('child.data', 'datum');

      expect(child.get('data')).eql('datum');

      parent.set('child.template', 'templating');

      expect(child.template).equal(template);
      expect(child.get('template')).equal('templating');

      child.template = '<h1>Hello Test</h1>';
      expect(child.get('template')).equal('templating');
      expect(parent.get('child.template')).equal('templating');
    });
  });

  /*
   * filter function
   */

  describe('filter', function () {
    it('works', function () {
      var obj = new Ractive();
      expect(Adaptor.filter(obj)).eql(true);
    });

    it('works for negatives: object', function () {
      var obj = {};
      expect(Adaptor.filter(obj)).eql(false);
    });

    it('works for negatives: array', function () {
      var obj = [];
      expect(Adaptor.filter(obj)).eql(false);
    });
  });

  /*
   * using set on observe shouldn't interfere with locks
   */

  describe('set on observe', function () {
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
  });

  // Only in 0.6.0+ - https://github.com/ractivejs/ractive/issues/1285
  it('set before get', function () {
    child = new Ractive();
    parent = new Ractive({ data: { child: child }});

    parent.set('child.enabled', true);
    expect(parent.get('child.enabled')).eql(true);
  });

  /*
   * expect locks to be released
   */

  afterEach(function expectLocksReleased () {
    expect(Object.keys(Adaptor.locked)).length(0);
  });

});
