import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const { data: settings } = trpc.admin.getSettings.useQuery();

  const [addresses, setAddresses] = useState<{ currency: string; address: string }[]>([]);
  const [platformName, setPlatformName] = useState('World Mall');

  useEffect(() => {
    if (settings) {
      const addrSetting = settings.find((s: any) => s.key === 'deposit_addresses');
      if (addrSetting) {
        try { setAddresses(JSON.parse(addrSetting.value)); } catch {}
      }
      const nameSetting = settings.find((s: any) => s.key === 'platform_name');
      if (nameSetting) setPlatformName(nameSetting.value);
    }
  }, [settings]);

  const updateMutation = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      utils.admin.getSettings.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const saveAddresses = () => {
    updateMutation.mutate({ key: 'deposit_addresses', value: JSON.stringify(addresses) });
  };

  const savePlatformName = () => {
    updateMutation.mutate({ key: 'platform_name', value: platformName });
  };

  const addAddress = () => {
    setAddresses([...addresses, { currency: 'USDT (TRC20)', address: '' }]);
  };

  const removeAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  const updateAddress = (idx: number, field: string, value: string) => {
    const updated = [...addresses];
    updated[idx] = { ...updated[idx], [field]: value };
    setAddresses(updated);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('nav.globalSettings')}</h1>

      {/* Platform name */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.platformName')}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="input-field flex-1"
          />
          <button onClick={savePlatformName} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {t('admin.save')}
          </button>
        </div>
      </div>

      {/* Deposit addresses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('settings.depositAddresses')}</h2>
          <button onClick={addAddress} className="btn-secondary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {addresses.map((addr, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <div className="w-40">
                <input
                  type="text"
                  value={addr.currency}
                  onChange={(e) => updateAddress(idx, 'currency', e.target.value)}
                  className="input-field text-sm"
                  placeholder="Currency"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={addr.address}
                  onChange={(e) => updateAddress(idx, 'address', e.target.value)}
                  className="input-field text-sm"
                  placeholder="Wallet address"
                />
              </div>
              <button onClick={() => removeAddress(idx)} className="p-2.5 hover:bg-red-50 rounded text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={saveAddresses} className="btn-primary mt-4 flex items-center gap-2">
          <Save className="w-4 h-4" /> {t('admin.save')} {t('settings.depositAddresses')}
        </button>
      </div>
    </div>
  );
}
