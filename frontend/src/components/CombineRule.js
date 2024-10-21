import React, { useState } from 'react';

function CombineRule() {
    const [rules, setRules] = useState(['']); // Start with one empty rule
    const [result, setResult] = useState('');

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
    const handleCombineRules = async () => {
        try {
            const response = await fetch('http://localhost:5000/combine_rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules, operator: 'AND' }) // Send the array of rules
            });

            if (response.ok) {
                const res = await response.json();
                setResult(JSON.stringify(res.ast, null, 2)); 
            } else {
                setResult('Error: Unable to combine rules.');
            }
        } catch (error) {
            console.error('Error combining rules:', error);
            setResult('Error combining rules');
        }
    };

    return (
        <div>
            <h2>Combine Rules</h2>
            {rules.map((rule, index) => (
                <div key={index}>
                    <textarea
                        placeholder={`Enter rule ${index + 1}`}
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        rows={4}
                        cols={60}
                    />
                    <button onClick={() => removeRuleInput(index)}>Remove</button>
                </div>
            ))}
            <button onClick={addRuleInput}>Add Rule</button>
            <br />
            <button onClick={handleCombineRules}>Combine Rules</button>
            <h3>Combined AST Result:</h3>
            <pre>{result}</pre>
        </div>
    );
}

export default CombineRule;
