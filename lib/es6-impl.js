/*=============================================================================
#     FileName: es6-impl.js
#         Desc: Core API implement by ES6 for io.js / Node.js with harmony
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.3.0
#   LastChange: 2015-06-19
#      History:
=============================================================================*/

var U = require('./utility')

/* ------------------------------------
 *   UNFINISHED....
 * ------------------------------------ */


// -------------------------------------------------
//  Async task
// -------------------------------------------------
function AscsTask() {
    this.__ac__ = true;
    this.statusCode = U.TASK_STATE.running;
    this.timeout = -1;
    this.result = null;
    this.callback = null;

    this.status = function() {
        switch (this.statusCode)
        {
        case U.TASK_STATE.complete:
            return {code: U.TASK_STATE.complete, name: 'complete'};
        case U.TASK_STATE.running:
            return {code: U.TASK_STATE.running, name: 'running'};
        case U.TASK_STATE.timeout:
            return {code: U.TASK_STATE.timeout, name: 'timeout'};
        }
    };
    
    this.timeout = function(timeout)    {
        this.timeout = timeout;
        var self = this;
        setTimeout(function() {
            if (self.statusCode === U.TASK_STATE.running)   {
                self.statusCode = U.TASK_STATE.timeout;
                return;
            }
        }, timeout);
        
        return this;
    }
}


function AscsFunction() {
    var task = new AscsTask();
    var binder = {
        parent: this.parent,
        fn: this.fn,
        parameters: !arguments ? [] : [].slice.call(arguments)
    };        
    
    var ascsAsyncCallback = function()  {
        // still running, not timeout
        if (task.statusCode === U.TASK_STATE.running)  {
            task.statusCode = U.TASK_STATE.complete;
            task.result = arguments;
        }
        // if task is awaiting
        if (task.callback !== null)
            task.callback.apply(task, arguments);
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
    if (typeof fn !== "function")
        return null;

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


exports.env = function (flow) {
    if (typeof flow !== 'function')   {
        return function() {};
    }
    var G = flow();    
    return function()   {
        var nextStep = function()   {
            var current = G.next();
            if (!current.done)  {
                current.value.callback = function() {
                    if (current.value.statusCode != U.TASK_STATE.timeout)   {
                        current.value.statusCode = U.TASK_STATE.complete;
                        current.value.result = arguments;
                    }
                    // Continue the flow
                    nextStep(arguments);
                };
            }
        };
        // Start flow;
        nextStep();
    };
};


exports.await = function (task, timeout) {
    throw "ascs.await is not implemented in ES6 mode";
};