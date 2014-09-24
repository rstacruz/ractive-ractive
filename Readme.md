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

Everything you'd expect to work will work: observers, templates, and so on.

Except events.

### License

MIT
