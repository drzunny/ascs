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
describe("timeout-owner-scope", function () {
    var fs = require("fs");

    //  Prepare the basic function
    //--------------------------------------------------
    var fun1 = fs.exists;
    function fun2 (cb)    {
        setTimeout(function () { cb('fun2'); }, 50);
    };
    function fun ()    {
        this.fun3 = function (a,b,cb) {
            setTimeout(function () { cb(a+b); }, 100);
        };
    };
    fun.fun4 = function (s, cb) {
        setTimeout(function () { cb('hello:' + s); }, 150);
    };
    function fun5 (k, cb)    {
        setTimeout(function () { cb(k * k); }, 200);
    };

    var f = new fun();
    var fun1_async = ascs.make(fun1);
    var fun2_async = ascs.make(fun2);
    var fun3_async = ascs.make(f.fun3);
    var fun4_async = ascs.make(fun.fun4);
    var fun5_async = ascs.make(fun5);

    //  Start the mocha test
    //--------------------------------------------------
    describe("await-timeout", function () {
        it("try to break to await", function (done) {
            ascs.env(function () {
                var t1 = fun1_async('1.txt');
                t1.await(100);
                assert.equal(t1.status().code, 1, "the fs.exists should be done");
                var t2 = fun2_async();
                t2.await(30);
                assert.equal(t2.status().code, -2, "the fun2 should be TIMEOUT here");
                var t3 = fun3_async(1,2);
                t3.await(90);
                assert.equal(t3.status().code, -2, "the fun3 should be TIMEOUT here");
                var t4 = fun4_async('Fuckit');
                t4.await(160);
                assert.equal(t4.status().code, 1, "the fun4 should be COMPLETE here");
                var t5 = fun5_async(100);
                t5.await(250);
                assert.equal(t5.status().code, 1, "the fun5 should be COMPLETE here");

                done();
            })();
        });

        it("check the delay is ok", function () {
            assert.equal(1,1,"helloworld");
        });
    });

    describe("owner-changed", function () {
    });
});
