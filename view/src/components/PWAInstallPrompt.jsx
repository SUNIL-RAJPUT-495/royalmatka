import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already running as an installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Do nothing if app is already installed
    }

    // Listen for browser's native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after 1 sec delay if not dismissed
    const timer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!isDismissed) {
        setShowPrompt(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.error('Install prompt failed:', err);
      }
    }

    // Fallback if beforeinstallprompt is pending or on mobile browser
    alert('Tap browser menu (3 dots) and select "Install App" or "Add to Home Screen".');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-2 left-2 right-2 md:left-auto md:right-6 md:top-4 z-[9999] transition-all duration-300">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-3.5 rounded-2xl shadow-2xl border border-orange-500/60 flex items-center justify-between gap-3 max-w-sm w-full backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-orange-500/50 shadow-md flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-orange-400 truncate">SanwariyaBoss App</h4>
            <p className="text-[11px] text-gray-300 truncate">Install app for fast gaming!</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1 shadow-lg transition active:scale-95 whitespace-nowrap"
          >
            <FiDownload size={13} />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
