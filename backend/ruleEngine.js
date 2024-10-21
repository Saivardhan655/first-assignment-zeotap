// Node class to represent AST (Abstract Syntax Tree)
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type;  // "operator" or "operand"
        this.left = left;
        this.right = right;
        this.value = value;  // For operands: "age > 30", operators: "AND", "OR"
    }
}

// Tokenize rule string into an array of tokens
function tokenize(ruleString) {
    return ruleString
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .split(/\s+/)
        .filter(token => token.length > 0);  // Remove empty tokens
}

// Parse tokens into an AST (Abstract Syntax Tree)
function parseTokensToAST(tokens) {
    const stack = [];

    while (tokens.length > 0) {
        const token = tokens.shift();

        if (token === '(') {
            stack.push(parseTokensToAST(tokens));
        } else if (token === ')') {
            break;
        } else if (token === 'AND' || token === 'OR') {
            const left = stack.pop();
            const right = parseTokensToAST(tokens);
            stack.push(new Node('operator', left, right, token));
        } else {
            const operator = tokens.shift(); 
            const value = tokens.shift(); 
            stack.push(new Node('operand', null, null, `${token} ${operator} ${value}`));
        }
    }

    return stack.length === 1 ? stack[0] : stack.pop();
}

// Create an AST from a rule string
function createRule(ruleString) {
    const tokens = tokenize(ruleString);
    return parseTokensToAST(tokens);
}

// Combine multiple rules into a single AST using OR
function combineRules(rules) {
    let combinedAST = null;
    for (const rule of rules) {
        const ast = createRule(rule);
        combinedAST = combinedAST ? new Node('operator', combinedAST, ast, 'OR') : ast;
    }
    return combinedAST;
}

// Evaluate the AST against provided data
function evaluateRule(node, data) {
    if (node.type === 'operator') {
        const leftResult = evaluateRule(node.left, data);
        const rightResult = evaluateRule(node.right, data);
        return node.value === 'AND' ? leftResult && rightResult : leftResult || rightResult;
    } else if (node.type === 'operand') {
        return evalCondition(node.value, data);
    }
    return false;
}

// Evaluate individual conditions
function evalCondition(condition, data) {
    const [key, operator, ...rest] = condition.split(' ');
    const value = rest.join(' ');

    if (operator === '>') {
        return data[key] > parseFloat(value);
    } else if (operator === '=') {
        return data[key] === value.replace(/'/g, '');  // Handle string comparisons
    } else if (operator === '<') {
        return data[key] < parseFloat(value);
    }
    return false;
}

module.exports = { createRule, combineRules, evaluateRule };
