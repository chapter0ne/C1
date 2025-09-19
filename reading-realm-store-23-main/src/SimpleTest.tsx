import React from 'react';

const SimpleTest = () => {
  console.log('🔍 SimpleTest: Rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'yellow', 
      minHeight: '100vh',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1 style={{ color: 'red' }}>🚨 SIMPLE TEST - REACT IS WORKING 🚨</h1>
      <p>If you see this, React is definitely working!</p>
      <p>Time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default SimpleTest;
