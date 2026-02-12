import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { NeuCard, NeuButton } from './Neumorphic';
import { ArrowLeft } from 'lucide-react';
import { Transaction } from '../types';
import { format } from 'date-fns';

// Helper functions to replace date-fns imports that were causing issues
const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

interface AnalyticsViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, onBack }) => {
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  // 1. Process Weekly Activity Data (Last 7 Days)
  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return startOfDay(d);
    });

    return last7Days.map(day => {
      const dayTransactions = transactions.filter(t => isSameDay(new Date(t.date), day));
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return {
        name: format(day, 'EEE'), // Mon, Tue...
        fullDate: format(day, 'MMM dd'),
        income,
        expense
      };
    });
  }, [transactions]);

  // 2. Process Category Data
  const categoryData = useMemo(() => {
    const filtered = transactions.filter(t => t.type === categoryType);
    const grouped = filtered.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categoryType]);

  // 3. Savings Rate Logic (Current Month)
  const savingsRate = useMemo(() => {
    const now = new Date();
    const currentMonthTxs = transactions.filter(t => 
      new Date(t.date).getMonth() === now.getMonth() && 
      new Date(t.date).getFullYear() === now.getFullYear()
    );
    const income = currentMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    if (income === 0) return 0;
    return Math.max(0, Math.round(((income - expense) / income) * 100));
  }, [transactions]);

  // Custom Tooltip for cleaner look without white glow
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neu-base p-4 rounded-xl shadow-lg border border-white/20 text-sm z-50">
          <p className="font-bold text-neu-dark mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium flex items-center justify-between gap-4">
              <span>{entry.name === 'income' ? 'Income' : entry.name === 'expense' ? 'Expense' : entry.name}:</span> 
              <span className="font-bold">${entry.value.toFixed(2)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full fade-in">
      <div className="flex items-center gap-4">
        <NeuButton variant="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </NeuButton>
        <h2 className="text-2xl font-bold text-neu-dark">Analytics Overview</h2>
      </div>

      {/* Income vs Expense Chart */}
      <NeuCard className="p-8 flex flex-col gap-6">
        <h3 className="text-lg font-bold text-neu-text uppercase tracking-wider text-xs">Last 7 Days Activity</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </NeuCard>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NeuCard className="p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-bold text-neu-text uppercase tracking-wider text-xs">{categoryType === 'income' ? 'Earnings' : 'Spending'} by Category</h3>
             {/* Simple Custom Toggle */}
             <div className="flex bg-neu-base shadow-neu-pressed rounded-lg p-1">
                <button 
                  onClick={() => setCategoryType('expense')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${categoryType === 'expense' ? 'bg-neu-primary text-white shadow-neu-flat' : 'text-neu-text hover:text-neu-dark'}`}
                >
                  Exp
                </button>
                <button 
                  onClick={() => setCategoryType('income')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${categoryType === 'income' ? 'bg-neu-primary text-white shadow-neu-flat' : 'text-neu-text hover:text-neu-dark'}`}
                >
                  Inc
                </button>
             </div>
          </div>
          
          <div className="h-[250px] w-full">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} width={80} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="value" fill={categoryType === 'income' ? "#10B981" : "#EF4444"} radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-neu-text/50 text-sm">
                    No data available for {categoryType}s
                </div>
            )}
          </div>
        </NeuCard>

        <NeuCard className="p-8 flex flex-col justify-center items-center text-center gap-4">
            <div className={`w-24 h-24 rounded-full shadow-neu-pressed flex items-center justify-center font-bold text-2xl ${savingsRate >= 20 ? 'text-emerald-500' : savingsRate > 0 ? 'text-neu-primary' : 'text-rose-500'}`}>
                {savingsRate}%
            </div>
            <p className="text-neu-dark font-bold text-lg">Monthly Savings Rate</p>
            <p className="text-neu-text text-sm max-w-[200px]">
                {savingsRate > 20 
                    ? "Great job! You're saving a healthy portion of your income." 
                    : savingsRate > 0 
                        ? "You're saving, but try to cut back on discretionary spending." 
                        : "You're spending more than you earn this month."}
            </p>
        </NeuCard>
      </div>
    </div>
  );
};