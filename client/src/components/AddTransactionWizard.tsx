import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, FileText, ArrowLeft, Calendar } from 'lucide-react';
import { NeuButton, NeuInput, NeuCard } from './Neumorphic';
import { Transaction } from '../types';

interface AddTransactionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void>;
}

const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Utilities', 'Entertainment', 
  'Shopping', 'Health', 'Education', 'Travel', 'Groceries', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Business', 
  'Gift', 'Rental', 'Refunds', 'Other'
];

export const AddTransactionWizard: React.FC<AddTransactionWizardProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString()
  });

  // Reset category if type changes
  useEffect(() => {
    if (formData.type) {
        // Optional: clear category when switching types to prevent invalid states
        // but checking if current category exists in new list is better UX
        const currentList = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        if (formData.category && !currentList.includes(formData.category)) {
            setFormData(prev => ({ ...prev, category: undefined }));
        }
    }
  }, [formData.type]);

  if (!isOpen) return null;

  const currentCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleNext = () => {
      if (step === 2 && !formData.category) return; // Prevent next if no category selected
      setStep(s => s + 1);
  };
  
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.category) return;
    
    setLoading(true);
    try {
      await onSubmit({
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description || 'No description',
        date: formData.date || new Date().toISOString(),
        type: formData.type as 'income' | 'expense'
      });
      onClose();
      // Reset form after close animation
      setTimeout(() => {
        setStep(1);
        setFormData({ type: 'expense', date: new Date().toISOString() });
      }, 300);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateData = (key: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0
    })
  };

  // Title Logic
  const getTitle = () => {
      switch(step) {
          case 1: return 'Enter Amount';
          case 2: return 'Select Category';
          case 3: return 'Add Details';
          default: return '';
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neu-base/80 backdrop-blur-sm fade-in">
      <NeuCard className="w-full max-w-md h-[680px] flex flex-col relative overflow-hidden rounded-[40px] shadow-neu-xl">
        
        {/* Header */}
        <div className="relative flex items-center justify-center p-8 pb-4">
            {/* Back Button */}
            <button 
                onClick={handleBack} 
                className={`absolute left-8 text-neu-text/40 hover:text-neu-dark transition-colors p-2 -ml-2 ${step === 1 ? 'invisible' : ''}`}
            >
                <ArrowLeft size={24} />
            </button>

            {/* Centered Title */}
            <h2 className="text-xl font-bold text-neu-dark tracking-tight">
                {getTitle()}
            </h2>

            {/* Close Button */}
            <button 
                onClick={onClose} 
                className="absolute right-8 text-neu-text/40 hover:text-neu-danger transition-colors p-2 -mr-2"
            >
                <X size={24} />
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-8 pt-4 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait" custom={step}>
            
            {/* STEP 1: AMOUNT */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={step}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-10 w-full h-full justify-center"
              >
                <div className="flex justify-center gap-6">
                  <NeuButton 
                    active={formData.type === 'expense'} 
                    onClick={() => updateData('type', 'expense')}
                    className="flex-1 py-4 text-lg rounded-2xl"
                  >
                    Expense
                  </NeuButton>
                  <NeuButton 
                    active={formData.type === 'income'} 
                    onClick={() => updateData('type', 'income')}
                    className="flex-1 py-4 text-lg rounded-2xl"
                  >
                    Income
                  </NeuButton>
                </div>

                <div className="relative flex items-center justify-center py-10">
                  <span className="text-5xl text-neu-text/30 absolute left-4 top-1/2 -translate-y-1/2 font-light">$</span>
                  <input
                    type="number"
                    autoFocus
                    value={formData.amount || ''}
                    onChange={(e) => updateData('amount', e.target.value)}
                    className="w-full bg-transparent text-6xl font-bold text-neu-dark text-center outline-none placeholder-neu-text/10"
                    placeholder="0"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: CATEGORY - GRID LAYOUT */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={step}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                // FIX: Increased padding (p-6) and negative margin to ensure shadows aren't cut off
                className="h-full overflow-y-auto -mx-6 px-6 py-6"
              >
                  <div className="grid grid-cols-2 gap-5">
                    {currentCategories.map(cat => (
                    <NeuButton
                        key={cat}
                        active={formData.category === cat}
                        onClick={() => updateData('category', cat)}
                        className="h-16 text-sm font-semibold rounded-2xl transition-all duration-300"
                    >
                        {cat}
                    </NeuButton>
                    ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={step}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-8 pt-4"
              >
                <NeuInput 
                  label="Description" 
                  icon={<FileText size={20} />}
                  value={formData.description || ''}
                  onChange={(e) => updateData('description', e.target.value)}
                  placeholder="e.g. Starbuck's Coffee"
                  className="py-5"
                />
                
                <NeuInput 
                  label="Date" 
                  type="date"
                  icon={<Calendar size={20} />}
                  value={formData.date?.split('T')[0]}
                  onChange={(e) => updateData('date', new Date(e.target.value).toISOString())}
                  className="py-5"
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Action Button */}
        <div className="p-8 pt-0 mt-auto">
          {step < 3 ? (
            <NeuButton 
              variant="primary" 
              onClick={handleNext}
              disabled={(step === 1 && !formData.amount) || (step === 2 && !formData.category)}
              className="w-full py-5 text-lg rounded-2xl shadow-neu-flat font-bold tracking-wide"
            >
              Next Step <ArrowRight size={20} strokeWidth={2.5} />
            </NeuButton>
          ) : (
            <NeuButton 
              variant="primary" 
              onClick={handleSubmit} 
              className="w-full py-5 text-lg rounded-2xl shadow-neu-flat font-bold tracking-wide bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete'} <Check size={20} strokeWidth={2.5} />
            </NeuButton>
          )}
        </div>
      </NeuCard>
    </div>
  );
};