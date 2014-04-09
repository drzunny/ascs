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

    var x = 1, y = 1;

    var fun1 = fs.exists;
    function fun2 (cb)    {
        this.x *= 2;
        this.y *= 2;
        setTimeout(function () { cb('fun2', this.x, this.y); }, 50);
    };
    function fun ()    {
        this.x = -1;
        this.y = -1;
        this.fun3 = function (a,b,cb) {
            this.x *= 3;
            this.y *= 3;
            setTimeout(function () { cb(a+b, this.x, this.y); }, 250);
        };
    };
    fun.fun4 = function (s, cb) {
        this.x *=4;
        this.y *=4;
        setTimeout(function () { cb('hello:' + s, this.x, this.y); }, 750);
    };
    function fun5 (k, cb)    {
        this.x =5;
        this.y =5;
        setTimeout(function () { cb(k * k, this.x, this.y); }, 1500);
    };

    var f = new fun();
    var fun1_async = ascs.make(fun1);
    var fun2_async = ascs.make(fun2);
    var fun3_async = ascs.make(f.fun3);
    var fun4_async = ascs.make(fun.fun4);
    var fun5_async = ascs.make(fun5);

    //  Start the mocha test
    //--------------------------------------------------
    it("await-timeout, try to break the await", function (done) {

        // if use argument `done`, the test case will waiting for `done` in a exceeded time (default is 2000ms)
        // so the test script should use the `--timeout` option
        ascs.env(function () {
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
            t5.await(500);                  // before this await, the fun5_async has run 1100ms (total 1500ms)
            assert.equal(t5.status().code, 1, "the fun5 should be COMPLETE here, and it has been done before this time");

            done();
        })();
    });

    it("owner-changed, we have some special skill to change your function caller", function () {
    });
});
