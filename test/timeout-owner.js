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
    function fun2 ()    {
    };
    function fun ()    {
        this.fun3 = function () {
        };
    };
    function fun.fun4() {
    };
    function fun5 ()    {
    };

    var fun1_async = ascs.make(fun1);
    var fun2_async = ascs.make(fun2);
    var fun3_async = ascs.make(f.fun3);
    var fun4_async = ascs.make(fun.fun4);
    var fun5_async = ascs.make(fun5);

    //  Start the mocha test
    //--------------------------------------------------
    describe("await-timeout", function () {
    });

    describe("owner-changed", function () {
    });
});
