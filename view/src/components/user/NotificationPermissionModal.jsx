import React, { useState, useEffect } from 'react';
import { IoNotificationsOutline, IoClose, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { checkNotificationPermission, requestAppNotificationPermission } from '../../utils/notificationPermission';

export const NotificationPermissionModal = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkAndRequest = async () => {
      // Check if user already dismissed or granted in this session
      const dismissed = sessionStorage.getItem('notif_prompt_dismissed');
      if (dismissed === 'true') return;

      const perm = await checkNotificationPermission();
      if (perm === 'default' || perm === 'prompt') {
        // Attempt automatic permission request on app load
        try {
          const result = await requestAppNotificationPermission();
          if (result === 'granted' || result === 'denied') {
            return;
          }
        } catch (e) {}

        // If browser requires user interaction gesture, show banner/modal
        setShowPrompt(true);
      }
    };

    // Small delay on app open for smooth entrance
    const timer = setTimeout(checkAndRequest, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    const result = await requestAppNotificationPermission();
    setShowPrompt(false);
    sessionStorage.setItem('notif_prompt_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('notif_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 shadow-2xl border border-blue-400/30 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-yellow-300 shrink-0 shadow-inner">
            <IoNotificationsOutline size={22} className="animate-bounce" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black tracking-tight text-white uppercase">
              Allow App Notifications 🔔
            </h4>
            <p className="text-[11px] text-white/80 font-normal truncate mt-0.5">
              Get instant result alerts & winner notifications!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAllow}
            className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-gray-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wide"
          >
            ALLOW
          </button>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-all cursor-pointer"
            title="Close"
          >
            <IoClose size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionModal;
