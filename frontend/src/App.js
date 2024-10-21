import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CreateRule from './components/CreateRule';
import CombineRule from './components/CombineRule';
import EvaluateRule from './components/EvaluateRule';
import './App.css';  // Optional for styling

function App() {
    return (
        <Router>
            <div>
                <h1>Rule Engine Application</h1>

                {/* Navigation Buttons */}
                <nav>
                    <button><Link to="/create-rule">Create Rule</Link></button>
                    <button><Link to="/combine-rule">Combine Rule</Link></button>
                    <button><Link to="/evaluate-rule">Evaluate Rule</Link></button>
                </nav>

                {/* Define Routes for Different Pages */}
                <Routes>
                    <Route path="/create-rule" element={<CreateRule />} />
                    <Route path="/combine-rule" element={<CombineRule />} />
                    <Route path="/evaluate-rule" element={<EvaluateRule />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
