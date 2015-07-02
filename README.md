# ractive-ractive

Experimental ractive adaptor for ractive objects. This makes it possible to use 
template-less Ractive objects as models.

*Find more Ractive.js plugins at [docs.ractivejs.org/latest/plugins](http://docs.ractivejs.org/latest/plugins)*

[![Status](https://travis-ci.org/rstacruz/ractive-ractive.svg?branch=master)](https://travis-ci.org/rstacruz/ractive-ractive "See test builds")
[![](https://img.shields.io/badge/mocha--gray.svg)](https://rawgit.com/rstacruz/ractive-ractive/master/test/index.html)

> ##### Note for v0.x users:
> v1.0.0 changes the behavior of doing `require('ractive-ractive')` (eg, in Browserify). See [the changelog](HISTORY.md) for upgrade instructions.

<br>

## Example

```js
Ractive.defaults.adapt.push('Ractive');

parent = new Ractive();
user   = new Ractive();

parent.set('user', user);
```

Changes in children are propagated to the parent:

```js
user.set('name', 'Jake');
parent.get('user.name')   //=> "Jake"
```

Changes in the parent are propagated to the children:

```js
parent.set('user.name', 'Matt');
user.get('name')   //=> "Matt"
```

<br>

## Features

Everything you'd expect to work will work.

 * bi-directional propagation
 * observers
 * templates
 * computed properties

However, these things are not supported, but may be in the future:

 * circular dependencies (an error will be thrown)
 * events (see [ractive#1249])

<br>

## Wrap events

It will trigger a few events:

 * `wrap` - called when the instance is set as an attribute of another instance
 * `unwrap` - called when the instance has been unset from its parent
 * `wrapchild` - called when the instance gets an Ractive attribute set
 * `unwrapchild` - called when the instance gets an Ractive attribute unset

To illustrate:

```js
parent = new Ractive();
child  = new Ractive();

parent.set('x', child);
// triggers `wrap(parent, 'x')` on child
// triggers `wrapchild(child, 'x')` on parent

parent.set('x', undefined);
// triggers `unwrap(parent, 'x')` on child
// triggers `unwrapchild(child, 'x')` on parent
```

<br>

## Usage

ractive-ractive is available via npm.

    $ npm install --save ractive-ractive

[![npm version](http://img.shields.io/npm/v/ractive-ractive.svg?style=flat)](https://npmjs.org/package/ractive-ractive "View this project on npm")

In CommonJS:

```js
Ractive.adaptors.Ractive = require('ractive-ractive');
Ractive.defaults.adapt = ['Ractive'];
```

Without module loaders, the adaptor is available as `"Ractive"` under `Ractive.adaptors.Ractive`.

<br>

## Credits

Hat tip to the original Ractive adaptor from [@Rich-Harris].
([src](https://github.com/Rich-Harris/Ractive-plugins/blob/master/adaptors/Ractive.js))

<br>

## Thanks

**ractive-ractive** © 2014+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/ractive-ractive/contributors
[ractive#1249]: https://github.com/ractivejs/ractive/issues/1249 
[@Rich-Harris]: https://github.com/Rich-Harris
