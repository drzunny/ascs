/*=============================================================================
#     FileName: timeout-owner.js
#         Desc: The Case about await-timeout and owner-change (for v0.2.0)
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.2.0
#   LastChange: 2014-04-07 17:03:56
#      History:
=============================================================================*/
var ascs    = require("../ascs");
var util    = require("util");
var chai    = require("chai");

var assert  = chai.assert;
var expect  = chai.expect;


/*------------------ The test case ------------------*/
describe("timeout-context-scope", function () {
    var fs = require("fs");

    it("await-timeout, try to break the await", function (done) {

        // if use argument `done`, the test case will waiting for `done` in a exceeded time (default is 2000ms)
        // so the test script should use the `--timeout` option
        ascs.env(function () {

            //  Prepare the basic function
            //--------------------------------------------------
            var fun1 = fs.exists;
            function fun2 (cb)    {
                setTimeout(function () { cb('fun2'); }, 50);
            };
            function fun ()    {
                this.fun3 = function (a,b,cb) {
                    setTimeout(function () { cb(a+b); }, 250);
                };
            };
            fun.fun4 = function (s, cb) {
                setTimeout(function () { cb('hello:' + s); }, 750);
            };
            function fun5 (k, cb)    {
                setTimeout(function () { cb(k * k); }, 1500);
            };

            //  Start the mocha test
            //--------------------------------------------------
            var f = new fun();
            var fun1_async = ascs.make(fun1);
            var fun2_async = ascs.make(fun2);
            var fun3_async = ascs.make(f.fun3);
            var fun4_async = ascs.make(fun.fun4);
            var fun5_async = ascs.make(fun5);

            // Start the test
            var t1 = fun1_async('1.txt');
            var t5 = fun5_async(100);       // pre-run the fun5_async
            t1.await(100);
            assert.equal(t1.status().code, 1, "the fs.exists should be done");
            var t2 = fun2_async();
            t2.await(40);
            assert.equal(t2.status().code, -2, "the fun2 should be TIMEOUT here");
            var t3 = fun3_async(1,2);
            t3.await(200);
            assert.equal(t3.status().code, -2, "the fun3 should be TIMEOUT here");
            var t4 = fun4_async('Fuckit');
            t4.await(760);
            assert.equal(t4.status().code, 1, "the fun4 should be COMPLETE here");
            t5.await(700);                  // before this await, the fun5_async has run 1100ms (total 1500ms)
            assert.equal(t5.status().code, 1, "the fun5 should be COMPLETE here, and it has been done before this time");

            done();
        })();
    });

    it("context-changed, we have special skill to change your function owner", function (done) {
            //  Prepare the basic function
            //--------------------------------------------------
            var x = 'outside 1', y = 'outside 2';
            var self = { x : x, y : y };
            function fun1(cb)   {
                var _x = this.x, _y = this.y;
                setTimeout(function ()  {
                    cb(_x, _y);
                }, 50);
            };
            var obj1 = new Object();
            obj1.x = -1;
            obj1.y = -2;
            obj1.fun2 = function (cb)    {
                var _x = this.x, _y = this.y;
                setTimeout(function () { cb(_x, _y); }, 50);
            };
            var obj2 = function ()  {
                this.x = 100;
                this.y = 200;
                var _x = this.x, _y = this.y;
                this.fun3 = function (cb)   {
                    setTimeout(function () { cb(_x, _y); }, 50);
                };
            };
            obj2.fun4 = function (cb)   {
                var _x = this.x, _y = this.y;
                setTimeout(function () { cb(_x, _y); }, 50);
            };

            var instance = new obj2();
            //  start the test
            //--------------------------------------------------
            ascs.env(function() {
                var f1 = ascs.make(fun1);
                var f2 = ascs.make(obj1.fun2);
                var f3 = ascs.make(instance.fun3);
                var f4 = ascs.make(obj2.fun4);
                //---------------------------
                var rs1 = ascs.await(f1());
                var rs2 = ascs.await(f2());
                var rs3 = ascs.await(f3());
                var rs4 = ascs.await(f4());

                assert.isUndefined(rs1[0], "f1's return must be undefined because its scope doest set");
                assert.isUndefined(rs2[0], "f2's return must be undefined because its scope doest set");
                assert.equal(rs3[0], 100, "because of the constructor has been set the '_x', so _x is not equal to the `this variant`");
                assert.isUndefined(rs4[0], "f4's return must be undefined because its scope doest set");

                /*---------- reset the owner -----------------*/
                var f1_owner = ascs.make(fun1, self);
                var f2_owner = ascs.make(obj1.fun2, obj1);
                var f3_owner = ascs.make(instance.fun3, self);
                var f4_owner = ascs.make(obj2.fun4, self);
                //---------------------------
                var rs1_owner = ascs.await(f1_owner());
                var rs2_owner = ascs.await(f2_owner());
                var rs3_owner = ascs.await(f3_owner());
                var rs4_owner = ascs.await(f4_owner());

                assert.equal(rs1_owner[0], "outside 1", "f1_owner's scope is equal to `self`");
                assert.equal(rs2_owner[0], -1, "f2_owner has bind to obj1, so the result is -1");
                assert.equal(rs4_owner[0], "outside 1", "f4_owner's scope is equal to `self`");

                done();
            })();
    });
});
