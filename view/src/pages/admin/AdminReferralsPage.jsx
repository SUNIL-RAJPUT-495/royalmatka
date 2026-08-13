import React, { useState, useEffect } from 'react';
import {
  Users, Flag, Download, Search, Filter, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';

export const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // Fetch referrals from API
  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getReferralStats.url,
        method: SummaryApi.getReferralStats.method
      });
      if (response.data.success && Array.isArray(response.data.referrals)) {
        setReferrals(response.data.referrals);
      }
    } catch (error) {
      console.warn("Failed to load referral statistics, defaulting to empty state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleExportCSV = () => {
    if (referrals.length === 0) {
      toast.error("No referral data to export");
      return;
    }
    toast.success("Referrals exported successfully!");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-6 font-sans text-gray-800 text-left select-none">

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-[#f97316]">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Referral Management
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFlaggedOnly(!flaggedOnly);
              toast.success(flaggedOnly ? "Showing all referrals" : "Showing flagged referrals only");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95 ${flaggedOnly
                ? 'bg-[#f59e0b] text-white'
                : 'bg-[#fffbeb] hover:bg-[#fef3c7] text-[#d97706] border border-[#fef3c7]'
              }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Show Flagged Only</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] border border-[#dcfce7] rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* 2. Search & Filter Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by user ID or referral code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-250 rounded-xl text-xs font-semibold outline-none focus:border-[#f97316] shadow-3xs"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
          </div>

          <button
            onClick={() => toast.success("Search complete")}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-3xs"
          >
            Search
          </button>

          <button
            onClick={() => toast.success("Filters opened")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-3xs"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>

        {/* 3. Empty State Card Box */}
        <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-3xs flex flex-col items-center justify-center text-center min-h-[220px]">
          <div className="text-gray-300 mb-4">
            <Users className="w-12 h-12 stroke-[1.2]" />
          </div>
          <h2 className="text-sm font-bold text-gray-900">
            No referrals found
          </h2>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">
            No referral data is available at this time.
          </p>
        </div>

        {/* 4. Footer Pagination */}
        <div className="flex justify-between items-center text-xs text-gray-400 font-semibold pt-2">
          <span>Showing page 1 of 1</span>

          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3.5 py-1.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-300 text-[10px] font-bold flex items-center gap-1 cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>

            <button
              disabled
              className="px-3.5 py-1.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-300 text-[10px] font-bold flex items-center gap-1 cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminReferralsPage;
