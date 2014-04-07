var ascs = require("../ascs");

function myfun (tips, cb)  {
    console.log(tips, 'start');
    setTimeout(function () {
        console.log('Function is done');
        cb(1,2,3,4,5);
    }, 3000);
    console.log(tips, 'end');
}

ascs.env(function() {
    var i = 0;
    var myfun_async = ascs.make(myfun);
    console.log('current is:', i++);        // 0
    var task = myfun_async('Hello world');
    console.log('current is:', i++);        // 1
    task.await(1);
    console.log("first await-end");
    task.await(500);
    console.log(task.status())
    console.log("2nd await-end");
    console.log('current is:', i++);        // 2
    task.await(500);
    console.log(task.status())
    console.log("3rd await-end");
    task.await(2000);
    console.log(task.status())
    console.log("4th await-end");
    task.await(3000);
    console.log(task.status())
    console.log("5th await-end");
    console.log('The result is:', task.result);
    console.log('current is:', i++);        // 3
})();

