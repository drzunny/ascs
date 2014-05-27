# Hi, this is ascs
- - -
**ascs ==> as cs ==> `AS CSharp`.**

I hope the asynchronous programming can be more intuitionistic, C#'s async/await pattern is a good choice for me to solve the **Callback Hell** in Node.JS.

So far, ascs is still a very lightweight library (LOC < 150). There are only **3** public API:

```
	ascs.env(function () { ... });
	ascs.conv(a_async_function);
	<ascs_task>.await();
```

# DEMO
- - -
```
var ascs = require("./ascs");

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
    task.await();
    console.log('current is:', i++);        // 2
    console.log('The result is:', task.result);
    console.log('current is:', i++);        // 3
})();

```

run this code. the console will output these:
```
current is: 0
Hello world start
Hello world end
current is: 1
Function is done
current is: 2
The result is: { '0': 1, '1': 2, '2': 3, '3': 4, '4': 5 }
current is: 3
```
The process will be waiting the task until it has finished

Now, let's remove the `task.await()`. the output will become:
```
current is: 0
Hello world start
Hello world end
current is: 1
current is: 2
The result is: null
current is: 3
Function is done
```

The process in `ascs.env` will not be stopped. but `myfun` is also run asynchronously.

# Roadmap
- - -
0. <s>Support timeout</s> **(DONE)**
1. <s>Add Test</s> **(DONE)**
2. <s>Better Supports for object's context</s> **(DONE)**
3. Exception *(0.2.5)*
4. Debug *(0.2.5)*
5. Remove the ascs.env (?)


## Bug and Issue
- - -
ascs is **UNFINISHED**. I think it is still a **TOY**, do not use in production...
