/*=============================================================================
#     FileName: ascs.js
#         Desc: The module entry
#       Author: drzunny
#        Email: drzunny@hotmail.com
#     HomePage: http://drzlab.info
#      Version: 0.2.0
#   LastChange: 2015-06-19
#      History:
=============================================================================*/

var U = require('./lib/utility')
var impl = require('./lib/impl');;

exports.env = impl.env;
exports.conv = impl.conv;
exports.await = impl.await;

exports.utility = U;
