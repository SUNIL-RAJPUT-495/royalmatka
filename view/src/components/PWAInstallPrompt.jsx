import React, { useState, useEffect } from 'react';
import { FiDownload, FiX, FiShare } from 'react-icons/fi';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // App is already installed and running as standalone PWA
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed prompt previously in this session
      const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt for iOS if not dismissed
    if (isIosDevice && !sessionStorage.getItem('pwa_prompt_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 md:left-auto md:right-6 md:bottom-6 z-[9999] animate-bounce-short">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-4 rounded-2xl shadow-2xl border border-orange-500/40 flex flex-col gap-3 max-w-sm w-full backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-orange-500/50 shadow-md" />
            <div>
              <h4 className="font-bold text-sm text-orange-400">SanwariyaBoss App</h4>
              <p className="text-xs text-gray-300">Install for faster gaming & live updates!</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        {showIOSInstructions ? (
          <div className="bg-gray-800/80 p-3 rounded-xl text-xs text-gray-200 border border-gray-700">
            <p className="font-semibold text-orange-400 mb-1 flex items-center gap-1">
              <FiShare className="inline text-blue-400" /> To install on iOS Safari:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Tap the <span className="text-blue-400 font-bold">Share</span> icon at bottom.</li>
              <li>Scroll & select <span className="text-orange-400 font-bold">'Add to Home Screen'</span>.</li>
            </ol>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <FiDownload size={15} />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-gray-400 hover:text-gray-200 font-medium"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
