/* global it, beforeEach */
/* global expect, suite */
/* jshint expr: true */
require('../setup');

suite('Basic cases', function (Ractive) {
  var child, parent;

  beforeEach(function () {
    child = new Ractive();
    parent = new Ractive();
  });

  it(".get picks up the child's value", function () {
    child.set('one', 1);
    parent.set('child', child);

    expect(parent.get('child.one')).toEqual(1);
  });

  it('.reset on child gets picked up', function () {
    parent.set('child', child);
    child.reset({ ten: 10, eleven: 11 });

    expect(parent.get('child.ten')).toEqual(10);
    expect(parent.get('child.eleven')).toEqual(11);
  });

  it('propagates changes from child to parent', function () {
    child.set('two', 1);
    parent.set('child', child);
    child.set('two', 2);

    expect(parent.get('child.two')).toEqual(2);
  });

  // ensure that you can observe changes in the child via the parent.
  it('can observe changes of the child', function (next) {
    var runs = 0;
    parent.set('child', child);

    parent.observe('child.three', function (val) {
      runs++;
      if (runs === 1) {
        expect(val).toEqual(undefined);
      } else if (runs === 2) {
        expect(val).toEqual(3);
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
    expect(parent.toHTML()).toEqual('value=1');

    child.set('enabled', 2);
    expect(parent.toHTML()).toEqual('value=2');
  });

  it('works bidirectionally by propagating parent changes to child', function () {
    parent.set('child', child);
    parent.set('child.enabled', 2);

    expect(child.get('enabled')).toEqual(2);
  });

  it('works bidirectionally with html', function () {
    child = new Ractive({
      template: 'value={{enabled}}'
    });

    expect(child.toHTML()).toEqual('value=');

    parent.set('child', child);
    expect(child.toHTML()).toEqual('value=');

    parent.set('child.enabled', 2);
    expect(child.toHTML()).toEqual('value=2');
  });

  it('handles being reset to an object', function () {
    parent.set('child', child);
    parent.set('child', { enabled: 300 });

    expect(child.get('enabled')).toEqual(300);
  });

  it('handles being reset to undefined', function () {
    parent.set('child', child);
    parent.set('child', undefined);
  });

  it('doesnt bleed to instance properties', function () {
    var original = child.template;

    parent.set('child', child);
    parent.set('child.template', 'jade');
    expect(child.template).toEqual(original);
  });

  it('allows the name "data"', function () {
    parent.set('child', child);
    parent.set('child.data', 'this is data');
    expect(child.get('data')).toEqual('this is data');
  });

  // https://github.com/rstacruz/ractive-ractive/pull/2/files
  it('proxies to a childs data object, not the instance properties', function () {
    var template = child.template;

    parent.set('child', child);
    parent.set('child.data', 'datum');

    expect(child.get('data')).toEqual('datum');

    parent.set('child.template', 'templating');

    expect(child.template).toEqual(template);
    expect(child.get('template')).toEqual('templating');

    child.template = '<h1>Hello Test</h1>';
    expect(child.get('template')).toEqual('templating');
    expect(parent.get('child.template')).toEqual('templating');
  });

  // Only in 0.6.0+ - https://github.com/ractivejs/ractive/issues/1285
  it('set before get', function () {
    child = new Ractive();
    parent = new Ractive({ data: { child: child }});

    parent.set('child.enabled', true);
    expect(parent.get('child.enabled')).toEqual(true);
  });
});
