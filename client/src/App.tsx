import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { User } from './types';
import { api } from './services/api';

type AuthView = 'login' | 'signup';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');

  useEffect(() => {
    // Check for session (mock)
    const checkSession = async () => {
      try {
        const currentUser = await api.getUser();
        // Comment out auto-login for now to show the Login page first as requested
        // setUser(currentUser); 
      } catch (e) {
        console.log("No session");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return <div className="min-h-screen bg-neu-base flex items-center justify-center text-neu-text">Loading Clarity...</div>;

  if (user) {
      return (
        <div className="min-h-screen bg-neu-base text-neu-text antialiased selection:bg-neu-primary/20">
            <Dashboard user={user} onLogout={() => setUser(null)} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-neu-base text-neu-text antialiased selection:bg-neu-primary/20">
      {authView === 'login' ? (
          <Login onLogin={setUser} onNavigateToSignup={() => setAuthView('signup')} />
      ) : (
          <Signup onLogin={setUser} onNavigateToLogin={() => setAuthView('login')} />
      )}
    </div>
  );
}

export default App;