import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const AdminNotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings switches states
  const [settings, setSettings] = useState({
    all: true,
    general: true,
    chat: true,
    calls: true,
    broadcasts: true,
    resultDeclared: true,
    mainGame: false,
    starline: false,
    jackpot: false,
    jackpotGali: false,
    winLoss: true,
    deposit: true,
    withdrawal: true,
    funds: true
  });

  const fetchSettings = useCallback(async () => {
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getNotificationSettings.url,
        method: SummaryApi.getNotificationSettings.method
      });
      if (res.data.success && res.data.settings) {
        setSettings(prev => ({
          ...prev,
          ...res.data.settings
        }));
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      toast.error("Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // If toggled master switch "all", toggle all child switches
      if (key === 'all') {
        const targetVal = updated.all;
        Object.keys(updated).forEach(k => {
          if (k !== 'userId' && k !== '_id' && k !== 'createdAt' && k !== 'updatedAt' && k !== '__v') {
            updated[k] = targetVal;
          }
        });
      } else {
        // If any child switch is turned off, check all
        if (!updated[key]) {
          updated.all = false;
        }
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.updateNotificationSettings.url,
        method: SummaryApi.updateNotificationSettings.method,
        data: { settings, userId: "admin" }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Notification settings saved successfully! 🔔');
      } else {
        toast.error(res.data.message || 'Failed to save notification settings');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const settingsList = [
    { key: 'all', title: 'All Notifications', desc: 'Master switch for all notifications.' },
    { key: 'general', title: 'General Alerts', desc: 'General app updates and info.' },
    { key: 'chat', title: 'Chat Messages', desc: 'User/admin chat message alerts.' },
    { key: 'calls', title: 'Voice Calls', desc: 'Incoming voice call notifications.' },
    { key: 'broadcasts', title: 'Admin Broadcasts', desc: 'Notifications sent from admin panel.' },
    { key: 'resultDeclared', title: 'Result Declared', desc: 'Game result declaration notifications.' },
    { key: 'mainGame', title: 'Main Game Results', desc: 'Result notifications for Main Bazar / OptionPage games.' },
    { key: 'starline', title: 'StarLine Results', desc: 'Result notifications for StarLine games.' },
    { key: 'jackpot', title: 'Jackpot Results', desc: 'Result notifications for Jackpot games.' },
    { key: 'jackpotGali', title: 'Jackpot Gali Results', desc: 'Result notifications for Jackpot Gali games.' },
    { key: 'winLoss', title: 'Bet Win/Loss', desc: 'Bet result related notifications.' },
    { key: 'deposit', title: 'Deposit Requests', desc: 'Deposit request alerts (mainly admin).' },
    { key: 'withdrawal', title: 'Withdrawal Requests', desc: 'Withdrawal request alerts (mainly admin).' },
    { key: 'funds', title: 'Fund Alerts', desc: 'Fund related admin alerts.' }
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-3xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-start gap-4">
          <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-3xs border border-blue-50">
            <Bell className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Notification Settings</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Control which notifications you want to receive.
            </p>
          </div>
        </div>

        {/* Loading State or Switches List */}
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            <span className="text-xs text-gray-400 font-bold">Loading notification settings...</span>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {settingsList.map((item) => (
              <div 
                key={item.key}
                className="flex items-center justify-between p-4 border border-gray-150 rounded-lg bg-[#fcfdfe] hover:bg-gray-50/50 transition-colors"
              >
                <div className="space-y-0.5 text-left min-w-0 pr-4">
                  <span className="font-bold text-gray-850 text-xs tracking-wide block">{item.title}</span>
                  <span className="text-[10px] text-gray-450 font-semibold leading-relaxed block">{item.desc}</span>
                </div>

                {/* iOS Style Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    settings[item.key] ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-3xs ring-0 transition duration-200 ease-in-out ${
                      settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}

            {/* Action button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminNotificationSettings;
