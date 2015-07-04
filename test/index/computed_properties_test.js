/* global describe, it, beforeEach */
/* global expect, suite */
require('../setup');

suite('Computed properties', function (Ractive) {
  var user, parent;

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
    expect(user.get('full')).toEqual('Jon Snow');
  });

  it('works on the first run', function () {
    parent.set('user', user);
    expect(parent.get('user.full')).toEqual('Jon Snow');
  });

  it('propagates when something changes by proxy', function () {
    parent.set('user', user);
    parent.set('user.last', 'Stewart');
    expect(user.get('full')).toEqual('Jon Stewart');
  });

  it('propagates when something changes by proxy, and checked on parent', function () {
    parent.set('user', user);
    parent.set('user.last', 'Stewart');
    expect(parent.get('user.full')).toEqual('Jon Stewart');
  });

  it('propagates when something changes', function () {
    parent.set('user', user);
    parent.set('user.last', 'Stewart');
    expect(parent.get('user.full')).toEqual('Jon Stewart');
  });

  describe('setters', function () {
    beforeEach(function () {
      parent.set('user', user);
      parent.set('user.full', 'Arya Stark');
    });

    it('works when accessed via parent', function () {
      expect(parent.get('user.first')).toEqual('Arya');
      expect(parent.get('user.last')).toEqual('Stark');
      expect(parent.get('user.full')).toEqual('Arya Stark');
    });

    it('works when accessed via child', function () {
      expect(user.get('first')).toEqual('Arya');
      expect(user.get('last')).toEqual('Stark');
      expect(user.get('full')).toEqual('Arya Stark');
    });
  });

  describe('setters, redux', function () {
    beforeEach(function () {
      parent.set('user', user);
      user.set('full', 'Arya Stark');
    });

    it('works when accessed via parent', function () {
      expect(parent.get('user.first')).toEqual('Arya');
      expect(parent.get('user.last')).toEqual('Stark');
      expect(parent.get('user.full')).toEqual('Arya Stark');
    });

    it('works when accessed via child', function () {
      expect(user.get('first')).toEqual('Arya');
      expect(user.get('last')).toEqual('Stark');
      expect(user.get('full')).toEqual('Arya Stark');
    });
  });
});
