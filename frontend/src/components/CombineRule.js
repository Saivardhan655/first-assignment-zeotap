import React, { useState } from 'react';

function CombineRule() {
    const [rules, setRules] = useState(['']); // Start with one empty rule
    const [result, setResult] = useState('');
    const [operator, setOperator] = useState('AND'); // State for operator

    // Handle input change for rules
    const handleRuleChange = (index, value) => {
        const newRules = [...rules];
        newRules[index] = value;
        setRules(newRules);
    };

    // Add a new rule input
    const addRuleInput = () => {
        setRules([...rules, '']);
    };

    // Remove a rule input
    const removeRuleInput = (index) => {
        const newRules = rules.filter((_, i) => i !== index);
        setRules(newRules);
    };

    // Handle combining rules
    // Handle combining rules
const handleCombineRules = async (event) => {
    event.preventDefault(); // Prevent form submission
    if (rules.some(rule => !rule.trim())) {
        setResult('Error: All rules must be filled out.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/combine_ast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rules, operator }) // Send the array of rules
        });

        if (!response.ok) {
            const errorText = await response.text(); // Read the response as text
            setResult(`Error: ${errorText}`); // Show the error response
            return;
        }

        const res = await response.json();
        // Set the result to the combined AST as a formatted JSON string
        setResult(JSON.stringify(res.combinedAST, null, 2)); 
    } catch (error) {
        console.error('Error combining rules:', error);
        setResult('Error combining rules');
    }
};

    

    return (
        <div className='page-container '>
            <h2>Combine Rules</h2>
            <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
            </select>
            {rules.map((rule, index) => (
                <div key={index} className='combined-rule-container'>
                    <textarea
                        placeholder={`Enter rule ${index + 1}`}
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        rows={4}
                        cols={60}
                        className='txt-area'
                    />
                    <button className='page-btn1' onClick={() => removeRuleInput(index)}>Remove</button>
                </div>
            ))}
            <button className='page-btn1' onClick={addRuleInput}>Add Rule</button>
            <br />
            <button className='page-btn1' onClick={handleCombineRules}>Combine Rules</button>
            {/* <h3>Combined AST Result:</h3>
            <pre>{result}</pre> */}
            {result &&
                <>
                    <h3>Combined AST Result:</h3>
                    <pre>{result}</pre> 
                </>
            }
        </div>
    );
}

export default CombineRule;
