import React from 'react';

const TestApp = () => {
  console.log('TestApp rendering');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1>Test App</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestApp;
