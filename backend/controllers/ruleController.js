import { Rule } from '../models/Rule.js';
import { createRule, combineASTs } from '../utils/astUtils.js';

// In-memory storage for parent AST
let parentAST = null;

// Create and save a new rule
export const createRuleHandler = async (req, res) => {
    const { rule } = req.body;

    if (!rule || typeof rule !== 'string') {
        return res.status(400).json({ message: 'Invalid input: rule must be a non-empty string.' });
    }

    console.log('Received rule:', rule);
    try {
        const ruleAST = createRule(rule);
        console.log('Generated AST:', ruleAST);
        //updateParentAST(ruleAST);

        await Rule.create({ ruleString: rule, ast: ruleAST });
        res.json({ message: 'Rule created', ast: ruleAST });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ message: 'Error creating rule', error: error.message });
    }
};

// Fetch the current parent AST
export const getParentASTHandler = (req, res) => {
    try {
        if (!parentAST) {
            return res.status(404).json({ message: 'No parent AST found.' });
        }
        res.json({ parentAST });
    } catch (error) {
        console.error('Error fetching parent AST:', error);
        res.status(500).json({ message: 'Error fetching parent AST', error: error.message });
    }
};

// Fetch the latest rule from the database
export const getLatestRuleHandler = async (req, res) => {
    try {
        const latestRule = await Rule.findOne().sort({ createdAt: -1 });
        if (!latestRule) {
            return res.status(404).json({ message: 'No rule found.' });
        }

        res.json({ ast: latestRule.ast, data: { age: 30, department: 'Engineering' } });
    } catch (error) {
        console.error('Error fetching latest rule:', error);
        res.status(500).json({ message: 'Error fetching the latest rule', error: error.message });
    }
};

// Combine multiple ASTs
export const combineASTsHandler = (req, res) => {
    const { rules, operator } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
        return res.status(400).json({ error: 'Invalid input: rules must be a non-empty array.' });
    }
    if (operator !== 'AND' && operator !== 'OR') {
        return res.status(400).json({ error: 'Invalid operator. Only AND or OR are allowed.' });
    }

    try {
        const combinedAST = combineASTs(rules, operator);
        console.log('Updated parent AST:', combinedAST);

        res.json({ combinedAST });
    } catch (error) {
        console.error('Error combining ASTs:', error);
        res.status(500).json({ error: 'Failed to combine ASTs', details: error.message });
    }
};

// Update the parent AST with a new rule
const updateParentAST = (newRuleAST) => {
    if (!isValidAST(newRuleAST)) {
        throw new Error('Invalid AST structure. Cannot update parent AST.');
    }
    if (!parentAST) {
        parentAST = newRuleAST;
    } else {
        parentAST = new Node('operator', parentAST, newRuleAST, 'AND');
    }
};
const isValidAST = (ast) => {
    return ast && typeof ast === 'object' && ast.type && ['operator', 'operand'].includes(ast.type);
};

// Evaluate individual conditions
function evalCondition(condition, data) {
    try {
        const [key, operator, value] = condition.split(' ');

        if (!data.hasOwnProperty(key)) return false;

        switch (operator) {
            case '>':
                return data[key] > parseFloat(value);
            case '=':
                return data[key] === value.replace(/'/g, ''); // Remove quotes for string comparison
            case '<':
                return data[key] < parseFloat(value);
            default:
                return false;
        }
    } catch (error) {
        console.error('Error evaluating condition:', error);
        return false;
    }
}

// Evaluate the AST recursively
function evaluateRule(node, data) {
    try {
        if (node.type === 'operator') {
            const leftResult = evaluateRule(node.left, data);
            const rightResult = evaluateRule(node.right, data);
            return node.value === 'AND' ? leftResult && rightResult : leftResult || rightResult;
        } else if (node.type === 'operand') {
            return evalCondition(node.value, data);
        }
        return false;
    } catch (error) {
        console.error('Error evaluating rule:', error);
        return false;
    }
}

// Controller function to handle rule evaluation requests
export function evaluateRuleHandler(req, res) {
    const { data, ast } = req.body;

    if (!ast || typeof ast !== 'object') {
        return res.status(400).json({ error: 'Invalid AST received.' });
    }

    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data received.' });
    }

    console.log('Received AST:', ast);
    console.log('Data for evaluation:', data);

    try {
        const result = evaluateRule(ast, data);
        res.json({ eligible: result });
    } catch (error) {
        console.error('Error evaluating rule:', error);
        res.status(500).json({ error: 'Error evaluating rule', details: error.message });
    }
}
