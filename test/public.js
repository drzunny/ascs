/*=============================================================================
#     FileName: public.js
#         Desc: the Public API's(make, await, env) test
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.1.0
#   LastChange: 2014-04-03 13:58:33
#      History:
=============================================================================*/

var ascs    = require("../ascs");
// var mocha   = require("mocha");
var chai    = require("chai");

var assert = chai.assert;

function is_functor (obj)	{
    assert.property(obj, 'result', 'check functor has `result` member');
    assert.property(obj, 'await', 'check functor has `await` member');
    assert.isDefined(obj.__base__, "check functor has `__base___` property, it means it's a ascs.func");
    assert.property(obj.__base__, 'owner', 'check its parent has `owner` property or not');
    assert.property(obj.__base__, 'func', 'check its parent has `func` property or not');
    assert.isFunction(obj.__base__.func, "if the __base__ member has `func`, it must be a function");
};

/*--------------------- test cases ----------------------------*/

describe("public-api-scope", function (){
	describe("ascs.env", function ()	{
		var testEnv1 = function () {		
		};
		var testEnv2 = function () {		
			return 1;
		};
		var testEnv3 = function (a) {		
			return a;
		};
		var testEnv4 = function (a,b,c,d) {
			return a+b+c+d;
		};
		var testEnv5 = function (a,b,cb) {
			return cb(a+b);
		};
		var testEnv6 = undefined;
		var testEnv7 = [];
		var testEnv8 = "";
		var testEnv9 = {};
		var testEnv0 = null;

		it("should different type of function can be convert to env function", function () {
			assert.isFunction(ascs.env(testEnv1), 'convert a non-return function to env-function');
			assert.isFunction(ascs.env(testEnv2), 'convert a return function to env-function')
			assert.isFunction(ascs.env(testEnv3), 'convert a one-arg function to env-function');
			assert.isFunction(ascs.env(testEnv4), 'convert a multi-arg function to env-function');
			assert.isFunction(ascs.env(testEnv5), 'convert a muti-arg-with-cb function to env-function');
		});

		it("other type of variant also can be converted to a empty function", function () {
			assert.isFunction(ascs.env(testEnv6), 'undefined variant can be convert to a empty function');
			assert.isFunction(ascs.env(testEnv7), 'convert a return function to env-function');
			assert.isFunction(ascs.env(testEnv8), 'convert a return function to env-function');
			assert.isFunction(ascs.env(testEnv9), 'convert a return function to env-function');
			assert.isFunction(ascs.env(testEnv0), 'convert a return function to env-function');
		});		
	});

	describe("ascs.make", function ()	{
        
        var func = require('../lib/ascs-functor');
        var fs = require('fs');

        /*------------ the test functions ---------------*/
        var fun1 = function (name, cb)  {
            console.log('start fun1');
            setTimeout(function () {
                cb([1,2,3,4,5,6,7]);
            }, 3000);
            console.log('end fun1');
        };
        var fun2 = function (path)  {
            var _path = path;
            this.x = 1;
            this.y = 2;

            this.exists = function (cb) {
                fs.exists(path, cb);
            }
        };
        fun2.GoodMorning = function (path, cb)  {
            console.log('Hello world', path);
            setTimeout(function () {
                cb('1',2,3.0);
            }, 2000);
            console.log('Goodbye,', path);
        };
        
        /*------------- convert to ascs.func ------------------*/
        var fun2Obj = new fun2('Shit');
        var fsExists_async = ascs.make(fs.exists);
        var fun1_async = ascs.make(fun1);
        var fun2_async = ascs.make(fun2);
        var fun2_s_goodmorning_async = ascs.make(fun2.GoodMorning);
        var fun2_m_exists_async = ascs.make(fun2Obj.exists);

		it("the functions can be converted to a ascs.func Object", function () {
            assert.isFunction(fsExists_async, "ascs can convert standard library's async api");
            assert.isFunction(fun1_async, "ascs can convert the customer's async function");
            assert.isFunction(fun2_async, "ascs can convert the constructor function");
            assert.isFunction(fun2_s_goodmorning_async, "ascs can convert the static function in class(function) object");
            assert.isFunction(fun2_m_exists_async, "ascs can convert the member function from class(function) object");

            // execute the ascs.func, try to get and check the inner functor
            var t1 = fsExists_async("1.txt");
            var t2 = fun1_async("Here is fun1");
            var t3 = fun2_async("fun");
            var t4 = fun2_s_goodmorning_async("2.txt");
            var t5 = fun2_m_exists_async();

            is_functor(t1);
            is_functor(t2);
            is_functor(t3);
            is_functor(t4);
            is_functor(t5);
		});

		it("check the ascs.func is valid", function () {

		});		

		it("the non-function should return itself", function () {

		});

		it("the asc.func object should return itself", function () {

		});
	});

	describe("ascs.await", function ()	{

		it("the await operation can block the env-function", function () {

		});

		it("after await, all the result are returned successfuly", function () {

		});

		it("if no await operation, the env-function will be execute asynchronous", function () {

		});

	});
})
