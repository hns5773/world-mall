import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('withdraw.title')}</h1>
        <p className="text-gray-500 mt-1">{t('withdraw.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance info */}
        <div className="card bg-gradient-to-br from-primary-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('withdraw.available')}</h2>
          <p className="text-4xl font-bold text-primary-600">${dashboard?.balance || '0.00'}</p>
          <p className="text-sm text-gray-500 mt-2">{t('dashboard.frozen')}: ${dashboard?.frozenBalance || '0.00'}</p>
        </div>

        {/* Withdrawal form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('withdraw.submit')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.amount')}</label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={parseFloat(dashboard?.balance || '0')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.currency')}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('withdraw.walletAddress')}</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <button type="submit" disabled={submitMutation.isLoading} className="btn-primary w-full">
              {submitMutation.isLoading ? t('common.loading') : t('withdraw.submit')}
            </button>
          </form>
        </div>
      </div>

      {/* Withdrawal history */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('withdraw.history')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">ID</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.amount')}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('withdraw.walletAddress')}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.status')}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {(withdrawals || []).map((w: any) => (
                <tr key={w.id} className="border-b border-gray-50">
                  <td className="py-2 px-3">#{w.id}</td>
                  <td className="py-2 px-3 font-medium">${w.amount}</td>
                  <td className="py-2 px-3 text-xs truncate max-w-[150px]">{w.walletAddress}</td>
                  <td className="py-2 px-3">
                    <span className={w.status === 'approved' ? 'badge-approved' : w.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!withdrawals || withdrawals.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
