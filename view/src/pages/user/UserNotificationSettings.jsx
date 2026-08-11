import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export const UserNotificationSettings = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    allNotifications: true,
    generalAlerts: true,
    chatMessages: true,
    voiceCalls: true,
    adminBroadcasts: true,
    resultDeclared: true,
    mainGameResults: false,
    starLineResults: false,
    jackpotResults: false,
    jackpotGaliResults: false,
    betWinLoss: true,
    depositRequests: true,
    withdrawalRequests: true,
    fundAlerts: true
  });

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('user_notification_settings', JSON.stringify(settings));
    toast.success('Notification settings saved successfully!');
  };

  const items = [
    { key: 'allNotifications', title: 'All Notifications', desc: 'Master switch for all notifications.' },
    { key: 'generalAlerts', title: 'General Alerts', desc: 'General app updates and info.' },
    { key: 'chatMessages', title: 'Chat Messages', desc: 'User/admin chat message alerts.' },
    { key: 'voiceCalls', title: 'Voice Calls', desc: 'Incoming voice call notifications.' },
    { key: 'adminBroadcasts', title: 'Admin Broadcasts', desc: 'Notifications sent from admin panel.' },
    { key: 'resultDeclared', title: 'Result Declared', desc: 'Game result declaration notifications.' },
    { key: 'mainGameResults', title: 'Main Game Results', desc: 'Result notifications for Main Bazar / OptionPage games.' },
    { key: 'starLineResults', title: 'StarLine Results', desc: 'Result notifications for StarLine games.' },
    { key: 'jackpotResults', title: 'Jackpot Results', desc: 'Result notifications for Jackpot games.' },
    { key: 'jackpotGaliResults', title: 'Jackpot Gali Results', desc: 'Result notifications for Jackpot Gali games.' },
    { key: 'betWinLoss', title: 'Bet Win/Loss', desc: 'Bet result related notifications.' },
    { key: 'depositRequests', title: 'Deposit Requests', desc: 'Deposit request alerts (mainly admin).' },
    { key: 'withdrawalRequests', title: 'Withdrawal Requests', desc: 'Withdrawal request alerts (mainly admin).' },
    { key: 'fundAlerts', title: 'Fund Alerts', desc: 'Fund related admin alerts.' }
  ];

  return (
    <div className="w-full select-none pb-16 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              Notification Settings
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">
              Customize alerts & push notifications
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* 2. NOTIFICATION SETTINGS INTRO CARD */}
        <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0 shadow-2xs">
            <IoNotificationsOutline size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">
              Notification Settings
            </h3>
            <p className="text-[11px] text-gray-500 font-normal mt-0.5">
              Control which notifications you want to receive.
            </p>
          </div>
        </div>

        {/* 3. TOGGLE LIST OF NOTIFICATIONS (Exact Match with Screenshots 2 & 3) */}
        <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs divide-y divide-gray-100 space-y-1">
          {items.map((item) => {
            const isChecked = settings[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggle(item.key)}
                className="py-3.5 first:pt-1.5 last:pb-1.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="space-y-0.5 pr-2">
                  <h4 className="text-xs font-bold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-normal leading-tight">
                    {item.desc}
                  </p>
                </div>

                {/* IOS Style Toggle Switch */}
                <div
                  className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out relative p-0.5 shrink-0 ${
                    isChecked ? 'bg-[#22c55e]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      isChecked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. SAVE CHANGES BUTTON */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#2563eb] hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer text-xs transition-all"
          >
            <FaSave size={13} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserNotificationSettings;
