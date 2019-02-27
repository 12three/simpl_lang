function skipSpace(string) {
    const first = string.search(/\S/);

    if (first === -1) {
        return '';
    }

    return string.slice(first);
};

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
        throw new SyntaxError(`Неожиданный синтаксис: ${program}`);
    }

    return parseApply(expr, program.slice(match[0].length))
};