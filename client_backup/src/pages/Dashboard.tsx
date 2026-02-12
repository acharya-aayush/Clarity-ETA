// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

interface Transaction {
  id: number;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food'
  });

  const fetchTransactions = async () => {
    try {
      const data = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    
    try {
      await api.post('/transactions', {
        ...form,
        date: new Date().toISOString()
      });
      setForm({ description: '', amount: '', type: 'expense', category: 'Food' });
      fetchTransactions();
    } catch {
      alert('Failed to add transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Clarity</h1>
          <button 
            onClick={logout} 
            className="text-sm text-gray-700 hover:text-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-300"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        
        {/* Add Transaction Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Transaction</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input 
              placeholder="Description" 
              className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-900" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              required
            />
            <input 
              type="number" 
              step="0.01"
              placeholder="Amount" 
              className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-900" 
              value={form.amount} 
              onChange={e => setForm({...form, amount: e.target.value})} 
              required
            />
            <select 
              className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 bg-white" 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value as 'income' | 'expense'})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select 
              className="border-2 border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 bg-white" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Salary">Salary</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md hover:shadow-lg">
              Add
            </button>
          </form>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-2">No transactions yet</p>
              <p className="text-sm text-gray-400">Add your first transaction above to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(t.id)} 
                        className="text-gray-400 hover:text-red-600 transition-all p-2 rounded-lg hover:bg-red-50"
                        title="Delete transaction"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}