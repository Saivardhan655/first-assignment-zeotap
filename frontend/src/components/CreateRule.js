import React, { useState } from 'react';
API_URL=process.env.API_URL;
function CreateRule() {
    const [rule, setRule] = useState('');
    const [ast, setAst] = useState(null);
    const [result, setResult] = useState('');

    const handleCreateRule = async () => {
        try {
            const response = await fetch('API_URL/api/rules/create_rule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rule })
            });

            if (response.ok) {
                const res = await response.json();
                setAst(res.ast);
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
        <div className='page-conainer'>
            <h2>Create Rule</h2>
            <textarea
                placeholder="Enter your rule"
                value={rule}
                onChange={(e) => setRule(e.target.value)}
                rows={8}
                cols={60}
                className='txt-area'
            />
            <br />
            <button className='page-btn' onClick={handleCreateRule}>Create Rule</button>
            {/* <h3>AST Result:</h3>
            <pre>{result}</pre> */}
            {result && (
                <>
                    <h3>AST Result:</h3>
                    <pre>{result}</pre>
                </>
            )}
        </div>
    );
}

export default CreateRule;
