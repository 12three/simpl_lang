const topEnv = {
    'true': true,
    'false': false,
    print(value) {
        console.log(value);
        return value;
    },
    array(...args) {
        return args
    },
    element(array, i) {
        return array[i];
    },
    length(array) {
        return array.length;
    },
};

['+', '-', '/', '*', '==', '<', '>'].forEach(op => {
    topEnv[op] = new Function('a, b', `return a ${op} b;`);
})

module.exports = topEnv