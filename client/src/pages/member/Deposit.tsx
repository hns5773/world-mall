import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MemberDeposit() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [txHash, setTxHash] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { data: addresses } = trpc.member.getDepositAddresses.useQuery();
  const { data: deposits } = trpc.member.getDeposits.useQuery();

  const submitMutation = trpc.member.submitDeposit.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setAmount('');
      setTxHash('');
      utils.member.getDeposits.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ amount, currency, txHash: txHash || undefined });
  };

  const copyAddress = (addr: string, idx: number) => {
    navigator.clipboard.writeText(addr);
    setCopiedIdx(idx);
    toast.success(t('deposit.copied'));
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('deposit.title')}</h1>
        <p className="text-gray-500 mt-1">{t('deposit.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit addresses */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('deposit.addresses')}</h2>
          <div className="space-y-3">
            {(addresses || []).map((addr: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">{addr.currency}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-600 flex-1 break-all bg-white px-3 py-2 rounded border">{addr.address}</code>
                  <button
                    onClick={() => copyAddress(addr.address, i)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            ))}
            {(!addresses || addresses.length === 0) && (
              <p className="text-gray-400 text-sm">{t('common.noData')}</p>
            )}
          </div>
        </div>

        {/* Submit deposit form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('deposit.submit')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deposit.amount')}</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deposit.currency')}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('deposit.txHash')}</label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={submitMutation.isLoading} className="btn-primary w-full">
              {submitMutation.isLoading ? t('common.loading') : t('deposit.submit')}
            </button>
          </form>
        </div>
      </div>

      {/* Deposit history */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('deposit.history')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">ID</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.amount')}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('deposit.currency')}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.status')}</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {(deposits || []).map((d: any) => (
                <tr key={d.id} className="border-b border-gray-50">
                  <td className="py-2 px-3">#{d.id}</td>
                  <td className="py-2 px-3 font-medium">${d.amount}</td>
                  <td className="py-2 px-3">{d.currency}</td>
                  <td className="py-2 px-3">
                    <span className={d.status === 'approved' ? 'badge-approved' : d.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
                      {t(`deposit.${d.status}`)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!deposits || deposits.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
