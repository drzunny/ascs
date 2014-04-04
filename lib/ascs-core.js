/*=============================================================================
#     FileName: ascs-core.js
#         Desc: the Core API of the ascs
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.1.0
#   LastChange: 2014-04-01 10:22:05
#      History:
=============================================================================*/

var functor = require("./ascs-functor");
var fiber = require("fibers");

exports.make = function (fn) {
    // if the argument is asc.func, return itself
    if (fn != null && typeof(fn) == "object" && fn.__base__ != undefined)
        return fn;
    // if the argument is not a function, return null;
    if (typeof(fn) != "function")
        return null;

    if (functor.func_cache[fn] != undefined)
        return functor.func_cache[fn];
    var caller = { owner: fn.callee, func: fn };
    var binder = functor.bind(caller);
    functor.func_cache[fn] = binder;
    return binder;
};

exports.env = function (fn) {
    if (typeof(fn) != 'function')   {
        function empty() {}
        return empty.bind(empty);
    }
    var fb = fiber(fn);
    return fb.run.bind(fb);
}

exports.await = function (task) {
    task.await();
    return task.result;
};
