import React, { useMemo } from 'react';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import { NeuCard, NeuButton } from './Neumorphic';
import { Transaction } from '../types';
import { format } from 'date-fns';

interface ReportsViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions, onBack }) => {
  
  // Dynamically generate monthly reports based on transactions
  const reports = useMemo(() => {
      const groups: Record<string, { count: number, size: number, transactions: Transaction[] }> = {};
      
      transactions.forEach(t => {
          const date = new Date(t.date);
          const key = format(date, 'MMMM yyyy'); // e.g. "October 2023"
          if (!groups[key]) {
              groups[key] = { count: 0, size: 0, transactions: [] };
          }
          groups[key].count += 1;
          // Simulate file size based on transaction count
          groups[key].size += 0.05; 
          groups[key].transactions.push(t);
      });

      return Object.entries(groups).map(([month, data], index) => ({
          id: index,
          month,
          status: 'Ready',
          size: `${data.size.toFixed(2)} MB`,
          count: data.count,
          data: data.transactions
      })).sort((a, b) => b.id - a.id); // Sort by index (effectively date if inserted sequentially) or we can improve sort later
  }, [transactions]);

  const handleDownload = (month: string, data: Transaction[]) => {
      // 1. Define Headers
      const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Description'];
      
      // 2. Format Rows
      const rows = data.map(t => [
          t.id,
          format(new Date(t.date), 'yyyy-MM-dd'),
          t.type,
          t.category,
          t.amount.toString(),
          `"${t.description.replace(/"/g, '""')}"` // Escape quotes in description
      ]);

      // 3. Construct CSV String
      const csvContent = [
          headers.join(','),
          ...rows.map(r => r.join(','))
      ].join('\n');

      // 4. Trigger Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clarity_report_${month.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8 w-full fade-in">
      <div className="flex items-center gap-4">
        <NeuButton variant="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </NeuButton>
        <h2 className="text-2xl font-bold text-neu-dark">Monthly Reports</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reports.length > 0 ? (
            reports.map((report) => (
            <NeuCard key={report.id} className="p-6 flex items-center justify-between group hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neu-base shadow-neu-flat flex items-center justify-center text-neu-primary">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-neu-dark">{report.month}</h3>
                    <span className="text-xs text-neu-text font-medium">
                        {report.size} • {report.count} Transactions • {report.status}
                    </span>
                </div>
                </div>
                <NeuButton 
                    variant="icon" 
                    className="text-neu-text hover:text-neu-primary active:text-emerald-600"
                    onClick={() => handleDownload(report.month, report.data)}
                    title="Download CSV"
                >
                    <Download size={20} />
                </NeuButton>
            </NeuCard>
            ))
        ) : (
            <div className="text-center text-neu-text/50 py-10">
                No transaction data available to generate reports.
            </div>
        )}
      </div>
      
      <NeuCard className="p-8 text-center mt-4">
          <p className="text-neu-text text-sm mb-4">Need an older report?</p>
          {/* Archive feature removed */}
      </NeuCard>
    </div>
  );
};