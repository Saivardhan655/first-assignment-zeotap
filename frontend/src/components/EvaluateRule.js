import React, { useState, useEffect } from 'react';

function EvaluateRule() {
    const [data, setData] = useState('');
    const [ast, setAst] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(true);  // Handle loading state

    // Fetch the most recent AST and its corresponding data
    useEffect(() => {
        const fetchLatestRule = async () => {
            try {
                const response = await fetch('http://localhost:5000/latest_rule');
                if (response.ok) {
                    const { ast, data } = await response.json();
                    setAst(JSON.stringify(ast, null, 2));  // Format AST for textarea
                    setData(JSON.stringify(data, null, 2));  // Format data for textarea
                } else {
                    setResult('Error fetching the latest rule.');
                }
            } catch (error) {
                console.error('Error fetching the latest rule:', error);
                setResult('Error fetching rule data.');
            } finally {
                setLoading(false);  // Stop loading once data is fetched
            }
        };

        fetchLatestRule();
    }, []);

    const validateAst = (ast) => {
        if (!ast || typeof ast !== 'object') {
            throw new Error('Invalid AST format: should be an object.');
        }

        const { type, value, left, right } = ast;
        if (!type || !value) {
            throw new Error('Invalid AST: missing type or value.');
        }

        const validOperators = ['AND', 'OR'];
        if (validOperators.includes(value)) {
            if (left) validateAst(left);
            if (right) validateAst(right);
        } else if (type === 'operand' && !isValidOperand(value)) {
            throw new Error(`Invalid operand: ${value}`);
        } else {
            throw new Error(`Invalid operator: ${value}`);
        }
    };

    const isValidOperand = (value) => /^[a-zA-Z0-9\s=><]+$/.test(value);

    const isValidAttribute = (attribute) => {
        const allowedAttributes = ['age', 'department', 'salary', 'experience'];
        return allowedAttributes.includes(attribute);
    };

    const handleEvaluateRule = async () => {
        let parsedData, parsedAst;
        try {
            parsedData = JSON.parse(data);
            parsedAst = JSON.parse(ast);
            validateAst(parsedAst);
        } catch (error) {
            setResult(`Error: ${error.message}`);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/evaluate_rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: parsedData, ast: parsedAst }),
            });

            if (response.ok) {
                const res = await response.json();
                setResult(res.eligible ? 'Eligible' : 'Not Eligible');
            } else {
                setResult('Error evaluating rule.');
            }
        } catch (error) {
            console.error('Error evaluating rule:', error);
            setResult('Error evaluating rule');
        }
    };

    return (
        <div>
            <h2>Evaluate Rule</h2>

            {loading ? (
                <p>Loading latest rule...</p>
            ) : (
                <div>
                    <h3>Enter JSON Data:</h3>
                    <textarea
                        rows={8}
                        cols={50}
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                    />

                    <h3>Latest AST JSON:</h3>
                    <textarea
                        rows={12}
                        cols={50}
                        value={ast}
                        onChange={(e) => setAst(e.target.value)}
                    />

                    <button onClick={handleEvaluateRule}>Evaluate Rule</button>

                    <h3>Result:</h3>
                    <pre>{result}</pre>
                </div>
            )}
        </div>
    );
}

export default EvaluateRule;
