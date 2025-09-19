import React from 'react';

const DiagnosticApp = () => {
  console.log('🔍 DiagnosticApp: Rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>🔍 DIAGNOSTIC APP</h1>
      <p>If you can see this, React is working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <div style={{ 
        backgroundColor: 'lightblue', 
        padding: '10px', 
        margin: '10px 0',
        border: '2px solid blue'
      }}>
        <strong>React is rendering successfully!</strong>
      </div>
    </div>
  );
};

export default DiagnosticApp;
