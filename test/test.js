/* global describe, it, beforeEach, afterEach, before */
/* global expect, Adaptor, suite, semver */
/* jshint expr: true */

if (typeof require === 'function') require('./setup');

suite('Ractive adaptor', function (Ractive) {
  var child, parent, subchild, user;
  var isVersion = semver.satisfies.bind(semver, Ractive.VERSION);

  // Load dependencies
  before(function () {
    Ractive.DEBUG = false;
    Ractive.adaptors.Ractive = Adaptor;
    Ractive.defaults.adapt = ['Ractive'];
  });

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

    if (isVersion('> 0.5.0')) {
      it('.reset on child gets picked up', function () {
        parent.set('child', child);
        child.reset({ ten: 10, eleven: 11 });

        expect(parent.get('child.ten')).eql(10);
        expect(parent.get('child.eleven')).eql(11);
      });
    }

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
   * deep nesting
   */

  describe('using with deeply-nested cases', function () {
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

  /*
   * computed properties
   */

  describe('computed properties', function () {
    beforeEach(function () {
      user = new Ractive({
        data: { first: 'Jon', last: 'Snow' },
        computed: {
          full: {
            get: function () {
              return [this.get('first'), this.get('last')].join(' ');
            },
            set: function (val) {
              var parts = val.split(' ');
              this.set({ first: parts[0], last: parts[1] });
            }
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

    describe('setters', function () {
      beforeEach(function () {
        parent.set('user', user);
        parent.set('user.full', 'Arya Stark');
      });

      it('works when accessed via parent', function () {
        expect(parent.get('user.first')).eql('Arya');
        expect(parent.get('user.last')).eql('Stark');
        expect(parent.get('user.full')).eql('Arya Stark');
      });

      it('works when accessed via child', function () {
        expect(user.get('first')).eql('Arya');
        expect(user.get('last')).eql('Stark');
        expect(user.get('full')).eql('Arya Stark');
      });
    });

    describe('setters, redux', function () {
      beforeEach(function () {
        parent.set('user', user);
        user.set('full', 'Arya Stark');
      });

      it('works when accessed via parent', function () {
        expect(parent.get('user.first')).eql('Arya');
        expect(parent.get('user.last')).eql('Stark');
        expect(parent.get('user.full')).eql('Arya Stark');
      });

      it('works when accessed via child', function () {
        expect(user.get('first')).eql('Arya');
        expect(user.get('last')).eql('Stark');
        expect(user.get('full')).eql('Arya Stark');
      });
    });
  });

  describe('Ractive.defaults', function () {
    var one, two, audio;

    beforeEach(function () {
      audio = new Ractive({ data: {
        volume: 30,
        mute: true
      }});

      Ractive.defaults.data.audio = audio;
      one = new Ractive();
      two = new Ractive();
    });

    afterEach(function () {
      audio.teardown();
      delete Ractive.defaults.data.audio;
    });

    it('picks up shared objects from the start', function () {
      expect(one.get('audio.volume')).eql(30);
      expect(two.get('audio.volume')).eql(30);
      expect(audio.get('volume')).eql(30);
    });

    it('picks up changes from the shared object', function () {
      audio.set('volume', 60);
      expect(one.get('audio.volume')).eql(60);
      expect(two.get('audio.volume')).eql(60);
      expect(audio.get('volume')).eql(60);
    });

    // Only in 0.6.0+ - https://github.com/ractivejs/ractive/issues/1285
    if (isVersion('>= 0.6.0')) {
      it('allows you to set the data via the wrapper', function () {
        one.set('audio.volume', 70);
        expect(one.get('audio.volume')).eql(70);
        expect(two.get('audio.volume')).eql(70);
        expect(audio.get('volume')).eql(70);
      });
    }
  });

  // Only in 0.6.0+ - https://github.com/ractivejs/ractive/issues/1285
  if (isVersion('>= 0.6.0')) {
    it('set before get', function () {
      child = new Ractive();
      parent = new Ractive({ data: { child: child }});

      parent.set('child.enabled', true);
      expect(parent.get('child.enabled')).eql(true);
    });
  }

  describe('instance methods:', function () {
    beforeEach(function () {
      child = new Ractive();
      parent = new Ractive();
      parent.set('child', child);
    });

    describe('.set():', function () {
      it('with value', function () {
        parent.set('child.counter', 1);
        expect(child.get('counter')).eql(1);
      });

      it('via object', function () {
        parent.set({ 'child.counter': 1 });
        expect(child.get('counter')).eql(1);
      });

      it('via nested object', function () {
        parent.set({ child: { counter: 1 }});
        expect(child.get('counter')).eql(1);
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
        expect(child.get('list')).eql(['a', 'b', 'c']);
      });

      it('.push()', function () {
        parent.push('child.list', 'c');
        expect(child.get('list')).eql(['a', 'b', 'c']);
      });

      it('.pop()', function () {
        parent.pop('child.list');
        expect(child.get('list')).eql(['a']);
      });

      it('.unshift()', function () {
        parent.unshift('child.list', 'x');
        expect(child.get('list')).eql(['x', 'a', 'b']);
      });
    });
  });

  /*
   * expect locks to be released
   */

  afterEach(function expectLocksReleased () {
    expect(Object.keys(Adaptor.locked)).length(0);
  });

});
