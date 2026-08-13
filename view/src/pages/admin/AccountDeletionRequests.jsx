import React, { useState } from 'react';
import { FaUserTimes, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const AccountDeletionRequests = () => {
  // Tabs: 'Pending' | 'Approved' | 'Rejected' | 'All'
  const [activeTab, setActiveTab] = useState('Pending');

  // Optional mock requests (commented out or empty to match screenshot's empty state)
  const [requests, setRequests] = useState([]);

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800 text-left">
      
      {/* 1. Page Title Header Area */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 border-b border-gray-200 pb-5">
        <div className="text-red-500 p-2.5 rounded-2xl shadow-3xs border border-red-100 bg-red-50">
          <FaUserTimes size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
            Account Deletion Requests
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Users ki delete requests. <span className="font-bold text-gray-800">Approve</span> karne par account + related data permanently delete ho jata hai.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 2. Custom Filter Pills */}
        <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
          {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => {
            const isActive = activeTab === tab;
            let activeClass = 'bg-[#15803d] text-white shadow-xs'; // Matching dark green look
            if (tab === 'Approved') activeClass = 'bg-blue-600 text-white shadow-xs';
            if (tab === 'Rejected') activeClass = 'bg-red-650 text-white shadow-xs';
            if (tab === 'All') activeClass = 'bg-gray-800 text-white shadow-xs';

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  toast.success(`Filter switched to ${tab}`);
                }}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer border ${
                  isActive 
                    ? activeClass + ' border-transparent' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 3. Content card (Empty state box matching the screenshot) */}
        <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center min-h-[180px]">
          <span className="text-xs font-semibold text-gray-400">
            Koi request nahi.
          </span>
        </div>

      </div>

    </div>
  );
};

export default AccountDeletionRequests;
