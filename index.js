const topEnv = require('./topEnv');

const specialForms = {
    'if': function (args, env) {
        if (args.length < 3) {
            throw new SyntaxError('Wrong amoun of arguments');
        }

        if (evaluate(args[0], env) !== false) {
            return evaluate(args[1], env);
        } else {
            return evaluate(args[2], env);
        }
    },

    'while': function (args, env) {
        if (args.length != 2) {
            throw new SyntaxError('Wrong amoun of arguments');
        }

        while (evaluate(args[0], env) !== false) {
            evaluate(args[1], env)
        }

        return false
    },

    'do': function(args, env) {
        let value = false;

        args.forEach(arg => {
            value = evaluate(arg, env);
        });
        return value;
    },

    'define': function(args, env) {
        if (args.length !== 2 || args[0].type !== 'word') {
            throw new SyntaxError('Bad use of define');
        }

        const value = evaluate(args[1], env);
        env[args[0].value] = value;
        return value;
    },

    'fun': function (args, env) {
        if (!args.length) {
            throw new SyntaxError('Function without body')
        }
        function name (expr) {
            if (expr.type != 'word') {
                throw new SyntaxError('Argument name error')
            }
            return expr.value;
        }
        const argNames = args.slice(0, args.length - 1).map(name)
        const body = args[args.length - 1];

        return function () {
            if (arguments.length != argNames.length) {
                throw new TypeError('Wrong args amount');
            }
            const localEnv = Object.create(env);

            for (let i = 0; i < arguments.length; i++) {
                localEnv[argNames[i]] = arguments[i];
            }
            return evaluate(body, localEnv);
        }
    }
}

function skipSpace(string) {
    const first = string.search(/\S/);

    if (first === -1) {
        return '';
    }

    return string.slice(first);
}

function parseApply(expr, program) {
    program = skipSpace(program);
    if (program[0] !== '(') {
        // isn`t a statement
        return {
            expr,
            rest: program,
         }
    }

    program = skipSpace(program.slice(1));
    expr = { type: 'apply', operator: expr, args: [] };
    while (program[0] !== ')') {
        let arg = parseExpression(program);

        expr.args.push(arg.expr);
        program = skipSpace(arg.rest);
        if (program[0] == ',') {
            program = skipSpace(program.slice(1));
        } else if (program[0] !== ')') {
            throw new SyntaxError(`Expected ',' or ')'`)
        }
    }
    return parseApply(expr, program.slice(1))
}

function parseExpression(program) {
    program = skipSpace(program);
    let match, expr;

    if (match = /^"([^"]*)"/.exec(program)) {
        expr = { type: 'value', value: match[0] };
    } else if (match = /^\d+\b/.exec(program)) {
        expr = { type: 'value', value: Number(match[0]) };
    } else if (match = /^[^\s(),"]+/.exec(program)) {
        expr = { type: 'word', value: match[0] };
    } else {
        throw new SyntaxError(`Unexpected syntax: ${program}`);
    }
    return parseApply(expr, program.slice(match[0].length))
}

function parse(program) {
    const result = parseExpression(program);

    if (skipSpace(result.rest).length > 0) {
        throw new SyntaxError(`Unexpected text after the program`);
    }

    return result.expr
}

function evaluate(expr, env) {
    switch (expr.type) {
        case 'value':
            return expr.value;

        case 'word':
            if (expr.value in env) {
                return env[expr.value];
            } else {
                throw new SyntaxError(`Undefined variable ${expr.value}`)
            }

        case 'apply':
            if (expr.operator.type === 'word' &&
                expr.operator.value in specialForms) {
                return specialForms[expr.operator.value](expr.args, env)
            }

            const op = evaluate(expr.operator, env);
            if (typeof op !== 'function') {
                throw new SyntaxError(`Is not a function`)
            }
            return op.apply(null, expr.args.map(function(arg) {
                return evaluate(arg, env);
            }))

        default:
            break;
    }
}

function run() {
    const env = Object.create(topEnv);
    const program = Array.prototype.slice.call(arguments, 0).join('\n');
    return evaluate(parse(program), env);
}

run('do(',
    '   define( plusOne, fun( a, +(a, 1) ) ),',
    '   print(plusOne(10))',
    ')'
)