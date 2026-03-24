import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Copy, Check, Globe, ArrowDownToLine } from 'lucide-react';
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
          <h1 className="text-white text-xl font-bold">{t('deposit.title')}</h1>
          <p className="text-white/70 text-sm mt-1">{t('deposit.subtitle')}</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Deposit addresses */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('deposit.addresses')}</h2>
          <div className="space-y-3">
            {(addresses || []).map((addr: any, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium text-purple-600 mb-1">{addr.currency}</p>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] text-gray-600 flex-1 break-all bg-white px-3 py-2 rounded-lg border border-gray-100">{addr.address}</code>
                  <button
                    onClick={() => copyAddress(addr.address, i)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            ))}
            {(!addresses || addresses.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-4">{t('common.noData')}</p>
            )}
          </div>
        </div>

        {/* Submit deposit form */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">{t('deposit.submit')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('deposit.amount')}</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('deposit.currency')}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('deposit.txHash')}</label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <button type="submit" disabled={submitMutation.isLoading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-200">
              {submitMutation.isLoading ? t('common.loading') : t('deposit.submit')}
            </button>
          </form>
        </div>

        {/* Deposit history */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">{t('deposit.history')}</h2>
          </div>
          {(!deposits || deposits.length === 0) ? (
            <div className="py-12 text-center">
              <ArrowDownToLine className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('common.noData')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {deposits.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                      <ArrowDownToLine className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{d.currency} #{d.id}</p>
                      <p className="text-[10px] text-gray-400">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+${d.amount}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      d.status === 'approved' ? 'bg-green-50 text-green-700' :
                      d.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {d.status}
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
