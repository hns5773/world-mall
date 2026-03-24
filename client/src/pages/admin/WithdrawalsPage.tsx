import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminWithdrawalsPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const [filter, setFilter] = useState<string>('');
  const { data: withdrawals } = trpc.admin.getWithdrawals.useQuery(filter ? { status: filter } : undefined);

  const reviewMutation = trpc.admin.reviewWithdrawal.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      utils.admin.getWithdrawals.invalidate();
      utils.admin.getDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.withdrawals')}</h1>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.user')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.amount')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('withdraw.walletAddress')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.status')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.date')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(withdrawals || []).map((w: any) => (
                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">#{w.id}</td>
                  <td className="py-3 px-4 font-medium">{w.username}</td>
                  <td className="py-3 px-4 font-bold">${w.amount}</td>
                  <td className="py-3 px-4 text-xs truncate max-w-[150px]">{w.walletAddress}</td>
                  <td className="py-3 px-4">
                    <span className={w.status === 'approved' ? 'badge-approved' : w.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => reviewMutation.mutate({ withdrawalId: w.id, status: 'approved' })}
                          className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => reviewMutation.mutate({ withdrawalId: w.id, status: 'rejected' })}
                          className="p-1.5 hover:bg-red-50 rounded text-red-600"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!withdrawals || withdrawals.length === 0) && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
