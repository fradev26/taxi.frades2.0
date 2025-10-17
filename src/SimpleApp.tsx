// Simplified App.tsx for debugging
import { useState } from "react";

const SimpleApp = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>🚗 FRADES - Premium Chauffeur Service</h1>
      
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2>Welkom bij FRADES</h2>
        <p>Premium chauffeur service voor al uw vervoersbehoeften</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clicks: {count}
        </button>
      </div>

      <div style={{ color: '#666' }}>
        <p>✅ React werkt correct</p>
        <p>✅ State management werkt</p>
        <p>✅ Event handlers werken</p>
        <p>⏰ {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SimpleApp;