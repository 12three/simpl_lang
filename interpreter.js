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

    'do': function (args, env) {
        let value = false;

        args.forEach(arg => {
            value = evaluate(arg, env);
        });
        return value;
    },

    'define': function (args, env) {
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
        function name(expr) {
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

function evaluate(expr, env) {
    switch (expr.type) {
        case 'value':
            return expr.value;

        case 'word':
            if (expr.value in env) {
                return env[expr.value];
            } else {
                console.log(env.print);
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
            return op.apply(null, expr.args.map(function (arg) {
                return evaluate(arg, env);
            }))

        default:
            break;
    }
}

module.exports = {
    evaluate,
}