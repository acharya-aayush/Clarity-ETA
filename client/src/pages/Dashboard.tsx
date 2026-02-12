import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Transaction, TransactionSummary, User } from '../types';
import { NeuCard, NeuButton, NeuAvatar } from '../components/Neumorphic';
import { CircularProgress } from '../components/CircularProgress';
import { AddTransactionWizard } from '../components/AddTransactionWizard';
import { AnalyticsView } from '../components/AnalyticsView';
import { ReportsView } from '../components/ReportsView';
import { Plus, TrendingUp, TrendingDown, Search, Filter, X, Calendar, Tag, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type ViewState = 'dashboard' | 'analytics' | 'reports';

const ITEMS_PER_PAGE = 5;
const CATEGORIES_PER_PAGE = 3;

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.getTransactions();
    // Convert amounts to numbers (backend returns them as strings from Postgres DECIMAL)
    const normalized = data.map(t => ({
      ...t,
      amount: Number(t.amount) || 0
    }));
    setTransactions(normalized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const summary = useMemo<TransactionSummary>(() => {
    return transactions.reduce(
      (acc, curr) => {
        const amount = Number(curr.amount) || 0;
        if (curr.type === 'income') {
          acc.income += amount;
          acc.balance += amount;
        } else {
          acc.expense += amount;
          acc.balance -= amount;
        }
        return acc;
      },
      { balance: 0, income: 0, expense: 0 }
    );
  }, [transactions]);

  const budgetHealth = summary.income > 0 ? Math.min(100, Math.round(((summary.income - summary.expense) / summary.income) * 100)) : 0;
  const categories = ['All', 'Food', 'Transport', 'Utilities', 'Shopping', 'Salary', 'Entertainment', 'Health', 'Education'];

  // Category Pagination
  const totalCategoryPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
  const currentCategories = useMemo(() => {
    const start = (categoryPage - 1) * CATEGORIES_PER_PAGE;
    return categories.slice(start, start + CATEGORIES_PER_PAGE);
  }, [categoryPage]);

  // Filter & Pagination Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => activeFilter === 'All' || t.category === activeFilter);
  }, [transactions, activeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  
  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // --- Sub-View Renders ---
  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
        <AnalyticsView transactions={transactions} onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'reports') {
    return (
      <div className="min-h-screen p-6 lg:p-12 max-w-7xl mx-auto">
        <ReportsView transactions={transactions} onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <div className="min-h-screen pb-24 lg:pb-8 fade-in flex flex-col">
      {/* Top Navigation Bar */}
      <header className="px-6 py-6 lg:px-12 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
           <NeuAvatar fallback={user.name[0]} size="md" />
           <div>
             <h2 className="text-neu-text text-sm font-semibold">Welcome back,</h2>
             <h1 className="text-neu-dark text-xl font-bold">{user.name}</h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <NeuButton variant="icon" className="hidden md:flex">
            <Search size={20} />
          </NeuButton>
          <NeuButton variant="default" className="hidden md:flex text-xs h-10 px-4" onClick={onLogout}>
            Logout
          </NeuButton>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1">
        
        {/* Left Column: Stats & Viz */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Main Hero Card */}
          <NeuCard className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-neu-text font-bold tracking-wide uppercase text-xs mb-2">Total Balance</span>
              <span className="text-5xl font-extrabold text-neu-dark mb-6">${summary.balance.toFixed(2)}</span>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-neu-pressed-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-neu-text">In: ${summary.income}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-neu-pressed-sm">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-sm font-bold text-neu-text">Out: ${summary.expense}</span>
                </div>
              </div>
            </div>
            <div className="z-10">
               <CircularProgress value={budgetHealth} label="Savings" subLabel="Rate" size={200} />
            </div>
          </NeuCard>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-6">
             <NeuCard 
                onClick={() => setCurrentView('analytics')}
                className="p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform cursor-pointer"
             >
                <div className="w-12 h-12 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center text-emerald-600">
                   <TrendingUp size={24} />
                </div>
                <span className="font-bold text-neu-dark">Analytics</span>
             </NeuCard>
             <NeuCard 
                onClick={() => setCurrentView('reports')}
                className="p-6 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform cursor-pointer"
             >
                <div className="w-12 h-12 rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center text-neu-primary">
                   <Filter size={24} />
                </div>
                <span className="font-bold text-neu-dark">Reports</span>
             </NeuCard>
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neu-dark">Transactions</h3>
            <NeuButton variant="icon" className="w-10 h-10 p-0">
               <Plus size={20} onClick={() => setIsWizardOpen(true)} />
            </NeuButton>
          </div>

          {/* Categories Pill List with Pagination */}
          <div className="flex items-center gap-2 px-6 -mx-6">
            <button 
              onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
              disabled={categoryPage === 1}
              className="p-1.5 rounded-full text-neu-text hover:text-neu-primary disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-3 overflow-hidden flex-1 py-4 justify-center">
              {currentCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap outline-none flex-shrink-0 ${
                    activeFilter === cat 
                      ? 'shadow-neu-pressed text-neu-primary scale-[0.98]' 
                      : 'bg-neu-light text-neu-text hover:text-neu-dark hover:scale-[1.02]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}
              disabled={categoryPage === totalCategoryPages}
              className="p-1.5 rounded-full text-neu-text hover:text-neu-primary disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            
            <div className="flex gap-1 ml-2">
              {Array.from({ length: totalCategoryPages }, (_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${categoryPage === i + 1 ? 'bg-neu-primary w-3' : 'bg-neu-text/30'}`}
                />
              ))}
            </div>
          </div>

          {/* Paginated List Container */}
          <div className="flex flex-col gap-4 min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage + activeFilter}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col gap-4"
                >
                    {currentTransactions.map((tx) => (
                        <NeuCard 
                        key={tx.id} 
                        onClick={() => setSelectedTransaction(tx)}
                        className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/30 transition-colors shrink-0"
                        >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-neu-flat ${
                            tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                            {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            </div>
                            <div>
                            <h4 className="font-bold text-neu-dark text-sm">{tx.category}</h4>
                            <p className="text-xs text-neu-text font-medium">{format(new Date(tx.date), 'MMM dd, HH:mm')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`block font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-neu-dark'}`}>
                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </span>
                        </div>
                        </NeuCard>
                    ))}
                    
                    {currentTransactions.length === 0 && (
                         <div className="text-center text-neu-text/40 py-10">No transactions found</div>
                    )}
                </motion.div>
              </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-auto pt-2">
                 <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full text-neu-text hover:text-neu-primary disabled:opacity-30 transition-colors"
                 >
                    <ChevronLeft size={20} />
                 </button>

                 <div className="flex items-center gap-3">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                currentPage === i + 1 
                                ? 'bg-neu-primary shadow-neu-pressed' // Active: Pressed in & Colored
                                : 'bg-neu-text/20 hover:bg-neu-text/40' // Inactive: Flat
                            }`}
                        />
                    ))}
                 </div>

                 <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full text-neu-text hover:text-neu-primary disabled:opacity-30 transition-colors"
                 >
                    <ChevronRight size={20} />
                 </button>
              </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <NeuButton variant="primary" onClick={() => setIsWizardOpen(true)} className="rounded-full w-16 h-16 !p-0 flex items-center justify-center shadow-neu-xl">
          <Plus size={32} />
        </NeuButton>
      </div>

      <AddTransactionWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSubmit={async (data) => {
          await api.addTransaction(data);
          loadData();
        }}
      />

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-base/80 backdrop-blur-sm fade-in" onClick={() => setSelectedTransaction(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <NeuCard className="w-full max-w-sm p-8 flex flex-col gap-6 relative shadow-neu-xl">
                 <button 
                    onClick={() => setSelectedTransaction(null)} 
                    className="absolute right-6 top-6 text-neu-text/40 hover:text-neu-danger transition-colors"
                >
                    <X size={24} />
                </button>
                
                <div className="text-center">
                    <h3 className="text-sm font-bold text-neu-text uppercase tracking-widest mb-2">Transaction Details</h3>
                    <div className={`text-4xl font-extrabold ${selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {selectedTransaction.type === 'income' ? '+' : '-'}${selectedTransaction.amount.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl shadow-neu-pressed-sm">
                        <Tag className="text-neu-primary" size={20} />
                        <div>
                            <p className="text-xs text-neu-text font-bold uppercase">Category</p>
                            <p className="text-neu-dark font-semibold">{selectedTransaction.category}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl shadow-neu-pressed-sm">
                        <Calendar className="text-neu-primary" size={20} />
                        <div>
                            <p className="text-xs text-neu-text font-bold uppercase">Date</p>
                            <p className="text-neu-dark font-semibold">{format(new Date(selectedTransaction.date), 'MMMM dd, yyyy - hh:mm a')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl shadow-neu-pressed-sm">
                        <FileText className="text-neu-primary mt-1" size={20} />
                        <div>
                            <p className="text-xs text-neu-text font-bold uppercase">Description</p>
                            <p className="text-neu-dark font-medium leading-relaxed">{selectedTransaction.description}</p>
                        </div>
                    </div>
                </div>

                <NeuButton className="w-full mt-2" onClick={() => setSelectedTransaction(null)}>
                    Close
                </NeuButton>
              </NeuCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};