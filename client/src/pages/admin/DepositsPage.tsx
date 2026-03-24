import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { CheckCircle, XCircle, Eye, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepositsPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const [filter, setFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [uidSearch, setUidSearch] = useState('');
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);

  const { data: deposits, isLoading } = trpc.admin.getDeposits.useQuery(filter ? { status: filter } : undefined);

  const reviewMutation = trpc.admin.reviewDeposit.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      utils.admin.getDeposits.invalidate();
      utils.admin.getDashboard.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Generate a 6-digit UID from the user ID
  const getUID = (id: number) => {
    const hash = ((id * 2654435761) >>> 0) % 900000 + 100000;
    return hash;
  };

  // Filter deposits by date range and UID search
  const filtered = (deposits || []).filter((d: any) => {
    // Date from filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (new Date(d.createdAt) < fromDate) return false;
    }
    // Date to filter
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(d.createdAt) > toDate) return false;
    }
    // UID search
    if (uidSearch) {
      const uid = String(getUID(d.userId));
      const username = (d.username || '').toLowerCase();
      const q = uidSearch.toLowerCase();
      if (!uid.includes(q) && !username.includes(q)) return false;
    }
    return true;
  });

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length <= 20) return addr || '—';
    return addr.substring(0, 10) + '...' + addr.substring(addr.length - 6);
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const statusTabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: '', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with status tabs */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
        <div className="flex gap-2">
          {statusTabs.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date filters and UID search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Date From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input-field py-1.5 px-3 text-sm w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Date To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input-field py-1.5 px-3 text-sm w-40"
          />
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={uidSearch}
            onChange={(e) => setUidSearch(e.target.value)}
            placeholder="Search by UID..."
            className="input-field pl-9 py-1.5 text-sm w-48"
          />
        </div>
      </div>

      {/* Screenshot modal */}
      {screenshotModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setScreenshotModal(null)}>
          <div className="bg-white rounded-xl p-4 max-w-2xl max-h-[90vh] overflow-auto relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Deposit Screenshot</h3>
              <button onClick={() => setScreenshotModal(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={screenshotModal}
              alt="Deposit Screenshot"
              className="max-w-full rounded-lg border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).alt = 'Failed to load screenshot';
              }}
            />
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Username</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Network</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Deposit Address</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Screenshot</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Created At</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No data available</td></tr>
              ) : (
                filtered.map((d: any) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-gray-900">{d.username}</span>
                        <div className="text-xs text-gray-400">UID: {getUID(d.userId)}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">${d.amount}</td>
                    <td className="py-3 px-4 text-gray-700">{d.currency || 'TRC20'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs font-mono">{truncateAddress(d.txHash)}</td>
                    <td className="py-3 px-4">
                      {d.screenshotUrl ? (
                        <button
                          onClick={() => setScreenshotModal(d.screenshotUrl)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Screenshot
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        d.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        d.status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDateTime(d.createdAt)}</td>
                    <td className="py-3 px-4">
                      {d.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => reviewMutation.mutate({ depositId: d.id, status: 'approved' })}
                            className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => reviewMutation.mutate({ depositId: d.id, status: 'rejected' })}
                            className="p-1.5 hover:bg-red-50 rounded text-red-600"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
