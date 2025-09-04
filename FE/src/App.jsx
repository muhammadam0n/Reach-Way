import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Config/Router/Router";
import { Provider } from "react-redux";
import store from "./Store/store";
import { Toaster } from "react-hot-toast";
import useCheckTokenExpiry from "./Components/useCheckTokenExpiry";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ color: '#c33' }}>Something went wrong</h1>
          <p>Error: {this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#c33',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingFallback = () => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <h2 style={{ color: '#333', marginBottom: '20px' }}>Loading Media-Minds...</h2>
    <p style={{ color: '#666' }}>Please wait while the app initializes</p>
    <div style={{ 
      width: '40px', 
      height: '40px', 
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginTop: '20px'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const App = () => {
  console.log("App component rendering...");
  
  try {
    useCheckTokenExpiry();
    
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <Suspense fallback={<LoadingFallback />}>
            <div style={{ minHeight: '100vh' }}>
              <RouterProvider router={router} />
              <Toaster />
            </div>
          </Suspense>
        </Provider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error in App component:", error);
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        margin: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ color: '#c33' }}>App Error</h1>
        <p>Error: {error?.message || 'Unknown error'}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#c33',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
};

export default App;
