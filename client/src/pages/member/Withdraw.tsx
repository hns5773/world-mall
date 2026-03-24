import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Globe, ArrowUpFromLine } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MemberWithdraw() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [currency, setCurrency] = useState('USDT');

  const { data: dashboard } = trpc.member.getDashboard.useQuery();
  const { data: withdrawals } = trpc.member.getWithdrawals.useQuery();

  const submitMutation = trpc.member.submitWithdrawal.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setAmount('');
      setWalletAddress('');
      utils.member.getWithdrawals.invalidate();
      utils.member.getDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ amount, currency, walletAddress });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex flex-wrap items-center justify-center gap-8 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Globe key={i} className="w-12 h-12 text-white" />
          ))}
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-white text-xl font-bold">{t('withdraw.title')}</h1>
          <p className="text-white/70 text-sm mt-1">{t('withdraw.subtitle')}</p>
        </div>

        {/* Balance card */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 relative z-10">
          <p className="text-white/70 text-xs mb-1">{t('withdraw.available')}</p>
          <p className="text-white text-3xl font-bold">${dashboard?.balance || '0.00'}</p>
          <p className="text-white/50 text-xs mt-1">{t('dashboard.frozen')}: ${dashboard?.frozenBalance || '0.00'}</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Withdrawal form */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('withdraw.submit')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('withdraw.amount')}</label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={parseFloat(dashboard?.balance || '0')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('withdraw.currency')}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('withdraw.walletAddress')}</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <button type="submit" disabled={submitMutation.isLoading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-200">
              {submitMutation.isLoading ? t('common.loading') : t('withdraw.submit')}
            </button>
          </form>
        </div>

        {/* Withdrawal history */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">{t('withdraw.history')}</h2>
          </div>
          {(!withdrawals || withdrawals.length === 0) ? (
            <div className="py-12 text-center">
              <ArrowUpFromLine className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('common.noData')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center">
                      <ArrowUpFromLine className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{w.currency} #{w.id}</p>
                      <p className="text-[10px] text-gray-400">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">-${w.amount}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      w.status === 'approved' ? 'bg-green-50 text-green-700' :
                      w.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
