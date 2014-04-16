# ascs
- - -
语死早真对不起，想不到什么好名字。本意上是想在Node.js上面实现C# 5.0那种async/await的异步模式，所以经过艰难的决定，还是叫 **ascs** 吧，就是 **像C#一样 (as CSharp)** 的意思。

NodeJS虽好，但是 **退回调，保平安**，教练我只想写代码，不是像画条虫（～～～）噢。

……

好吧，废话说多了，继续说一下ascs好了。首先正如他的名字，只是简单的对C#的async/await进行模仿，并且尽力保持轻量级的代码量（ **目前有效代码目测 < 250行** ）。其次，并非完全按照C#的API搬过来，在ascs里面，只保留了 **3个** API：

```
    ascs.env( function () { ... } );
    ascs.make(fn [, owner]);
    ascs.await(task);
```

### ascs.env
虽然说可以await了，但是也没有免费的午餐，想要用await的部分，都需要在ascs.env里面跑。

为了避免完全堵塞，不同的env是 **半异步** 执行的。当某个env处于await状态，另外的env会被执行。env如果不遇到await是不会中断跑去其他env的

### ascs.make
和C# 里面类似，不是所有的API都用得上这种async/await的，因此一般的异步API可以通过 `ascs.make` 进行转换。转换之后就能够作为异步方法调用

> ascs.make 只支持单个callback的回调函数，多个callback不知道意义何在，因此没打算支持。

### ascs.await
其实这是一个简化操作， `ascs.make` 转换出来的函数执行后会返回一个 **functor**， 可以理解为C# 的 **Task**。ascs.await 其实就是相当于是 `<task>.await();return <task>.result;`

# 示例代码
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
    task.await();
    console.log('current is:', i++);        // 2
    console.log('The result is:', task.result);
    console.log('current is:', i++);        // 3
})();

```
跑完之后，就会乖乖地输出鸟下面的：
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
该停的地方停住了吧，不该停的地方还是继续跑对吧？都说 await大法好了。如果我不await，会发生啥事？
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
异步的函数还是会执行，但是env里面的过程就没有等到他结束（因为获取不了result）

# 计划
- - -
目前0.2.0版本已经实现了 **await的超时控制**、**异步函数的对象绑定**等功能，目测下个版本(**0.2.5**)将会尝试支持：

1. 异常
2. 异步函数的中断
3. 更好地调试

# 说点东西
- - -
ascs 主要使用fiber实现状态的跳转从而达到await的效果，ES6 里面已经支持`yield` 了，但是为了兼容更多版本，所以使用了一些fiber的库。

为什么不做成JIT，主要是ascs的目标 **只用于Node.JS**，因此并不兼容浏览器端~也没打算支持。另外一个原因是： **怕麻烦**

想在浏览器也跑的话，用 [wind.js](http://windjs.org/cn/)。自己想撸个ascs，很大的原因是收到wind.js的启发（虽然做得像屎一样）

最后。。ascs 个人实验作品，有bug可以反馈。如果想用于生产环境，自己需要度量一下……（虽然我自己就用上在自己的项目了）