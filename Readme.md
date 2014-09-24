# ractive-ractive

Experimental ractive adaptor for ractive objects. This makes it possible to use 
template-less Ractive objects as models.

```js
Ractive.defaults.adapt = ['Ractive'];

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

Everything you'd expect to work will work: observers, templates, and so on...
except events and circular dependencies. (but do you really expect that to
work?)

### Usage

No need to consume the return value.

```js
require('ractive-ractive')
```

### Credits

Hat tip to the Ractive adaptor from @Rich-Harris.
([src](https://github.com/Rich-Harris/Ractive-plugins/blob/master/adaptors/Ractive.js))

### Thanks

**ractive-ractive** © 2014+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/ractive-ractive/contributors
