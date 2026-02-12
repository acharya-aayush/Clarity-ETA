
import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight } from 'lucide-react';
import { NeuCard, NeuInput, NeuButton, NeuToggle } from '../components/Neumorphic';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup }) => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('password');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await api.login(username, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden fade-in">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neu-base shadow-neu-flat opacity-50 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-neu-base shadow-neu-flat opacity-50 blur-3xl" />

      <NeuCard className="w-full max-w-md p-10 flex flex-col gap-8 relative z-10 shadow-neu-xl">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full shadow-neu-flat flex items-center justify-center mb-6 text-neu-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neu-dark tracking-tight">Clarity</h1>
          <p className="text-neu-text text-sm">Sign in with your username</p>
        </div>

        {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <NeuInput 
              icon={<UserIcon size={18} />}
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <NeuInput 
              icon={<Lock size={18} />}
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <NeuToggle checked={remember} onChange={setRemember} />
              <span className="text-xs font-semibold text-neu-text">Remember me</span>
            </div>
            <a href="#" className="text-xs font-bold text-neu-primary hover:underline">Forgot Password?</a>
          </div>

          <NeuButton type="submit" variant="primary" className="w-full py-4 text-lg shadow-neu-flat" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight size={20} />}
          </NeuButton>
        </form>

        <div className="space-y-4 text-center">
            <div className="text-center">
            <span className="text-xs text-neu-text">New here? </span>
            <button onClick={onNavigateToSignup} className="text-xs font-bold text-neu-primary hover:underline">
                Create an Account
            </button>
            </div>
            
            <div className="py-3 px-4 rounded-xl bg-neu-base shadow-neu-pressed-sm inline-block">
            {/* <p className="text-[10px] text-neu-text uppercase font-bold tracking-widest mb-1">Cheat Code</p> */}
            <p className="text-xs text-neu-dark font-mono">user: demo</p>
            <p className="text-xs text-neu-dark font-mono">pass: password</p>
            </div>
        </div>
      </NeuCard>
    </div>
  );
};
