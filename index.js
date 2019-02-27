const topEnv = require('./env');
const parser = require('./rapser');
const interpreter = require('./interpreter');

/*
COMMON FLOW:
    1. Create global scope and concatenate input strings
    2. Interpreter computes result of an abstract syntax tree which was
        prepared by parser with actual environment

PARSE:
    1. Parse string by RegExp to build AST with three types of nodes:
        primitive (string or number),
        variable,
        statement

INTERPRETER:
    1. primitive return own value
    2. variable try to find this key in environment
    3. with statement we try to find keyword in special form with default statements
        then look in environment
*/

function run() {
    const env = Object.create(topEnv);
    const program = Array.prototype.slice.call(arguments, 0).join('\n');
    const ast = parser.parse(program);
    return interpreter.evaluate(ast, env);
}

run('do(',
    '   define( plusOne, fun( a, +(a, 1) ) ),',
    '   print( plusOne(10) )',
    ')'
)