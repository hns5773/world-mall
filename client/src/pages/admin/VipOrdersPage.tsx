import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminVipOrdersPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const { data: orders, isLoading } = trpc.admin.getVipOrders.useQuery({ vipLevel: selectedLevel });

  const [editOrders, setEditOrders] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  const upsertMutation = trpc.admin.upsertVipOrder.useMutation({
    onSuccess: () => {
      utils.admin.getVipOrders.invalidate();
    },
  });

  const bulkCreateMutation = trpc.admin.bulkCreateVipOrders.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setEditing(false);
      utils.admin.getVipOrders.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteVipOrder.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      utils.admin.getVipOrders.invalidate();
    },
  });

  const startBulkEdit = () => {
    if (orders && orders.length > 0) {
      setEditOrders(orders.map((o: any) => ({
        orderIndex: o.orderIndex,
        productName: o.productName,
        productImage: o.productImage || '',
        price: o.price,
        commissionRate: o.commissionRate,
      })));
    } else {
      // Generate 40 empty orders
      setEditOrders(Array.from({ length: 40 }, (_, i) => ({
        orderIndex: i,
        productName: `Product ${i + 1}`,
        productImage: `https://picsum.photos/seed/${selectedLevel}${i}/200/200`,
        price: '100.00',
        commissionRate: '0.50',
      })));
    }
    setEditing(true);
  };

  const saveBulkEdit = () => {
    bulkCreateMutation.mutate({
      vipLevel: selectedLevel,
      orders: editOrders,
    });
  };

  const updateEditOrder = (idx: number, field: string, value: string) => {
    const updated = [...editOrders];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditOrders(updated);
  };

  const addOrder = () => {
    setEditOrders([...editOrders, {
      orderIndex: editOrders.length,
      productName: `Product ${editOrders.length + 1}`,
      productImage: '',
      price: '100.00',
      commissionRate: '0.50',
    }]);
  };

  const removeOrder = (idx: number) => {
    const updated = editOrders.filter((_, i) => i !== idx).map((o, i) => ({ ...o, orderIndex: i }));
    setEditOrders(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.vipOrders')}</h1>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={startBulkEdit} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> {t('admin.bulkCreate')}
            </button>
          ) : (
            <>
              <button onClick={saveBulkEdit} disabled={bulkCreateMutation.isLoading} className="btn-success flex items-center gap-2">
                <Save className="w-4 h-4" /> {t('admin.save')}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">{t('admin.cancel')}</button>
            </>
          )}
        </div>
      </div>

      {/* VIP Level tabs */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => { setSelectedLevel(level); setEditing(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLevel === level ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            VIP {level}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {editing ? (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 text-gray-500 font-medium w-16">#</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">{t('admin.productName')}</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium">{t('admin.productImage')}</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium w-28">{t('orders.price')}</th>
                  <th className="text-left py-3 px-3 text-gray-500 font-medium w-28">{t('orders.commissionRate')} %</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {editOrders.map((o, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input type="text" value={o.productName} onChange={(e) => updateEditOrder(idx, 'productName', e.target.value)} className="input-field py-1 px-2" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={o.productImage} onChange={(e) => updateEditOrder(idx, 'productImage', e.target.value)} className="input-field py-1 px-2 text-xs" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={o.price} onChange={(e) => updateEditOrder(idx, 'price', e.target.value)} className="input-field py-1 px-2" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" value={o.commissionRate} onChange={(e) => updateEditOrder(idx, 'commissionRate', e.target.value)} className="input-field py-1 px-2" />
                    </td>
                    <td className="py-2 px-3">
                      <button onClick={() => removeOrder(idx)} className="p-1 hover:bg-red-50 rounded text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-100">
            <button onClick={addOrder} className="btn-secondary text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Order
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">#</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Image</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.productName')}</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('orders.price')}</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('orders.commissionRate')}</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {(orders || []).map((o: any) => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="py-3 px-4">{o.orderIndex + 1}</td>
                    <td className="py-3 px-4">
                      {o.productImage && <img src={o.productImage} alt="" className="w-10 h-10 rounded object-cover" />}
                    </td>
                    <td className="py-3 px-4 font-medium">{o.productName}</td>
                    <td className="py-3 px-4">${o.price}</td>
                    <td className="py-3 px-4">{o.commissionRate}%</td>
                    <td className="py-3 px-4">
                      <button onClick={() => deleteMutation.mutate({ id: o.id })} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
