import { Rule } from '../models/Rule.js';
import { createRule, combineASTs } from '../utils/astUtils.js';

// In-memory storage for parent AST
let parentAST = null;

// Create and save a new rule
export const createRuleHandler = async (req, res) => {
    const { rule } = req.body;
    console.log('Received rule:', rule);
    try {
        const ruleAST = createRule(rule);
        console.log('Generated AST:', ruleAST);
        updateParentAST(ruleAST);

        await Rule.create({ ruleString: rule, ast: ruleAST });
        res.json({ message: 'Rule created', ast: ruleAST });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ message: 'Error creating rule', error });
    }
};

// Fetch the current parent AST
export const getParentASTHandler = (req, res) => {
    res.json({ parentAST });
};

// Fetch the latest rule from the database
export const getLatestRuleHandler = async (req, res) => {
    try {
        const latestRule = await Rule.findOne().sort({ createdAt: -1 });
        if (!latestRule) return res.status(404).json({ message: 'No rule found' });

        res.json({ ast: latestRule.ast, data: { age: 30, department: "Engineering" } });
    } catch (error) {
        console.error('Error fetching latest rule:', error);
        res.status(500).json({ message: 'Error fetching the latest rule', error });
    }
};

// Combine multiple ASTs
export const combineASTsHandler = (req, res) => {
    const { rules, operator } = req.body;

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
    if (!parentAST) {
        parentAST = newRuleAST;
    } else {
        parentAST = new Node('operator', parentAST, newRuleAST, 'AND');
    }
};
