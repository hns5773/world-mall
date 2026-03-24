import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepositsPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const [filter, setFilter] = useState<string>('');
  const { data: deposits, isLoading } = trpc.admin.getDeposits.useQuery(filter ? { status: filter } : undefined);

  const reviewMutation = trpc.admin.reviewDeposit.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      utils.admin.getDeposits.invalidate();
      utils.admin.getDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.deposits')}</h1>
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('deposit.currency')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">TX Hash</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.status')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.date')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(deposits || []).map((d: any) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">#{d.id}</td>
                  <td className="py-3 px-4 font-medium">{d.username}</td>
                  <td className="py-3 px-4 font-bold">${d.amount}</td>
                  <td className="py-3 px-4">{d.currency}</td>
                  <td className="py-3 px-4 text-xs truncate max-w-[120px]">{d.txHash || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={d.status === 'approved' ? 'badge-approved' : d.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {d.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => reviewMutation.mutate({ depositId: d.id, status: 'approved' })}
                          className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600"
                          title={t('admin.approve')}
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => reviewMutation.mutate({ depositId: d.id, status: 'rejected' })}
                          className="p-1.5 hover:bg-red-50 rounded text-red-600"
                          title={t('admin.reject')}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!deposits || deposits.length === 0) && (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
