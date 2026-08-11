import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserNavbar } from '../components/user/UserNavbar';
import { SideBar } from '../pages/user/SideBar';
import { UserBottomNav } from '../components/user/UserBottomNav';
import Axios from '../utils/axios';
import SummaryApi from '../common/SummerAPI';

export const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : { name: 'Shubham', mobile: '8079003424', walletBalance: 9.0 };
  });

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Fetch updated user balance/profile if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await Axios({
          url: SummaryApi.getUserProfile.url,
          method: SummaryApi.getUserProfile.method
        });
        if (res.data?.user) {
          setUserData(res.data.user);
          localStorage.setItem('user_data', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Could not fetch latest profile, using cached data');
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative text-gray-900 font-sans">
      {/* 1. TOP NAVBAR ON HOME PAGE ONLY */}
      {isHomePage && (
        <UserNavbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          walletBalance={userData?.walletBalance || 9}
        />
      )}

      {/* 2. SLIDE-IN USER SIDEBAR DRAWER */}
      <SideBar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        user={userData}
      />

      {/* 3. MAIN PAGE CONTENT OUTLET */}
      <main className={`flex-1 w-full max-w-lg mx-auto pb-24 ${isHomePage ? 'px-4 pt-3' : ''}`}>
        <Outlet context={{ user: userData, setUserData, onOpenSidebar: () => setIsSidebarOpen(true) }} />
      </main>

      {/* 4. FIXED 5-BUTTON BOTTOM NAVIGATION BAR (FOOTER) */}
      <UserBottomNav />
    </div>
  );
};

export default UserLayout;
