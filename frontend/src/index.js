import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';  // Optional for styling
import App from './App';
import reportWebVitals from './reportWebVitals';  // Now this import will work

// Render the App component into the root element
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Optional: Report web vitals
reportWebVitals();
