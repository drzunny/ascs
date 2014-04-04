/*=============================================================================
#     FileName: ascs-functor.js
#         Desc: the async functor like C#
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.1.0
#   LastChange: 2014-04-03 00:48:04
#      History:
=============================================================================*/

var fiber = require("fibers");

// the func class
function func () {
    "use strict";

    var parent = this;

    /*--- These 2 arguments will be created by outside object
        
    this.owner = null;
    this.func = null;

    ---*/
    if (this.owner == undefined)
        this.owner = null;
    if (this.func == undefined)
        this.func = null;

    function functor ()    {
        var _arguments = [];
        var _current = null;
        var _status = 0;
        this.result = null;
        var self = this;

        var params = this.args;
        
        // initalize the arguments
        for (var i = 0; i < params.length; i++)   {
            _arguments.push(params[i]);
        }
         
        // to add the common callback argument
        _arguments.push(function () {
            _status = func.status_code.COMPLETE;
            self.result = arguments;

            // if await has been used, _current will not be null
            if (_current != null)
                _current.run();
        });

        // start the main fibers to execute the async method
        var asyncFunc = fiber(function () {
            // because the func is asynchronous function, it will be return immediately
            parent.func.apply(parent.owner == null ? this : parent.owner, _arguments);
            fiber.yield(); // yield return to the env fiber
        });

        this.await = function () {
            // if the task is completed. do not wait
            if (_status == func.status_code.COMPLETE)
                return;
            _current = fiber.current;   // save the current fiber state;
            fiber.yield();              // stop the env fiber process and waiting for return
        };

        // run the env fiber;
        asyncFunc.run();
    }

    // set the functor's prototypes for passing the arguments
    functor.prototype.args = arguments;
    functor.prototype.__base__ = this;

    return new functor();

};

// The func's status enum
func.status_code = {
    READY: 0,
    ERROR: -1,
    RUNNING: 2,
    COMPLETE: 1
}

// The func's cache
func.func_cache = {}

// begin the async/await environment
func.env = function (fn) {
    var fb = fiber(fn);
    return fb.run.bind(fb);
}


module.exports = func;
