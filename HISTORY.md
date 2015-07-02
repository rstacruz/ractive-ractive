## v1.0.0 - Jul  2, 2015

Just declaring 1.0.0-ness. No actual functionality changes.

* Confirming support for 0.7.3 (with tests added).
* Strengthened test suite.
* Update coding style to semistandard.

## v0.4.5 - Apr 8, 2015

Upkeep... no actual functionality changes.

* Add LICENSE file.
* Update package.json to point repository to GitHub.

## v0.4.4 - October  2, 2014

* Fix package.json not to depend on `mocha-clean` unless in development.

## v0.4.3 - October  2, 2014

No code changes, just package info and readme updates.

* Update readme documentation to suggest `Ractive.defaults.adapt.push`.
* Internal: update tests.

## v0.4.2 - September 25, 2014

* Fix legacy IE compatibility by removing dependency on `Object.keys`.

## v0.4.1 - September 24, 2014

* Fix possible memory leak.

## v0.4.0 - September 24, 2014

* Support computed properties.

## v0.3.2 - September 24, 2014

* Ensure write-locks get unlocked even when execptions are thrown.

## v0.3.1 - September 24, 2014

* Make the write lock work globally, not just per adaptor. This theoretically 
  helps prevent some infinite loops (that I haven't found yet) from happening.

## v0.3.0 - September 24, 2014

* Wrap events.
* Cleanup for code readability and speed.
* Internal: make `maxKeyLength` configurable.

## v0.2.0 - September 24, 2014

* Throw errors on a circular dependency.
* Fix support for bottom-up organization. (`b.set('c', c); a.set('b', b);`)

## v0.1.1 - September 24, 2014

* List Ractive as a peer dependency.

## v0.1.0 - September 24, 2014

* Initial.
