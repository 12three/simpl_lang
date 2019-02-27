const topEnv = {
    'true': true,
    'false': false,
    'print'(value) {
        console.log(value);
        return value;
    }
};

['+', '-', '/', '*', '==', '<', '>'].forEach(op => {
    topEnv[op] = new Function('a, b', `return a ${op} b;`);
})

module.exports = topEnv