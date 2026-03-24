import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Clock, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

type TabType = 'all' | 'deposit' | 'withdraw';

export default function MemberHistory() {
  const { t } = useTranslation();
  const { data: deposits } = trpc.member.getDeposits.useQuery();
  const { data: withdrawals } = trpc.member.getWithdrawals.useQuery();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  // Combine all transactions
  const allTransactions: any[] = [];
  if (deposits) {
    deposits.forEach((d: any) => {
      allTransactions.push({ type: 'deposit', amount: d.amount, status: d.status, date: d.createdAt, network: d.network });
    });
  }
  if (withdrawals) {
    withdrawals.forEach((w: any) => {
      allTransactions.push({ type: 'withdraw', amount: w.amount, status: w.status, date: w.createdAt });
    });
  }
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = activeTab === 'all' 
    ? allTransactions 
    : allTransactions.filter(tx => tx.type === activeTab);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'deposit', label: 'Deposit' },
    { key: 'withdraw', label: 'Withdraw' },
  ];

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Header */}
      <div className="bg-white px-5 pt-10 pb-4 text-center border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Transaction History</h1>
      </div>

      {/* Pill Tabs */}
      <div className="px-5 pt-4 bg-white">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 mt-4 pb-6">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-12 text-center mt-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {tx.type === 'deposit' 
                      ? <ArrowDownToLine className="w-5 h-5 text-green-600" />
                      : <ArrowUpFromLine className="w-5 h-5 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">{tx.type}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                  </p>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                    {getStatusLabel(tx.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
