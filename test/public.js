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
var util    = require("util");
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
            //console.log('start fun1');
            setTimeout(function () {
                cb([1,2,3,4,5,6,7]);
            }, 3000);
            //console.log('end fun1');
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
            //console.log('Hello world', path);
            setTimeout(function () {
                cb('1',2,3.0);
            }, 2000);
            //console.log('Goodbye,', path);
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

		it("the non-function should return null", function () {
            assert.isNull( ascs.make(undefined), "cannot parse the undefined variant");
            assert.isNull( ascs.make(null), "cannot parse the null variant");
            assert.isNull( ascs.make(NaN), "the NaN cannot be parsed");
            assert.isNull( ascs.make(true), "the boolean cannot be parsed");
            assert.isNull( ascs.make("100"), "the string cannot be parsed");
            assert.isNull( ascs.make(100), "the number cannot be parsed");
            assert.isNull( ascs.make([1,2,3,4,5]), "the array cannot be parsed");
            assert.isNull( ascs.make({ a : 'abc', b:123 }), "the object cannot be parsed");
		});

		it("the asc.func object should return itself", function () {

            var f1 = fsExists_async("1.txt");
            var f2 = fun1_async("2.txt");
            var f3 = fun2_async("3.txt");
            var f4 = fun2_s_goodmorning_async("4.txt");
            var f5 = fun2_m_exists_async();

            assert.equal( ascs.make(f1), f1, "the f1 make nothing different");
            assert.equal( ascs.make(f2), f2, "the f2 make nothing different");
            assert.equal( ascs.make(f3), f3, "the f3 make nothing different");
            assert.equal( ascs.make(f4), f4, "the f4 make nothing different");
            assert.equal( ascs.make(f5), f5, "the f5 make nothing different");
		});
	});

	describe("ascs.await", function ()	{

        // ---------- Prepare the test functions -------------------
        var fs = require("fs");

        var fun1 = function (arr, cb)  {
            var sum = 0;
            for (var i = 0; i < arr.length; i++)    {
                sum += arr[i];
            }
            setTimeout(function () { cb(sum); }, 500);
        };

        var fun2 = function(s1, s2, cb)   {
            cb(s1+s2);
        };

        var fun = function () {
            this.fun3 = function (name, cb) {
                //console.log("await.test.name = ", name);
                setTimeout(function () { cb(1,2,3); }, 1000);
            };
        };

        fun.fun4 = function (cb) {
            cb(this);
        };

        var fun5 = "This is not a function";
        
        // ---------- Convert the normal asynchronous function to ascs.func ---------------
        var F = new fun();
        
        var async_f0 = ascs.make(fs.exists);
        var async_f1 = ascs.make(fun1);
        var async_f2 = ascs.make(fun2);
        var async_f3 = ascs.make(F.fun3);
        var async_f4 = ascs.make(fun.fun4);
        var async_f5 = ascs.make(fun5);

		it("the await operation can block the env-function", function () {
            assert.isNull(async_f5, "Test the `null` variant againt, the non-function object cannot be parsed");

            var check_flag = 0;

            ascs.env(function ()    {
                check_flag = 1;
                check_flag = 2;
                ascs.await(async_f0("1.txt"));
                check_flag = 3;
            })();
            assert.equal(check_flag, 2, "this step 1, the check flag must be 2 if the await has block the process<jump out the env>");

            ascs.env(function ()    {
                check_flag = 10;
                ascs.await(async_f1([1,2,3,4,5,6,7]));
                check_flag = 20;
                check_flag = 30;
            })();
            assert.equal(check_flag, 10, "this step 2, the check flag must be 10 if the await has block the process<jump out the env>");

            ascs.env(function ()    {
                check_flag = 100;
                check_flag = 200;
                check_flag = 300;
                ascs.await(async_f2("Hello", "world")); // this callback will be executed immediately.
                check_flag = 400;                       // when the 'await' called, the status has changed COMPLETE. `await` canceled
            })();
            assert.equal(check_flag, 400, "this step 3, the check flag must be 400 if the await has block the process<jump out the env>");

            ascs.env(function ()    {
                ascs.await(async_f3("Superhero"));
                check_flag = 1000;
                check_flag = 2000;
                check_flag = 3000;
            })();
            assert.equal(check_flag, 400, "this step 4, the check flag must be 400 if the await has block the process<jump out the env>");

            ascs.env(function ()    {
                check_flag = 10000;
                check_flag = 20000;
                ascs.await(async_f4()); // the same of async_f2, the callback will execute immediately
                check_flag = 30000;
            })();
            assert.equal(check_flag, 30000, "this step 5, the check flag must be 30000 if the await has block the process<jump out the env>");

		});

		it("after await, all the result are returned successfuly", function (done) {    // use mocha's asynchronous supported
            ascs.env(function () {
                var result = [];
                var t1 = async_f0('1.txt');
                var t2 = async_f1([1,2,3,4,5]);
                var t3 = async_f2('a', 'b');
                var t4 = async_f3('txt');
                var t5 = async_f4();

                result.push(ascs.await(t1))
                result.push(ascs.await(t2))
                result.push(ascs.await(t3))
                result.push(ascs.await(t4))
                result.push(ascs.await(t5))

                for (var i = 0; i < 5; i++) {
                    assert.isNotNull(result[i], "the task " + i + " must be returned successfuly");
                }
                done();     // end of this test case
            })();
		});

		it("if no await operation, the env-function will be execute asynchronous", function () {
            var flag = [];
            var i = 1;
            ascs.env(function() {
                flag.push(i++);
                flag.push(i++);
                async_f0("1.txt");
                flag.push(i++);
                flag.push(i++);
            })();
            chai.expect(flag).to.eql([1,2,3,4]);

            ascs.env(function() {
                flag.push(i++);
                flag.push(i++);
                flag.push(i++);
                async_f1([1,2,3,4]);
                flag.push(i++);
            })();
            chai.expect(flag).to.eql([1,2,3,4,5,6,7,8]);

            ascs.env(function() {
                async_f2('ab', 'cd');
                flag.push(i++);
                flag.push(i++);
                flag.push(i++);
                flag.push(i++);
            })();
            chai.expect(flag).to.eql([1,2,3,4,5,6,7,8,9,10,11,12]);

            ascs.env(function() {
                flag.push(i++);
                async_f3('ab');
                flag.push(i++);
                flag.push(i++);
                flag.push(i++);
            })();
            chai.expect(flag).to.eql([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);

            ascs.env(function() {
                flag.push(i++);
                async_f4();
                flag.push(i++);
                flag.push(i++);
                async_f4();
                flag.push(i++);
            })();
            chai.expect(flag).to.eql([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
		});

        it("the time-cost between the normal asynchronous callback and ascs.await model", function (done) {
        		// get fibonacci
        		function fib(n)	{
                    var sum;
        			var source = [1, 1];
        			if (n <= 1)
        				return { 'a' : source[i], 's': 2 };
                    sum = 2;
        			for (var i = 2; i <= n; i++)	{
        				var next = source[i-2] + source[i-1];
                        sum += next;
        				source.push(next);
        			}
        			return { 'a':source[source.length-1], 's':sum};
        		}
        		// Test function
        		function millionFib(cb)	{
                    var r = fib(300);
        			setTimeout(function () {
        				cb(r);
        			}, 500);        			
        		};

        		/*
        			--- if the normal asynchronous callback pattern. the test will be:

						t1 = get_here();
        				millionFib(function (n) {
							t2 = get_here();
							// output
        				});
        				fib(10); // you can do other things for here because the callback is async
        		 */
        		ascs.env(function () {
	        		var ascs_begin = new Date().getTime();
	        		var millionFib_async = ascs.make(millionFib);

	        		fib(100); 										// the millionfib_async is asynchronous too!
	        		var result1 = ascs.await(millionFib_async());	// waiting for callback
	        		var ascs_cost = new Date().getTime() - ascs_begin;

	        		// normal async callback style
	        		var normal_begin = new Date().getTime();
	        		millionFib(function (n) {
	        			var normal_cost = new Date().getTime() - normal_begin;

                        // output the statisic
                        console.log('\n-----------------\nascs.await result:', result1);
                        console.log('ascs.await cost:%d\n', ascs_cost);

                        console.log('normal result:', n);
                        console.log(util.format('normal cost:%d\n\ndifference:%f ms\n----------------\n', normal_cost, (ascs_cost-normal_cost)/1000));

	        			// we allow a little bit extra-time for using ascs.await [ time unit:ms - convert -> s ]
	        			chai.expect((ascs_cost - normal_cost)/1000).to.be.below(0.005);
	        			// finish this asynchronous callback test
	        			done();
	        		});
	        		fib(100);	// the millionfib is async. test for equal condition
        		})();
        		
        });

	});
})
