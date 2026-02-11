// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus } from 'lucide-react'; // Make sure you installed lucide-react

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
    } catch (e) {
      console.error(e);
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
      setForm({ description: '', amount: '', type: 'expense', category: 'Food' }); // Reset
      fetchTransactions(); // Refresh list
    } catch (e) {
      alert('Failed to add transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Clarity</h1>
        <button onClick={logout} className="text-sm text-gray-600 hover:text-red-500">Logout</button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        
        {/* Add Transaction Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus size={20}/> Add Transaction</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              placeholder="Description" 
              className="border p-2 rounded" 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
            />
            <input 
              type="number" 
              placeholder="Amount" 
              className="border p-2 rounded" 
              value={form.amount} 
              onChange={e => setForm({...form, amount: e.target.value})} 
            />
            <select 
              className="border p-2 rounded" 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value as any})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select 
              className="border p-2 rounded" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Salary">Salary</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
            </select>
            <button className="bg-blue-600 text-white p-2 rounded md:col-span-4 hover:bg-blue-700 font-medium">Add Transaction</button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{t.description}</td>
                    <td className="p-4">
                      <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">{t.category}</span>
                    </td>
                    <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
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