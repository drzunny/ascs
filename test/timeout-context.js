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
            var fun1_async = ascs.conv(fun1);
            var fun2_async = ascs.conv(fun2);
            var fun3_async = ascs.conv(f.fun3);
            var fun4_async = ascs.conv(fun.fun4);
            var fun5_async = ascs.conv(fun5);

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

    it("context-changed, changed the function's binding object", function (done) {
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
                var __x = this.x, __y = this.y;
                this.fun3 = function (cb)   {
                    var _x = this.x, _y = this.y;
                    setTimeout(function () { cb(_x, _y); }, 50);
                };
                this.fun4 = function (cb)   {
                    setTimeout(function () { cb(__x, __y); }, 50);                    
                };
            };
            obj2.fun5 = function (cb)   {
                var _x = this.x, _y = this.y;
                setTimeout(function () { cb(_x, _y); }, 50);
            };

            var instance = new obj2();
            //  start the test
            //--------------------------------------------------
            ascs.env(function() {
                // 
                var nf1 = ascs.conv(fun1);
                var nf2 = ascs.conv(obj1.fun2);
                var nf3 = ascs.conv(instance.fun3);
                var nf4 = ascs.conv(instance.fun4);
                var nf5 = ascs.conv(obj2.fun5);
                //---------------------------
                var rs1 = ascs.await(nf1());
                var rs2 = ascs.await(nf2());
                var rs3 = ascs.await(nf3());
                var rs4 = ascs.await(nf4());
                var rs5 = ascs.await(nf5());

                assert.isUndefined(rs1[0], "f1's return must be undefined because its scope doest set");
                assert.isUndefined(rs2[0], "f2's return must be undefined because its scope doest set");
                assert.isUndefined(rs3[0], "f3's return must be undefined, cannot catche the this in the member method");
                assert.equal(rs4[0], 100, "f4's is equal to 100, __x has been assigned in constructor");
                assert.isUndefined(rs5[0], "f5's is undefined, because there are no member property about fun")

                /*---------- reset the owner -----------------*/
                var f1 = ascs.conv(fun1, self);
                var f2 = ascs.conv(obj1.fun2, obj1);
                var f2_ = ascs.conv(obj1.fun2, self);
                var f3 = ascs.conv(instance.fun3, self);
                var f4 = ascs.conv(instance.fun4, self);
                var f5 = ascs.conv(obj2.fun5, instance);
                //---------------------------
                var rs1_owner = ascs.await(f1());
                var rs2_owner = ascs.await(f2());
                var rs2_owner_ = ascs.await(f2_());
                var rs3_owner = ascs.await(f3());
                var rs4_owner = ascs.await(f4());
                var rs5_owner = ascs.await(f5());

                assert.equal(rs1_owner[0], "outside 1", "fun1 has binded to the object 'self'");
                assert.equal(rs2_owner[0], -1, "f2_owner has bind to obj1, so the result is -1");
                assert.notEqual(rs2_owner_[0], -1, "f2_owner_ is not equal to -1, becuase it has rebind to `self`");
                assert.equal(rs3_owner[0], "outside 1", "f3_owner has rebind to `self`, so the result is 'outside 1'");
                assert.equal(rs4_owner[0], 100, "although f4 is rebind to `self`, but the contructor has been set __x");
                assert.equal(rs5_owner[0], 100, "f5_owner has bind to instance, so the result is 100");

                done();
            })();
    });
});
