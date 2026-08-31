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

      // Auto-trigger native Chrome install prompt if allowed
      try {
        const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
        if (!isDismissed) {
          setShowPrompt(true);
          // Attempt automatic prompt open
          e.prompt().catch(() => {});
        }
      } catch (err) {
        console.log('Auto prompt error:', err);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If native event wasn't captured yet, ask browser to trigger install
      alert('Please use Chrome or Edge browser to install the app directly.');
      return;
    }

    try {
      // Trigger Chrome's native install dialog
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install prompt failed:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 md:left-auto md:right-6 md:bottom-6 z-[9999]">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-4 rounded-2xl shadow-2xl border border-orange-500/50 flex items-center justify-between gap-3 max-w-sm w-full backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-orange-500/50 shadow-md" />
          <div>
            <h4 className="font-bold text-sm text-orange-400">SanwariyaBoss App</h4>
            <p className="text-xs text-gray-300">Install app for fast gaming!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1 shadow-lg transition active:scale-95 whitespace-nowrap"
          >
            <FiDownload size={14} />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700 transition"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
