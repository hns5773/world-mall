import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';

export default function AdminActivityLogPage() {
  const { t } = useTranslation();
  const { data: logs } = trpc.admin.getActivityLogs.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.activityLog')}</h1>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">User ID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Details</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((log: any) => (
                <tr key={log.id} className="border-b border-gray-50">
                  <td className="py-3 px-4">{log.id}</td>
                  <td className="py-3 px-4">{log.userId}</td>
                  <td className="py-3 px-4">
                    <span className="badge bg-gray-100 text-gray-800">{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 max-w-[300px] truncate">{log.details}</td>
                  <td className="py-3 px-4 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
