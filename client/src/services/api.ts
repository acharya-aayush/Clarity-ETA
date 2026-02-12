
import { Transaction, User } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

// Mock Data (Used if username is 'demo')
const mockUser: User = {
  id: 'demo-id',
  username: 'demo',
  name: 'Demo User',
};

let mockTransactions: Transaction[] = [
  { id: '1', amount: 2500, category: 'Salary', description: 'Monthly Salary', date: new Date().toISOString(), type: 'income' },
  { id: '2', amount: 45, category: 'Groceries', description: 'Weekly supply', date: new Date(Date.now() - 86400000).toISOString(), type: 'expense' },
  { id: '3', amount: 120, category: 'Utilities', description: 'Electric Bill', date: new Date(Date.now() - 172800000).toISOString(), type: 'expense' },
];

const isDemo = () => localStorage.getItem('clarity_mode') === 'demo';
const getAuthHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

export const api = {
  // Login with Username
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    // 1. DEMO CHECK
    if (username.toLowerCase() === 'demo') {
      localStorage.setItem('clarity_mode', 'demo');
      localStorage.setItem('token', 'demo-token');
      return { token: 'demo-token', user: mockUser };
    }

    // 2. REAL BACKEND
    localStorage.removeItem('clarity_mode');
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    
    // Map full_name to name for frontend
    const user: User = {
      id: data.user.id,
      username: data.user.username,
      name: data.user.full_name
    };
    
    return { token: data.token, user };
  },

  // Register with Username
  register: async (username: string, fullName: string, password: string): Promise<{ token: string; user: User }> => {
    localStorage.removeItem('clarity_mode');
    
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      body: JSON.stringify({ username, full_name: fullName, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(errorData.error || 'Registration failed');
    }
    
    const data = await res.json();
    localStorage.setItem('token', data.token);
    
    // Map full_name to name for frontend
    const user: User = {
      id: data.user.id,
      username: data.user.username,
      name: data.user.full_name
    };
    
    return { token: data.token, user };
  },

  getTransactions: async (): Promise<Transaction[]> => {
    if (isDemo()) return [...mockTransactions];

    const res = await fetch(`${API_URL}/transactions`, {
        headers: getAuthHeader()
    });
    if (!res.ok) return [];
    return res.json();
  },

  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    if (isDemo()) {
      const newTx: Transaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) };
      mockTransactions = [newTx, ...mockTransactions];
      return newTx;
    }

    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction),
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
    });
    return res.json();
  },

  getUser: async (): Promise<User> => {
    if (isDemo()) return mockUser;

    const res = await fetch(`${API_URL}/user/me`, {
        headers: getAuthHeader()
    });
    
    if (!res.ok) throw new Error('Session expired');
    const data = await res.json();
    
    // Map full_name to name for frontend
    return {
      id: data.id,
      username: data.username,
      name: data.full_name
    };
  }
};
