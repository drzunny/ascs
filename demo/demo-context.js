var ascs = require("../ascs");

var myfun = function(tips, cb)  {
    console.log(tips, 'start');
    setTimeout(function () {
        console.log('Function is done');
        cb(1,2,3,4,5);
    }, 3000);
    console.log(tips, 'end');
}

function jsClass (x, y) {
    this.x = x;
    this.y = y;

    this.superfunc = function (cb)  {
        console.log("callback:", this.x, this.y);
        var _x = this.x, _y = this.y;
        setTimeout(function () {    
            cb(_x, _y);
        }, 100);
    };
}

ascs.env(function() {
    var o1 = new jsClass(1,2);
    var o2 = new jsClass(3,4);
    o1.nf = ascs.conv(o1.superfunc);
    o2.nf = ascs.conv(o2.superfunc);
    o1.f = ascs.conv(o1.superfunc, o1);
    o2.f = ascs.conv(o2.superfunc, o2);
    
    console.log("\n---------------------------------");
    console.log("no instance binding.....\n---------------------------------\n");
    console.log(ascs.await(o1.nf()));
    console.log(ascs.await(o2.nf()));
    console.log("\n---------------------------------");
    console.log("bind with a instance....\n---------------------------------\n");
    console.log(ascs.await(o1.f()));
    console.log(ascs.await(o2.f()));
})();
