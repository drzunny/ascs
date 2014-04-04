# Hi, this is ascs
- - -
ascs means `AS CSharp`. I hope the asynchronous programming can be more intuitionistic, C#'s async/await pattern is a good choice for me to solve the **Callback Hell** in Node.JS.

So far, ascs is still a very lightweight library (LOC < 150). There are only **3** public API:

```
	ascs.env(function () { ... });
	ascs.make(a_async_function);
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
    var myfun_async = ascs.make(myfun);
    console.log('current is:', i++);        // 0
    var task = myfun_async('Hello world');
    console.log('current is:', i++);        // 1
    //task.await();
    console.log('current is:', i++);        // 2
    console.log('The result is:', task.result);
    console.log('current is:', i++);        // 3
})();

```

if `task.await()` has been commented. the output is:
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

The process will not be stopped. But if `task.await()` is called:

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

The process will be waiting the task until it has finished;

# Roadmap
- - -
0. Support timeout;
1. Add Test
2. Better Supports for object's context
3. Exception
4. Debug
5. Remove the ascs.env (?)


## Bug and Issue
- - -
ascs is **UNFINISHED**. I think it is still a **TOY**, do not use in production...
