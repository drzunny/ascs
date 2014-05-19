var ascs = require("../ascs");

var myfun = function(tips, cb)  {
    console.log(tips, 'start');
    setTimeout(function () {
        console.log('Function is done');
        cb(1,2,3,4,5);
    }, 3000);
    console.log(tips, 'end');
}

ascs.env(function() {
    var i = 0;
    var myfun_async = ascs.conv(myfun);
    console.log('current is:', i++);        // 0
    var task = myfun_async('Hello world');
    console.log('current is:', i++);        // 1
    // task.await();
    console.log('current is:', i++);        // 2
    console.log('The result is:', task.result);
    console.log('current is:', i++);        // 3
})();

//------------   context demo   ---------------------

console.log('----------------------------------------');

function superman ()    {
    this.x = 10;
    this.y = 20;
    var self = this;

    this.fly = function (name, cb)  {
        console.log("i'm" ,name);
        setTimeout(function () {
            console.log('Hero skill:', self.x, self.y);
            cb([1,2,3,4,5,6]);
        }, 1000);
        console.log("hero %s is leave!", name);
    }
}

ascs.env(function() {
    var i = 0;
    var x = 100, y = 200;
    var man = new superman();
    var man2 = {x:200, y:300};
    var fly_async = ascs.conv(man.fly);
    man2.fly = fly_async;                   // the fly_asnc function's parent will not be changed (always `man`)
    console.log('current is:', i++);        // 0
    var task = fly_async('Mr.Jobs');
    var task2 = man2.fly('mr.jager');
    console.log('current is:', i++);        // 1
    task.await();
    task2.await();
    console.log('current is:', i++);        // 2
    console.log('The result is:', task.result);
    console.log('The result is:', task2.result);
    console.log('current is:', i++);        // 3
})();