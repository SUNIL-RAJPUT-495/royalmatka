import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserNavbar } from '../components/user/UserNavbar';
import { SideBar } from '../pages/user/SideBar';
import { UserBottomNav } from '../components/user/UserBottomNav';
import { WelcomePopup } from '../components/user/WelcomePopup';
import Axios from '../utils/axios';
import SummaryApi from '../common/SummerAPI';

export const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });

  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  const isBetPage = location.pathname.startsWith('/bet/');
  const isSupportPage = location.pathname === '/support' || location.pathname === '/contact-us';
  const showNavbar = isHomePage;

  // Automatically scroll to top whenever page route changes (iOS Safari compatible)
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    };

    scrollToTop();
    requestAnimationFrame(scrollToTop);
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleRedirectToLogin = () => {
    localStorage.removeItem('royal_matka_user');
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  // Fetch updated user balance/profile if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('royal_matka_user') || localStorage.getItem('user_token') || localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) return;

        const savedDataStr = localStorage.getItem('user_data');
        let savedData = null;
        try { if (savedDataStr) savedData = JSON.parse(savedDataStr); } catch (e) { }
        const mobile = savedData?.mobile || '';

        const res = await Axios({
          url: `${SummaryApi.getUserProfile.url}?mobile=${encodeURIComponent(mobile)}`,
          method: SummaryApi.getUserProfile.method
        });

        if (res.data?.user && res.data.user.role !== 'Admin') {
          setUserData(res.data.user);
          localStorage.setItem('user_data', JSON.stringify(res.data.user));
        }
      } catch (err) {
        if (err.response?.data?.isForceLoggedOut === true || err.response?.status === 401) {
          toast.error(err.response?.data?.message || 'Your account has been logged out by administrator.');
          localStorage.removeItem('royal_matka_user');
          localStorage.removeItem('user_token');
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setTimeout(() => {
            window.location.href = '/user-login';
          }, 800);
        } else if (err.response?.data?.isBlocked === true || err.response?.data?.isDeleted === true) {
          const msg = err.response?.data?.message || 'Your account has been blocked or deleted by administrator.';
          setBlockedMessage(msg);
          setIsBlockedModalOpen(true);
        } else {
          console.warn('Could not fetch profile update:', err.message);
        }
      }
    };
    loadProfile();
  }, []);

  const calculatedBalance = Number(userData ? (userData.balance !== undefined ? userData.balance : (userData.walletBalance !== undefined ? userData.walletBalance : 0)) : 0).toFixed(2);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative text-gray-900 font-sans">
      {/* 1. TOP NAVBAR ON HOME & BIDS PAGES */}
      {showNavbar && (
        <UserNavbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          walletBalance={calculatedBalance}
        />
      )}

      {/* 2. SLIDE-IN USER SIDEBAR DRAWER */}
      <SideBar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        user={userData}
      />

      {/* 3. MAIN PAGE CONTENT OUTLET */}
      <main className={`flex-1 w-full max-w-lg mx-auto ${(isBetPage || isSupportPage) ? 'pb-0' : 'pb-24'} ${isHomePage ? 'px-4 pt-3' : ''}`}>
        <Outlet context={{ user: userData, setUserData, onOpenSidebar: () => setIsSidebarOpen(true) }} />
      </main>

      {/* 4. FIXED 5-BUTTON BOTTOM NAVIGATION BAR (FOOTER) - Hidden on Bet & Support Pages */}
      {!isBetPage && !isSupportPage && <UserBottomNav />}

      {/* 5. WELCOME POPUP MODAL (ONCE PER SESSION) */}
      <WelcomePopup />

      {/* 6. ACCOUNT BLOCKED / DELETED POPUP MODAL */}
      {isBlockedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-red-100">
            {/* Red Alert Icon */}
            <div className="w-16 h-16 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto text-red-500 shadow-sm animate-bounce">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Account Restricted</h3>
              <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                {blockedMessage || "Your account has been blocked or deleted by the administrator. Access to SanwariyaBoss has been restricted."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRedirectToLogin}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
