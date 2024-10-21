import React, { useState } from 'react';

function RuleForm() {
    const [rule, setRule] = useState('');  // Rule input from the user
    const [ast, setAst] = useState(null);  // State to store AST returned from backend
    const [result, setResult] = useState('');

    // Create Rule Handler
    const handleCreateRule = async () => {
        try {
            const response = await fetch('http://localhost:5000/create_rule', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'  // Ensure the content type is JSON
                },
                body: JSON.stringify({
                    rule: rule  // Send the rule input as a string
                }),
            });

            if (response.ok) {
                const res = await response.json();  // Parse the response from the backend
                console.log('Received AST:', res);

                // Store the AST received from the backend
                setAst(res.ast);

                // Display the AST in a readable format
                setResult(JSON.stringify(res.ast, null, 2)); 
            } else {
                setResult('Error: Unable to create rule.');
            }
        } catch (error) {
            console.error('Error creating rule:', error);
            setResult('Error creating rule');
        }
    };

    return (
        <div>
            <h2>Create and Evaluate Rule</h2>
            <textarea
                placeholder="Enter your rule"
                value={rule}
                onChange={(e) => setRule(e.target.value)}  // Update the rule as user types
                rows={4}
                cols={60}
            />
            <br />
            <button onClick={handleCreateRule}>Create Rule</button>

            <h3>AST Result:</h3>
            <pre>{result}</pre>  {/* Display the result or AST here */}
        </div>
    );
}

export default RuleForm;
