// Simplified Index component for testing
import { useState } from "react";
import { Navigation } from "@/components/Navigation"; // FIXED: React.memo -> memo

const SimpleIndex = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Navigation />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#333', marginBottom: '1rem' }}>
          🚗 FRADES
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#666' }}>
          Premium Chauffeur Service - Simplified Homepage
        </p>
      </header>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Homepage Test</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Deze versie test of de homepage route werkt zonder complexe componenten
        </p>
        
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Counter: {count}
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '2rem', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>🔍 Debug Status</h3>
        <p style={{ color: '#666' }}>
          🔧 React import fixes toegepast op kritieke componenten
        </p>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '1rem auto', color: '#666' }}>
          <li>✅ Navigation - React.memo fixed</li>
          <li>✅ BookingForm - React.memo fixed</li>
          <li>✅ HourlyBookingForm - React.memo fixed</li>
          <li>� Testing volledige app...</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default SimpleIndex;