import { Node } from './node.js';

// Tokenize the rule string
export function tokenize(ruleString) {
    return ruleString
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .split(/\s+/)
        .filter(token => token.length > 0);
}

// Determine operator precedence
export function precedence(op) {
    return op === 'AND' ? 2 : op === 'OR' ? 1 : 0;
}

// Parse tokens into AST
export function parseTokensToAST(tokens) {
    const outputStack = [];
    const operatorStack = [];

    while (tokens.length > 0) {
        const token = tokens.shift();

        if (token === '(') {
            outputStack.push(parseTokensToAST(tokens));
        } else if (token === ')') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                const operator = operatorStack.pop();
                const right = outputStack.pop();
                const left = outputStack.pop();
                outputStack.push(new Node('operator', left, right, operator));
            }
            operatorStack.pop();
            break;
        } else if (['AND', 'OR'].includes(token)) {
            while (
                operatorStack.length &&
                precedence(operatorStack[operatorStack.length - 1]) >= precedence(token)
            ) {
                const operator = operatorStack.pop();
                const right = outputStack.pop();
                const left = outputStack.pop();
                outputStack.push(new Node('operator', left, right, operator));
            }
            operatorStack.push(token);
        } else {
            const operator = tokens.shift();
            const value = tokens.shift();
            outputStack.push(new Node('operand', null, null, `${token} ${operator} ${value}`));
        }
    }

    while (operatorStack.length) {
        const operator = operatorStack.pop();
        const right = outputStack.pop();
        const left = outputStack.pop();
        outputStack.push(new Node('operator', left, right, operator));
    }

    return outputStack[0];
}

// Create a rule from a string
export function createRule(ruleString) {
    const tokens = tokenize(ruleString);
    return parseTokensToAST(tokens);
}

// Combine multiple ASTs
export function combineASTs(rules, operator = 'OR') {
    let combinedAST = null;
    for (const rule of rules) {
        const ast = createRule(rule);
        combinedAST = combinedAST
            ? new Node('operator', combinedAST, ast, operator)
            : ast;
    }
    return combinedAST;
}
