import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { IoNotificationsOutline, IoSettingsOutline, IoTimeOutline, IoCheckmarkDoneOutline, IoRefreshOutline, IoShieldCheckmarkOutline, IoNotificationsOffOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import { checkNotificationPermission, requestAppNotificationPermission } from '../../utils/notificationPermission';

export const UserNotificationSettings = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Tab State: 'notifications' (Default) | 'settings'
  const [activeTab, setActiveTab] = useState('notifications');

  // Permission State: 'granted' | 'denied' | 'default' / 'prompt'
  const [permissionState, setPermissionState] = useState('granted');

  // Notifications List State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('read_notification_ids') || '[]');
    } catch {
      return [];
    }
  });

  // Settings State
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Retrieve user data for userId
  const localUserStr = localStorage.getItem("user_data");
  let localUser = null;
  try {
    if (localUserStr) localUser = JSON.parse(localUserStr);
  } catch (e) {}
  const userId = localUser?._id || localUser?.id || localUser?.mobile || "user";

  // ALL NOTIFICATION SETTINGS ENABLED (ON) BY DEFAULT
  const defaultSettings = {
    allNotifications: true,
    generalAlerts: true,
    chatMessages: true,
    voiceCalls: true,
    adminBroadcasts: true,
    resultDeclared: true,
    mainGameResults: true,
    starLineResults: true,
    jackpotResults: true,
    jackpotGaliResults: true,
    betWinLoss: true,
    depositRequests: true,
    withdrawalRequests: true,
    fundAlerts: true
  };

  const [settings, setSettings] = useState(defaultSettings);

  // Check Notification Permission on Mount
  useEffect(() => {
    const initPermission = async () => {
      const status = await checkNotificationPermission();
      setPermissionState(status);
    };
    initPermission();
  }, []);

  const handleAllowPermission = async () => {
    const res = await requestAppNotificationPermission();
    setPermissionState(res);
  };

  // 1. Fetch Notifications List
  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await Axios({
        url: `${SummaryApi.getAllNotifications.url}?userId=${userId}&mobile=${localUser?.mobile || ''}`,
        method: SummaryApi.getAllNotifications.method
      });
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.warn("Could not fetch notifications from API:", error);
    } finally {
      setLoadingNotifs(false);
    }
  }, [userId, localUser?.mobile]);

  // 2. Fetch Notification Settings
  const fetchSettings = useCallback(async () => {
    const cached = localStorage.getItem('user_notification_settings');
    if (cached) {
      try {
        setSettings(prev => ({ ...defaultSettings, ...JSON.parse(cached) }));
      } catch (e) {}
    }

    try {
      const res = await Axios({
        url: `${SummaryApi.getNotificationSettings.url}?userId=${userId}`,
        method: SummaryApi.getNotificationSettings.method
      });
      if (res.data.success && res.data.settings) {
        setSettings(prev => {
          const merged = { ...defaultSettings, ...res.data.settings };
          localStorage.setItem('user_notification_settings', JSON.stringify(merged));
          return merged;
        });
      }
    } catch (error) {
      console.warn("Could not fetch notification settings, using cached/defaults:", error);
    } finally {
      setLoadingSettings(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [fetchNotifications, fetchSettings]);

  // Filter notifications according to user preference toggles
  const filteredNotifications = notifications.filter((notif) => {
    // If master switch is OFF, hide all notifications!
    if (settings.allNotifications === false) return false;

    const titleUpper = String(notif.title || '').toUpperCase();
    const contentUpper = String(notif.content || '').toUpperCase();

    // 1. Result Declared Notifications
    if (titleUpper.includes('RESULT') || contentUpper.includes('RESULT')) {
      if (settings.resultDeclared === false) return false;
      if ((titleUpper.includes('GALI') || titleUpper.includes('DESAWAR')) && settings.jackpotGaliResults === false) return false;
      if (titleUpper.includes('STARLINE') && settings.starLineResults === false) return false;
      if (titleUpper.includes('JACKPOT') && !titleUpper.includes('GALI') && settings.jackpotResults === false) return false;
    }

    // 2. Win / Loss Notifications
    if (titleUpper.includes('WINNER') || titleUpper.includes('WIN') || titleUpper.includes('LOSS') || titleUpper.includes('BID RESULT')) {
      if (settings.betWinLoss === false) return false;
    }

    // 3. Admin Broadcasts & General Alerts
    if (notif.isGlobal && !titleUpper.includes('RESULT')) {
      if (settings.adminBroadcasts === false && settings.generalAlerts === false) return false;
    }

    return true;
  });

  // Mark notification as read
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('read_notification_ids', JSON.stringify(updated));
    }
  };

  const markAllAsRead = () => {
    const allIds = filteredNotifications.map(n => n._id || n.id).filter(Boolean);
    setReadIds(allIds);
    localStorage.setItem('read_notification_ids', JSON.stringify(allIds));
    toast.success('All notifications marked as read! 🔔');
  };

  // Toggle settings switches
  const toggle = (key) => {
    if (permissionState !== 'granted') {
      handleAllowPermission();
    }
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (key === 'allNotifications') {
        const val = updated.allNotifications;
        Object.keys(updated).forEach(k => {
          updated[k] = val;
        });
      } else if (!updated[key]) {
        updated.allNotifications = false;
      } else {
        const allSubTrue = Object.keys(updated).filter(k => k !== 'allNotifications').every(k => updated[k] === true);
        if (allSubTrue) updated.allNotifications = true;
      }
      localStorage.setItem('user_notification_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    localStorage.setItem('user_notification_settings', JSON.stringify(settings));

    try {
      const res = await Axios({
        url: SummaryApi.updateNotificationSettings.url,
        method: SummaryApi.updateNotificationSettings.method,
        data: { settings, userId }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Notification settings saved successfully! 🔔');
      } else {
        toast.success('Notification settings saved!');
      }
    } catch (error) {
      toast.success('Notification settings saved!');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const settingsItems = [
    { key: 'allNotifications', title: 'All Notifications', desc: 'Master switch to turn ON or OFF all notifications.' },
    { key: 'generalAlerts', title: 'General Alerts', desc: 'General app updates and info.' },
    { key: 'chatMessages', title: 'Chat Messages', desc: 'User/admin chat message alerts.' },
    { key: 'voiceCalls', title: 'Voice Calls', desc: 'Incoming voice call notifications.' },
    { key: 'adminBroadcasts', title: 'Admin Broadcasts', desc: 'Notifications sent from admin panel.' },
    { key: 'resultDeclared', title: 'Result Declared', desc: 'Game result declaration notifications.' },
    { key: 'mainGameResults', title: 'Main Game Results', desc: 'Result notifications for Main Market games.' },
    { key: 'starLineResults', title: 'StarLine Results', desc: 'Result notifications for StarLine games.' },
    { key: 'jackpotResults', title: 'Jackpot Results', desc: 'Result notifications for Jackpot games.' },
    { key: 'jackpotGaliResults', title: 'Jackpot Gali Results', desc: 'Result notifications for Jackpot Gali & Disawar games.' },
    { key: 'betWinLoss', title: 'Bet Win/Loss', desc: 'Individual bet Win & Loss notifications.' },
    { key: 'depositRequests', title: 'Deposit Requests', desc: 'Deposit request alerts.' },
    { key: 'withdrawalRequests', title: 'Withdrawal Requests', desc: 'Withdrawal request alerts.' },
    { key: 'fundAlerts', title: 'Fund Alerts', desc: 'Fund related alerts.' }
  ];

  return (
    <div className="w-full select-none pb-16 font-sans">
      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-4 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center justify-between">
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
                Notifications
              </h2>
              <p className="text-xs text-white/80 font-normal mt-0.5">
                {activeTab === 'notifications' ? 'App announcements & broadcasts' : 'Customize alerts & push settings'}
              </p>
            </div>
          </div>

          {activeTab === 'notifications' && filteredNotifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-full border border-white/25 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <IoCheckmarkDoneOutline size={14} />
              <span>Read All</span>
            </button>
          )}
        </div>

        {/* TAB SWITCHER */}
        <div className="mt-3 bg-black/20 p-1 rounded-2xl flex items-center border border-white/15">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <IoNotificationsOutline size={15} />
            <span>Notifications</span>
            {filteredNotifications.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === 'notifications' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'
              }`}>
                {filteredNotifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <IoSettingsOutline size={15} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* PERMISSION PROMPT BANNER IF NOT GRANTED */}
        {permissionState !== 'granted' && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <IoShieldCheckmarkOutline size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Allow System Notifications</h4>
                <p className="text-[11px] text-gray-600 font-normal mt-0.5 leading-snug">
                  Tap allow to receive instant game result alerts & broadcasts on your device.
                </p>
              </div>
            </div>
            <button
              onClick={handleAllowPermission}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs shrink-0 cursor-pointer transition-all"
            >
              ALLOW
            </button>
          </div>
        )}

        {/* TAB 1: NOTIFICATIONS LIST */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Recent Alerts ({filteredNotifications.length})
              </span>
              <button
                onClick={fetchNotifications}
                className="text-xs text-blue-600 font-bold flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <IoRefreshOutline size={13} className={loadingNotifs ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingNotifs ? (
              <div className="bg-white rounded-3xl p-10 text-center text-gray-400 font-medium text-xs border border-gray-150 shadow-2xs">
                Loading notifications...
              </div>
            ) : settings.allNotifications === false ? (
              /* State when user turned OFF all notifications in settings */
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-150 shadow-2xs flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <IoNotificationsOffOutline size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Notifications Turned Off</h4>
                  <p className="text-[11px] text-gray-400 font-normal mt-1">
                    You have disabled notifications in Settings. Turn them ON to view alerts.
                  </p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold px-4 py-1.5 rounded-xl transition-all"
                  >
                    Go to Settings
                  </button>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-150 shadow-2xs flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <IoNotificationsOutline size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">No Notifications Yet</h4>
                  <p className="text-[11px] text-gray-400 font-normal mt-1">
                    You have no new broadcast or game updates right now.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredNotifications.map((notif) => {
                  const idVal = notif._id || notif.id;
                  const isRead = readIds.includes(idVal);

                  return (
                    <div
                      key={idVal}
                      onClick={() => markAsRead(idVal)}
                      className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-2xs ${
                        isRead ? 'border-gray-150 opacity-85' : 'border-blue-200 bg-blue-50/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                          isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600 font-bold'
                        }`}>
                          <IoNotificationsOutline size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {notif.title}
                            </h4>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="New Alert" />
                            )}
                          </div>

                          <p className="text-[11px] text-gray-600 font-normal mt-1 leading-snug break-words">
                            {notif.content}
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mt-2">
                            <IoTimeOutline size={12} />
                            <span>{formatDate(notif.createdAt || notif.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0 shadow-2xs">
                <IoSettingsOutline size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">
                  Preference Settings
                </h3>
                <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                  Control which notifications you want to receive.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-2xs divide-y divide-gray-100 space-y-1">
              {settingsItems.map((item) => {
                const isChecked = settings[item.key] !== false;
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

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-[#2563eb] hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer text-xs transition-all disabled:opacity-50"
              >
                <FaSave size={13} />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotificationSettings;
