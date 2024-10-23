import React, { useState, useEffect } from 'react';

function EvaluateRule() {
    const [data, setData] = useState('');  // Holds the data for evaluation
    const [astOptions, setAstOptions] = useState([]);  // Available AST options
    const [selectedAst, setSelectedAst] = useState('');  // Selected AST from dropdown
    const [customAst, setCustomAst] = useState('');  // Custom AST entered by the user
    const [result, setResult] = useState('');  // Evaluation result
    const [loading, setLoading] = useState(true);  // Loading state

    // Fetch the most recent AST and parent AST
    useEffect(() => {
        const fetchLatestRule = async () => {
            try {
                const response = await fetch('http://localhost:5000/latest_rule');
                if (response.ok) {
                    const { ast: recentAst, data } = await response.json();

                    // Corrected endpoint from '/parent_rule' to '/parent_ast'
                    const parentResponse = await fetch('http://localhost:5000/parent_ast'); 
                    const parentAst = parentResponse.ok ? await parentResponse.json() : null;

                    // Populate AST options
                    setAstOptions([
                        { name: 'Most Recent AST', ast: JSON.stringify(recentAst, null, 2) },
                        { name: 'Parent AST', ast: parentAst ? JSON.stringify(parentAst, null, 2) : 'No parent AST found' },
                    ]);

                    // Set the data for the evaluation
                    setData(JSON.stringify(data, null, 2));
                } else {
                    setResult('Error fetching the latest rule.');
                }
            } catch (error) {
                console.error('Error fetching rule:', error);
                setResult('Error fetching rule data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLatestRule();
    }, []);

    const handleEvaluateRule = async () => {
        let parsedData, parsedAst;
        
        // Try to parse the data and AST
        try {
            parsedData = JSON.parse(data);
            parsedAst = customAst ? JSON.parse(customAst) : JSON.parse(selectedAst); // Use custom AST or selected AST
            if (!parsedAst) {
                setResult('Please select or enter a valid AST.');
                return;
            }
        } catch (error) {
            setResult('Invalid JSON format. Please check your inputs.');
            return;
        }

        // Send evaluation request to backend
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
            setResult('Error evaluating rule.');
        }
    };

    return (
        <div className='page-container'>
            <h2>Evaluate Rule</h2>

            {loading ? (
                <p>Loading latest rule...</p>
            ) : (
                <div className='page-container'>
                    {/* Enter JSON Data */}
                    <h5>Enter JSON Data:</h5>
                    <textarea
                    className='txt-area'
                        rows={8}
                        cols={50}
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        placeholder='Enter the JSON Data'
                    />

                    {/* Select or Enter AST */}
                    <h3>Select AST:</h3>
                    <select
                        value={selectedAst}
                        onChange={(e) => setSelectedAst(e.target.value)}
                    >
                        <option value="">-- Select an AST --</option>
                        {astOptions.map((option, index) => (
                            <option key={index} value={option.ast}>
                                {option.name}
                            </option>
                        ))}
                    </select>

                    {/* Custom AST */}
                    <h3>Or Enter Your Own AST:</h3>
                    <textarea
                        className='txt-area'
                        rows={12}
                        cols={50}
                        placeholder="Enter custom AST in JSON format..."
                        value={customAst}
                        onChange={(e) => setCustomAst(e.target.value)}
                    />

                    {/* Evaluate Button */}
                    <button className='page-btn2' onClick={handleEvaluateRule}>Evaluate Rule</button>

                    {/* Result */}
                    {/* <h3>Result:</h3>
                    <pre>{result}</pre> */}
                    {
                        result && 
                        <>
                            <h3>Result:</h3>
                            <pre>{result}</pre> 
                        </>
                    }
                </div>
            )}
        </div>
    );
}

export default EvaluateRule;
