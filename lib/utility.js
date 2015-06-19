// -------------------------------------
//  Extension helpers
// -------------------------------------
Object.prototype.__extend = function (other)    {
    if (typeof(other) !== "object" || other === null)
        return;
    /* the `__extend` maybe replace the old property */
    for (var name in other)
        this[name] = other[name];
};



// -------------------------------------
//  helper functions
// -------------------------------------

exports.isAscsFunction = function(fn) {
    return fn !== null && (typeof fn === 'function' && fn.__ac__)
};

exports.isAscsObject = function(o)  {
    return o !== null && (typeof o === 'object' && o.__ac__)
}


exports.enableGenerator = function()    {
    var script = "function* support() {};support();";
    try {
        eval(script);
        return true;
    }   catch(e)    {
        return false;
    }
};


exports.TASK_STATE = {
    complete: 0,
    running: 1,
    timeout: 2
};