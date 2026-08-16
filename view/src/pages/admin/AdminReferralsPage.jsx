import React, { useState, useEffect } from 'react';
import {
  Users, Flag, Download, Search, Filter, RefreshCw, Gift, ShieldAlert, CheckCircle2
} from 'lucide-react';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';

export const AdminReferralsPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState({ totalReferrals: 0, totalEarnings: 0, flaggedCount: 0 });
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
      if (response.data?.success) {
        setReferrals(response.data.referrals || []);
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      }
    } catch (error) {
      console.warn("Failed to load referral statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // Filtered Referrals
  const filteredReferrals = referrals.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || (
      (item.referrerName && item.referrerName.toLowerCase().includes(query)) ||
      (item.referrerMobile && item.referrerMobile.includes(query)) ||
      (item.referrerCode && item.referrerCode.toLowerCase().includes(query)) ||
      (item.referredName && item.referredName.toLowerCase().includes(query)) ||
      (item.referredMobile && item.referredMobile.includes(query))
    );
    const matchesFlag = !flaggedOnly || item.isFlagged;
    return matchesSearch && matchesFlag;
  });

  const handleExportCSV = () => {
    if (filteredReferrals.length === 0) {
      toast.error("No referral data to export");
      return;
    }

    const headers = ["Referrer Name", "Referrer Mobile", "Referral Code", "Referred User Name", "Referred User Mobile", "Date", "Bonus Earned (₹)", "Status", "Flagged"];
    const rows = filteredReferrals.map(r => [
      `"${r.referrerName || ''}"`,
      `"${r.referrerMobile || ''}"`,
      `"${r.referrerCode || ''}"`,
      `"${r.referredName || ''}"`,
      `"${r.referredMobile || ''}"`,
      `"${r.date || ''}"`,
      r.bonusEarned || 0,
      `"${r.status || 'Completed'}"`,
      r.isFlagged ? "Yes" : "No"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `referral_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Referrals CSV exported successfully!");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-6 font-sans text-gray-800 text-left select-none">

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 text-[#f97316] p-2.5 rounded-2xl border border-orange-100 shadow-3xs">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
              Referral & Invite History
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
              Monitor referral signups, bonuses awarded, and security flags
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReferrals}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-250 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setFlaggedOnly(!flaggedOnly);
              toast.success(!flaggedOnly ? "Showing flagged referrals only" : "Showing all referrals");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95 ${
              flaggedOnly
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flaggedOnly ? "Show All" : "Flagged Only"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Referrals */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Referrals</span>
            <span className="text-2xl font-black text-gray-900 mt-1 block">{summary.totalReferrals}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#f97316] flex items-center justify-center border border-orange-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Referral Bonus Awarded</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{summary.totalEarnings}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        {/* Flagged Accounts */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4.5 flex items-center justify-between shadow-3xs">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Security Flagged</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{summary.flaggedCount}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* 3. Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by referrer name, mobile, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-250 rounded-xl text-xs font-semibold outline-none focus:border-[#f97316] shadow-3xs"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* 4. Data Table Container */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-3xs flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredReferrals.length > 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-3xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Referrer User</th>
                    <th className="py-3.5 px-4">Referral Code</th>
                    <th className="py-3.5 px-4">Referred New User</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Bonus Credited</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                  {filteredReferrals.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-gray-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{item.referrerName}</div>
                        <div className="text-[11px] text-gray-400 font-normal">📞 {item.referrerMobile}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                        {item.referrerCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{item.referredName}</div>
                        <div className="text-[11px] text-gray-400 font-normal">📞 {item.referredMobile}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">{item.date}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                        +₹{item.bonusEarned}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.isFlagged ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <ShieldAlert size={11} /> Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <CheckCircle2 size={11} /> Successful
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State Box */
          <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-3xs flex flex-col items-center justify-center text-center min-h-[220px]">
            <div className="text-gray-300 mb-4">
              <Users className="w-12 h-12 stroke-[1.2]" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">
              No referral records found
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">
              No referral history is currently available.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminReferralsPage;
