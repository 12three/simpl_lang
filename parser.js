function skipSpace(string) {
    const first = string.search(/\S/);

    if (first === -1) {
        return '';
    }
    if (string[first] === '#') {
        const lineFinish = string.search(/(\n|$)/)

        return skipSpace(string.slice(lineFinish + 1));
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
        if (program[0] === ',') {
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

module.exports = {
    parse
};