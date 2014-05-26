/*=============================================================================
#     FileName: ascs-AProcess.js
#         Desc: the async AProcess like C#
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.2.0
#   LastChange: 2014-04-07 15:27:01
#      History:
=============================================================================*/

var fiber = require("fibers");

// The base ascs.AFunction Class
//----------------------------------------
function AFunction() {
    var parent = this;

    // These 2 arguments bind by ascs.make    
    if (!this.__func)
        this.__func = null;

    function AProcess ()    {
        var _arguments  = [];
        var _current    = null;
        var _status     = 0;        // default to RUNNING, AProcess is the return of ascs.AFunction
        var _timeout    = 0;        // timeout is default to disable
        this.result     = null;
        var self        = this;

        var params = this.args;
        // initalize the arguments
        for (var i = 0; i < params.length; i++)   {
            _arguments.push(params[i]);
        }

        // to add the common callback argument
        _arguments.push(function () {
            if ( _status === AFunction.status_code.TIMEOUT )
                return;
            _status = AFunction.status_code.COMPLETE;
            self.result = arguments;

            // if await has been used, _current will not be null
            if (_current !== null)
                _current.run();
        });

        // start the main fibers to execute the async method
        var asyncFunc = fiber(function () {
            // `AFunction` is asynchronous function, it will be return immediately
            parent.__func.apply(parent, _arguments);
            fiber.yield(); // yield return to the env fiber
        });


        /**
         * @brief return the status of the task
         *
         * @return obj return a object of the status: { status: 'status_name', code:status_code }
         */
        this.status = function () {
            var value = _status;
            var name = '';
            switch(value)   {
                case 0:     name = 'running';   break;
                case 1:     name = 'complete';  break;
                case -1:    name = 'error';     break;
                case -2:    name = 'timeout';   break;
                default:    name = 'unknow';    break;
            }
            return { status:name, code:value };
        };


        /**
         * @brief wait for the task's return; you can input a number as argument to limit the waiting time.
         *
         * @param timeout Optional, must be a number. If timeout >0, function will **TRY TO** wait for the task's return in a 
         * exactly time. **BUT**, Javascript function is not transactional. Although the task is timeout, the source function
         * is still running and cannot interrupt it. So, this argument is just a LIMITATION OF WAITING TIME.
         *
         * @return 
         */
        this.await = function (timeout) {
            if (_status === AFunction.status_code.COMPLETE)
                return;
            if (typeof(timeout) === "number" && timeout > 0)
                _timeout = timeout;
            _current = fiber.current;   // save the current fiber state;

            // check timeout is enable
            if (_timeout > 0)   {
                setTimeout(function () {
                    var status_code = AFunction.status_code;
                    if (_status === status_code.RUNNING || _status === status_code.TIMEOUT) {
                        _status = AFunction.status_code.TIMEOUT;
                        _current.run();
                    }
                }, _timeout);
            }
            fiber.yield();              // stop the env fiber process and waiting for return
        };

        // run the env fiber;
        asyncFunc.run();
    }

    // set the AProcess's prototypes for passing the arguments
    AProcess.prototype.args = arguments;
    AProcess.prototype.__base__ = this;

    return new AProcess();
}

// The AFunction's status enum
//----------------------------------------
AFunction.status_code = {
    RUNNING : 0,
    ERROR   : -1,
    TIMEOUT : -2,
    COMPLETE: 1
};

// begin the async/await environment
//----------------------------------------
AFunction.env = function (fn) {
    var fb = fiber(fn);
    return fb.run.bind(fb);
};

// export this module
//----------------------------------------
module.exports = AFunction;
