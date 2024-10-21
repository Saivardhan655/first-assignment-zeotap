import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the app
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// MongoDB Atlas connection string
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define the rule schema
const ruleSchema = new mongoose.Schema({
    ruleString: String,
    ast: Object,
});
const Rule = mongoose.model('Rule', ruleSchema);
const allowedAttributes = ['age', 'department', 'salary', 'experience'];

// Node class for AST representation
class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type; // "operator" or "operand"
        this.left = left;
        this.right = right;
        this.value = value; // For operand: "age > 30", operator: "AND", "OR"
    }
}

// Initialize the parent AST
let parentAST = null; // This will hold the combined parent AST

// Tokenize the rule string into an array of tokens
function tokenize(ruleString) {
    return ruleString
        .replace(/\(/g, ' ( ')
        .replace(/\)/g, ' ) ')
        .split(/\s+/)
        .filter(token => token.length > 0); // Remove empty tokens
}

// Helper function to determine operator precedence
function precedence(op) {
    if (op === 'AND') return 2;
    if (op === 'OR') return 1;
    return 0;
}

// Helper function to create an operator node
function createOperatorNode(op, left, right) {
    return new Node('operator', left, right, op);
}


// Parse tokens into AST considering operator precedence
function parseTokensToAST(tokens) {
    const outputStack = [];
    const operatorStack = [];

    while (tokens.length > 0) {
        const token = tokens.shift();

        if (token === '(') {
            outputStack.push(parseTokensToAST(tokens)); // Recursively parse sub-expressions
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                const operator = operatorStack.pop();
                const right = outputStack.pop();
                const left = outputStack.pop();
                outputStack.push(createOperatorNode(operator, left, right));
            }
            operatorStack.pop(); // Remove the '('
            break;
        } else if (token === 'AND' || token === 'OR') {
            while (
                operatorStack.length > 0 &&
                precedence(operatorStack[operatorStack.length - 1]) >= precedence(token)
            ) {
                const operator = operatorStack.pop();
                const right = outputStack.pop();
                const left = outputStack.pop();
                outputStack.push(createOperatorNode(operator, left, right));
            }
            operatorStack.push(token);
        } else {
            const operator = tokens.shift(); // Comparison operator (>, <, =)
            const value = tokens.shift(); // Comparison value
            outputStack.push(new Node('operand', null, null, `${token} ${operator} ${value}`));
        }
    }

    while (operatorStack.length > 0) {
        const operator = operatorStack.pop();
        const right = outputStack.pop();
        const left = outputStack.pop();
        outputStack.push(createOperatorNode(operator, left, right));
    }

    return outputStack[0];
}


// Create an AST from the rule string
function createRule(ruleString) {
    const tokens = tokenize(ruleString);
    return parseTokensToAST(tokens);
}

// Function to combine multiple ASTs using a logical operator
function combineASTs(astList, operator = 'AND') {
    if (astList.length === 0) return null;
    if (astList.length === 1) return astList[0];  // If only one rule, return it as is

    // Combine all ASTs into one using the operator
    return astList.reduce((combined, ast) => {
        return new Node('operator', combined, ast, operator);  // Create a new operator node to combine
    });
}

// Function to update the parent AST with a new rule
function updateParentAST(newRuleAST) {
    if (parentAST === null) {
        parentAST = newRuleAST; // Set it as the new rule AST
    } else {
        parentAST = combineASTs([parentAST, newRuleAST], 'AND'); // Combine with the existing parent AST
    }
}

// Endpoint to create and save a rule
app.post('/create_rule', async (req, res) => {
    const { rule } = req.body;  // Extract the rule from the request body

    console.log('Received rule:', rule);  // Log the received rule to ensure it's correct

    try {
        const ruleAST = createRule(rule);  // Create the AST from the rule
        console.log('Generated AST:', ruleAST);  // Log the generated AST

        updateParentAST(ruleAST); // Update the parent AST with the new rule

        // Optional: Save the updated parent AST to the database
        await Rule.create({ ruleString: 'Combined Rules', ast: parentAST }); // Uncomment if you want to save

        res.json({ message: 'Rule created', ast: ruleAST, parentAST });
    } catch (error) {
        console.error('Error creating rule:', error);  // Log any errors that occur
        res.status(500).json({ message: 'Error creating rule', error });
    }
});

// Endpoint to get the current parent AST
app.get('/parent_ast', (req, res) => {
    res.json({ parentAST });
});

// Evaluate a rule AST against data
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

// Evaluate individual conditions for operands
function evalCondition(condition, data) {
    const [key, operator, value] = condition.split(' ');

    if (operator === '>') {
        return data[key] > parseFloat(value);
    } else if (operator === '=') {
        return data[key] === value.replace(/'/g, ''); // Remove quotes for string comparisons
    } else if (operator === '<') {
        return data[key] < parseFloat(value);
    }
    return false;
}

// Endpoint to evaluate a rule
app.post('/evaluate_rule', (req, res) => {
    const { data, ast } = req.body;

    console.log('Received AST:', JSON.stringify(ast, null, 2)); // Log the AST
    console.log('Data for evaluation:', data);

    if (!ast || typeof ast !== 'object' || !ast.type) {
        return res.status(400).json({ error: 'Invalid AST received' });
    }

    try {
        const result = evaluateRule(ast, data);
        res.json({ eligible: result });
    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({ error: 'Evaluation failed', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
