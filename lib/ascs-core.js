/*=============================================================================
#     FileName: ascs-core.js
#         Desc: the Core API of the ascs
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.2.0
#   LastChange: 2014-04-01 10:22:05
#      History:
=============================================================================*/
var AProcess = require("./ascs-process");
var fiber = require("fibers");

/**
 * @brief a extend method, merge the other object's property
 *
 * @param other another object
 *
 */
Object.prototype.__extend = function (other)    {
    if (typeof(other) !== "object" || other === null)
        return;
    /* the `__extend` maybe replace the old property */
    for (var name in other)
        this[name] = other[name];
};


/**
 * @brief convert a normal asynchronous callback function to ascs.AFunction
 *
 * @param fn    the source function, only accept the singal callback function.
 * @param owner optional, change the source function's caller, it's not recommend to use in general
 *
 * @return AFunction return a ascs.AFunction wrapper for the asycn-function
 */
exports.conv = function (fn, owner) {
    // if the argument is asc.AFunction, return itself
    if (fn !== null && typeof(fn) === "object" && fn.__base__)
        return fn;
    // if the argument is not a function, return null;
    if (typeof(fn) !== "function")
        return null;

    if (!owner || owner === null)
        owner = {}; // a empty scope    
    var caller = { __func: fn };
    // extend the caller with owner
    caller.__extend(owner);

    var binder = AProcess.bind(caller);
    return binder;
};



/**
 * @brief create a ascs' environment to use the async/await pattern
 *
 * @param fn your code
 *
 * @return env_code a ascs.env wrapper for your code to provide the async/await supported
 */
exports.env = function (fn) {
    if (typeof(fn) !== 'function')   {
        var emptyFunction = function() {};
        return emptyFunction.bind(emptyFunction);
    }
    var fb = fiber(fn);
    return fb.run.bind(fb);
};



/**
 * @brief a helper to call <task>.await([timeout])
 *
 * @param task      the task of ascs.AFunction's return
 * @param timeout   optional, the limitation of wating
 *
 * @return result   return of the task. if timeout error is occured, the result is null
 */
exports.await = function (task, timeout) {
    if (typeof(timeout) === "number" && timeout > 0)
        task.await(timeout);
    else
        task.await();
    return task.result;
};
