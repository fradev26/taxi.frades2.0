function TestApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '2rem' }}>🚗 FRADES Test App</h1>
      <p style={{ color: '#666', fontSize: '1.2rem' }}>Als je dit ziet, werkt de basic React setup!</p>
      <p style={{ color: '#999' }}>Server tijd: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default TestApp;