## v0.4.2 - September 25, 2014

* Fix legacy IE compatibility by removing dependency on Object.keys.

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
