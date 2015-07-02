/* global describe, it, beforeEach, before */
/* global expect, Adaptor, suite */
if (typeof require === 'function') require('./setup');

/*
 * These tests are part of a long discussion on:
 * - https://github.com/rstacruz/ractive-ractive/issues/2
 * - https://github.com/rstacruz/ractive-ractive/issues/3
 */

suite('Ractive adaptor', function (Ractive) {
  before(function () {
    Ractive.DEBUG = false;
    Ractive.adaptors.Ractive = Adaptor;
    Ractive.defaults.adapt = ['Ractive'];
  });

  var child, parent, subchild;

  describe('Leaking tests', function () {
    beforeEach(function () {
      parent = new Ractive();
      child = new Ractive();
      subchild = new Ractive();
    });

    it('.data on child is left alone', function () {
      child.set('data', 'datum');
      parent.set('child', child);
      expect(child.get('data')).eql('datum');
    });

    it('.data accessed via parent', function () {
      child.set('data', 'datum');
      parent.set('child', child);
      expect(parent.get('child.data')).eql('datum');
    });

    it('setting child.data on the parent', function () {
      parent.set('child', child);
      parent.set('child.data', 'other_value');
      expect(child.get('data')).eql('other_value');
    });
    // https://github.com/rstacruz/ractive-ractive/pull/2/files
    it('proxies to a childs data object, not the instance properties', function () {
      var childTemplate = child.template;
      var parentTemplate = parent.template;

      var templatePropertyString = 'A property with the name `template`!';

      child.set('data', 'datum');
      child.set('template', templatePropertyString);

      // Setting a child on to a parent shouldn't try and modify instance-level properties
      parent.set('child', child);

      expect(child.get('data')).eql('datum');
      expect(parent.get('child.data')).eql('datum');

      parent.set('child.data', 'other_value');
      expect(child.get('data')).eql('other_value');

      // Getting a property on a child should access the child's `data`
      expect(parent.get('child.template')).eql(templatePropertyString);

      expect(child.template).eql(childTemplate);
      expect(parent.template).eql(parentTemplate);

      parent.set('child.template', 'templating');

      expect(child.template).eql(childTemplate);
      expect(parent.template).eql(parentTemplate);
      expect(child.get('template')).eql('templating');

      child.template = '<h1>Hello Test</h1>';
      expect(parent.get('child.template')).eql('templating');
      expect(child.get('template')).eql('templating');
    });
  });
});
