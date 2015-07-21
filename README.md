# Hi, this is ascs
- - -
**ascs ==> as cs ==> `AS CSharp`.**

A small library provides the C# liked async/await style to Node.js/io.js.

I'm maybe reinventing the wheel again. :smile:

Just for fun and enjoy coding.

# Use

Only **3** API in **ascs**:

+ **ascs.env**    Create a **async** environment to execute the process
+ **ascs.conv**   try to convert your callback style function to ASCSFunction (*your callback must be the last argument*)
+ **ascs.await**  a helper function. equal to: `ascs.await(f(1,2))` => `var t = f(1,2); t.await(); t.result`

# Easy Demo
- - -
```javascript
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
1. Exception *(0.2.5)*
2. Debug *(0.2.5)*

