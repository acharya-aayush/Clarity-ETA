
import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, ArrowLeft, AlertCircle, Type } from 'lucide-react';
import { NeuCard, NeuInput, NeuButton } from '../components/Neumorphic';
import { api } from '../services/api';
import { User } from '../types';

interface SignupProps {
  onLogin: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onLogin, onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const { user } = await api.register(username, fullName, password);
        onLogin(user);
    } catch (err) {
        setError('Username already taken or invalid.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden fade-in">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neu-base shadow-neu-flat opacity-50 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-neu-base shadow-neu-flat opacity-50 blur-3xl" />

      <NeuCard className="w-full max-w-md p-10 flex flex-col gap-8 relative z-10 shadow-neu-xl">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full shadow-neu-flat flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo.webp" alt="Clarity Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-neu-dark tracking-tight">Create Account</h1>
                <p className="text-neu-text text-sm">Join Clarity today</p>
            </div>
            <NeuButton variant="icon" onClick={onNavigateToLogin} className="w-10 h-10 p-0 flex-shrink-0">
                <ArrowLeft size={20} />
            </NeuButton>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <NeuInput 
              icon={<UserIcon size={18} />}
              type="text" 
              placeholder="Pick a Username" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
             <NeuInput 
              icon={<Type size={18} />}
              type="text" 
              placeholder="Display Name (e.g. John)" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <NeuInput 
              icon={<Lock size={18} />}
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <NeuButton type="submit" variant="primary" className="w-full py-4 text-lg shadow-neu-flat" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
            {!loading && <ArrowRight size={20} />}
          </NeuButton>
        </form>

        <div className="text-center mt-4">
          <span className="text-xs text-neu-text">Already have an account? </span>
          <button onClick={onNavigateToLogin} className="text-xs font-bold text-neu-primary hover:underline">Sign In</button>
        </div>
      </NeuCard>
    </div>
  );
};
