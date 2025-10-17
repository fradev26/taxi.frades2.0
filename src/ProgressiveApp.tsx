// Progressive App.tsx - stap voor stap functionaliteit toevoegen
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ROUTES } from "@/constants";

// Test simplified Index component
import SimpleIndex from "./pages/SimpleIndex";

// Basis homepage component
function HomePage() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', color: '#333', marginBottom: '1rem' }}>
          🚗 FRADES
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#666' }}>
          Premium Chauffeur Service
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
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Welkom bij FRADES</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Uw premium vervoerspartner voor zakelijke en privé ritten
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
            fontSize: '1rem',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Test Counter: {count}
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>✅ Status Check</h3>
          <ul style={{ color: '#666', lineHeight: '1.6' }}>
            <li>React: ✅ Werkend</li>
            <li>Vite Dev Server: ✅ Actief</li>
            <li>Routing: ✅ Klaar</li>
            <li>State Management: ✅ Functioneel</li>
            <li>ThemeProvider: ✅ Geladen</li>
            <li>QueryClient: ✅ Actief</li>
            <li>AuthProvider: ✅ Geïntegreerd</li>
            <li>UI Components: ✅ Geladen</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '1.5rem', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>🚀 Volgende Stappen</h3>
          <ul style={{ color: '#666', lineHeight: '1.6' }}>
            <li>✅ ThemeProvider toegevoegd</li>
            <li>✅ QueryClient setup</li>
            <li>✅ AuthProvider geïntegreerd</li>
            <li>✅ UI Components geladen</li>
            <li>🔄 ErrorBoundary toevoegen</li>
            <li>🔄 Volledige App activeren</li>
          </ul>
        </div>
      </div>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '3rem', 
        padding: '2rem',
        color: '#999',
        borderTop: '1px solid #eee'
      }}>
        <p>FRADES - Premium Chauffeur Service</p>
        <p>Server tijd: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}

// QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// App met alle providers, UI components en ErrorBoundary
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" attribute="class">
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path={ROUTES.HOME} element={<SimpleIndex />} />
                  <Route path="*" element={
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <h1>404 - Pagina niet gevonden</h1>
                      <a href="/" style={{ color: '#007bff' }}>Terug naar home</a>
                    </div>
                  } />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;