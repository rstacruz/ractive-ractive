/* global describe, it, beforeEach, afterEach, before */
/* global expect, Adaptor, suite */
require('../setup');

suite('Ractive.defaults', function (Ractive) {
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
  it('allows you to set the data via the wrapper', function () {
    one.set('audio.volume', 70);
    expect(one.get('audio.volume')).eql(70);
    expect(two.get('audio.volume')).eql(70);
    expect(audio.get('volume')).eql(70);
  });
});
