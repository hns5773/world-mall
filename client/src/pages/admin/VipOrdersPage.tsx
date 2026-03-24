import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Plus, Save, Trash2, Edit2, X, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminVipOrdersPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();

  // Fetch ALL orders (no vipLevel filter) to group them
  const { data: allOrders, isLoading } = trpc.admin.getVipOrders.useQuery({});

  // Edit modal state
  const [editModal, setEditModal] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  // Bulk create state
  const [bulkLevel, setBulkLevel] = useState<number | null>(null);
  const [editOrders, setEditOrders] = useState<any[]>([]);

  const upsertMutation = trpc.admin.upsertVipOrder.useMutation({
    onSuccess: () => {
      toast.success('Order updated');
      setEditModal(null);
      utils.admin.getVipOrders.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const bulkCreateMutation = trpc.admin.bulkCreateVipOrders.useMutation({
    onSuccess: () => {
      toast.success('Orders saved');
      setBulkLevel(null);
      utils.admin.getVipOrders.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteVipOrder.useMutation({
    onSuccess: () => {
      toast.success('Deleted');
      utils.admin.getVipOrders.invalidate();
    },
  });

  // Group orders by VIP level (0-5)
  const groupedOrders: Record<number, any[]> = {};
  (allOrders || []).forEach((o: any) => {
    const level = o.vipLevel;
    if (!groupedOrders[level]) groupedOrders[level] = [];
    groupedOrders[level].push(o);
  });

  // Ensure VIP 0-5 all appear
  const vipLevels = [0, 1, 2, 3, 4, 5];

  const openEditModal = (order: any) => {
    setEditModal(order);
    setEditData({
      id: order.id,
      vipLevel: order.vipLevel,
      orderIndex: order.orderIndex,
      productName: order.productName,
      productImage: order.productImage || '',
      price: order.price,
      commissionRate: order.commissionRate,
    });
  };

  const saveEdit = () => {
    upsertMutation.mutate(editData);
  };

  // Calculate commission from price and rate
  const getCommission = (price: string, rate: string) => {
    const p = parseFloat(price) || 0;
    const r = parseFloat(rate) || 0;
    return (p * r / 100).toFixed(2);
  };

  // Check if order requires deposit (rate > 5% means yes, or we check if there's a deposit amount)
  const requiresDeposit = (order: any) => {
    // VIP0 doesn't require deposit, others may
    return order.vipLevel > 0 && parseFloat(order.commissionRate) > 1;
  };

  const getDepositAmount = (order: any) => {
    if (order.vipLevel === 0) return '0.00';
    // Deposit amount = price * some factor (we'll use price * 0.5 as estimate)
    const p = parseFloat(order.price) || 0;
    return order.vipLevel > 0 ? (p * 0.5).toFixed(2) : '0.00';
  };

  // Bulk edit for a level
  const startBulkEdit = (level: number) => {
    const existing = groupedOrders[level] || [];
    if (existing.length > 0) {
      setEditOrders(existing.map((o: any) => ({
        orderIndex: o.orderIndex,
        productName: o.productName,
        productImage: o.productImage || '',
        price: o.price,
        commissionRate: o.commissionRate,
      })));
    } else {
      setEditOrders(Array.from({ length: 5 }, (_, i) => ({
        orderIndex: i,
        productName: `Product ${i + 1}`,
        productImage: '',
        price: '10.00',
        commissionRate: '10.00',
      })));
    }
    setBulkLevel(level);
  };

  const saveBulkEdit = () => {
    if (bulkLevel === null) return;
    bulkCreateMutation.mutate({
      vipLevel: bulkLevel,
      orders: editOrders,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Task Settings</h1>

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Order</h3>
              <button onClick={() => setEditModal(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" value={editData.productName} onChange={(e) => setEditData({ ...editData, productName: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="text" value={editData.price} onChange={(e) => setEditData({ ...editData, price: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input type="text" value={editData.commissionRate} onChange={(e) => setEditData({ ...editData, commissionRate: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={editData.productImage} onChange={(e) => setEditData({ ...editData, productImage: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveEdit} className="btn-primary flex-1">Save</button>
              <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk edit modal */}
      {bulkLevel !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bulk Edit VIP{bulkLevel} Orders</h3>
              <button onClick={() => setBulkLevel(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium w-12">#</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Product Name</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium w-24">Price</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium w-24">Rate %</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Image URL</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {editOrders.map((o, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-1 px-3 text-gray-400">{idx + 1}</td>
                      <td className="py-1 px-3"><input type="text" value={o.productName} onChange={(e) => { const u = [...editOrders]; u[idx] = { ...u[idx], productName: e.target.value }; setEditOrders(u); }} className="input-field py-1 px-2 text-sm" /></td>
                      <td className="py-1 px-3"><input type="text" value={o.price} onChange={(e) => { const u = [...editOrders]; u[idx] = { ...u[idx], price: e.target.value }; setEditOrders(u); }} className="input-field py-1 px-2 text-sm" /></td>
                      <td className="py-1 px-3"><input type="text" value={o.commissionRate} onChange={(e) => { const u = [...editOrders]; u[idx] = { ...u[idx], commissionRate: e.target.value }; setEditOrders(u); }} className="input-field py-1 px-2 text-sm" /></td>
                      <td className="py-1 px-3"><input type="text" value={o.productImage || ''} onChange={(e) => { const u = [...editOrders]; u[idx] = { ...u[idx], productImage: e.target.value }; setEditOrders(u); }} className="input-field py-1 px-2 text-xs" /></td>
                      <td className="py-1 px-3"><button onClick={() => { const u = editOrders.filter((_, i) => i !== idx).map((o, i) => ({ ...o, orderIndex: i })); setEditOrders(u); }} className="p-1 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3 h-3" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button onClick={() => setEditOrders([...editOrders, { orderIndex: editOrders.length, productName: `Product ${editOrders.length + 1}`, productImage: '', price: '10.00', commissionRate: '10.00' }])} className="btn-secondary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Row
              </button>
              <div className="flex gap-2">
                <button onClick={saveBulkEdit} disabled={bulkCreateMutation.isLoading} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save All
                </button>
                <button onClick={() => setBulkLevel(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP Level Groups */}
      {vipLevels.map((level) => {
        const levelOrders = groupedOrders[level] || [];
        return (
          <div key={level} className="space-y-2">
            {/* VIP Level Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-bold text-orange-600">VIP{level}</h2>
              </div>
              <button
                onClick={() => startBulkEdit(level)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Bulk Edit
              </button>
            </div>

            {/* Orders table for this level */}
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider w-12">#</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Product</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Order Amount</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Commission</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Requires Deposit</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Deposit Amount</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelOrders.length === 0 ? (
                      <tr><td colSpan={7} className="py-6 text-center text-gray-400 text-xs">No orders for this level</td></tr>
                    ) : (
                      levelOrders.map((o: any, idx: number) => (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{o.productName}</td>
                          <td className="py-3 px-4 text-gray-700">${o.price}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">${getCommission(o.price, o.commissionRate)}</td>
                          <td className="py-3 px-4">
                            {requiresDeposit(o) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">Yes</span>
                            ) : (
                              <span className="text-gray-400 text-xs">No</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">${requiresDeposit(o) ? getDepositAmount(o) : '0.00'}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openEditModal(o)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
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
      })}
    </div>
  );
}
