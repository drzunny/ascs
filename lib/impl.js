/*=============================================================================
#     FileName: fiber-impl.js
#         Desc: Core API implement by Fiber
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.3.0
#   LastChange: 2015-06-19
#      History:
=============================================================================*/

var U = require('./utility')
var fiber = require('fibers')

// -------------------------------------------------
//  Async task
// -------------------------------------------------
function AscsTask() {
    this.statusCode = U.TASK_STATE.running;
    this.timeout = -1;
    this.result = null;
    this.statement = null;

    this.status = function() {
        switch (this.statusCode)
        {
        case U.TASK_STATE.complete:
            return {code: this.statusCode, name: 'complete'};
        case U.TASK_STATE.running:
            return {code: this.statusCode, name: 'running'};
        case U.TASK_STATE.timeout:
            return {code: this.statusCode, name: 'timeout'};
        }
    };
    
    this.await = function(timeout) {
        if (this.statusCode === U.TASK_STATE.complete)
            return;
        if (typeof timeout === 'number' && timeout > 0) {
            this.timeout = timeout;    
        }
                                    
        this.statement = fiber.current;
        
        if (this.timeout > 0)   {
            var self = this;
            setTimeout(function()   {
                // resume coroutine
                if (self.statusCode === U.TASK_STATE.running)   {
                    self.statusCode = U.TASK_STATE.timeout;
                    self.statement.run();
                }
            }, this.timeout);
        }
        while (this.statusCode === U.TASK_STATE.running)
            fiber.yield();
    };
}


function AscsFunction() {
    var task = new AscsTask();
    var binder = {
        parent: this.parent,
        fn: this.fn,
        parameters: arguments === undefined ? [] : [].slice.call(arguments)
    };        
    
    var ascsAsyncCallback = function()  {
        // still running, not timeout
        if (task.statusCode === U.TASK_STATE.running)  {
            task.statusCode = U.TASK_STATE.complete;
            task.result = arguments;
        }
        // if task is awaiting
        if (task.statement != null)
            task.statement.run();
    };
    
    // add ascsAsyncCallback as default callback handler    
    binder.parameters.push(ascsAsyncCallback);
    binder.fn.apply(binder.parent, binder.parameters);    
    return task;
}


// -------------------------------------------------
//  Exports API
// -------------------------------------------------

exports.conv = function (fn, owner) {
    if (U.isAscsFunction(fn))
        return fn;
    // if the argument is not a function, return null;
    if (typeof fn !== "function")   {
        return null;
    }

    var binder = {
        fn: fn,
        parent: owner
    };
    if (!binder.parent || binder.parent === null)
        binder.parent = null;    

    var replaceFunc = AscsFunction.bind(binder);
    
    replaceFunc.__ac__ = true;    
    return replaceFunc;
};


exports.env = function (fn) {
    if (typeof(fn) !== 'function')   {
        return function() {};
    }
    // return a fiber object
    var fb = fiber(fn);
    // return object method `run`, and bind it with fiber object
    return fb.run.bind(fb);
};


exports.await = function (task, timeout) {
    if (typeof(timeout) === "number" && timeout > 0)
        task.await(timeout);
    else
        task.await();
    return task.result;
};