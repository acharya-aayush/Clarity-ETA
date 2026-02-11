import { useEffect, useState } from 'react';
import { api } from './utils/api';

// Define the shape of our data (Typescript!)
interface Transaction {
  id: number;
  amount: string;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.get('/transactions');
        setTransactions(data);
      } catch (e) {
        console.error("Failed to fetch", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Clarity Dashboard</h1>
      
      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-6 py-4">{t.description}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {t.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${
                  t.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Number(t.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;