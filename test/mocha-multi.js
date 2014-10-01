function multi (fn, list) {
  return function (name, block) {
    Object.keys(list).forEach(function (key) {
      var item = list[key];
      fn(name + " (" + key + ")", function () { block(item, key); });
    });
  };
}

global.mdescribe = function (name, specs, fn) {
  return multi(describe, specs)(name, fn);
};
