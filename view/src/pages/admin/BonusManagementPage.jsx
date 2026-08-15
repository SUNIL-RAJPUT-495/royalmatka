import React, { useState, useEffect } from 'react';
import { 
  Settings, Gift, UserPlus, Users, RefreshCw, Save, Wallet, Loader2 
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';

export const BonusManagementPage = () => {
  // Bonus Settings States
  const [signupBonus, setSignupBonus] = useState(0);
  const [referrerBonus, setReferrerBonus] = useState(0);
  const [referredBonus, setReferredBonus] = useState(0);
  const [maxReferrals, setMaxReferrals] = useState(0);
  const [isPercentage, setIsPercentage] = useState(false);
  const [minDeposit, setMinDeposit] = useState(0);
  const [minWithdrawal, setMinWithdrawal] = useState(0);

  // Bonus Statistics States
  const [stats, setStats] = useState({
    totalBonusAwarded: 0,
    totalSignupBonus: 0,
    totalReferralBonus: 0,
    activeUsersCount: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // --- Fetch Settings Logic ---
  const fetchSettings = async () => {
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getTransactionSettings?.url || '/api/settings/get-settings',
        method: SummaryApi.getTransactionSettings?.method || 'get'
      });
      
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSignupBonus(data.signupBonus || 0);
        setReferrerBonus(data.referralBonus || 0); 
        setReferredBonus(data.referredBonus || 0);
        setMaxReferrals(data.maxReferrals || 0);
        setIsPercentage(data.isPercentage || false);
        setMinDeposit(data.minDeposit || 0);
        setMinWithdrawal(data.minWithdrawal || 0);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // --- Fetch Stats Logic ---
  const fetchBonusStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getBonusStats?.url || '/api/settings/bonus-stats',
        method: SummaryApi.getBonusStats?.method || 'get'
      });
      if (response?.data?.success && response?.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching bonus stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBonusStats();
  }, []);

  // --- Update Settings Logic ---
  const handleUpdateSettings = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.updateTransactionSettings?.url || '/api/settings/update-settings',
        method: SummaryApi.updateTransactionSettings?.method || 'post',
        data: {
          signupBonus: Number(signupBonus) || 0,
          referralBonus: Number(referrerBonus) || 0, 
          referredBonus: Number(referredBonus) || 0,
          maxReferrals: Number(maxReferrals) || 0,
          isPercentage: Boolean(isPercentage),
          minDeposit: Number(minDeposit) || 0,      
          minWithdrawal: Number(minWithdrawal) || 0    
        }
      });
      if (response?.data?.success) {
        toast.success(response.data.message || "Settings Updated Successfully!");
        fetchSettings();
        fetchBonusStats();
      } else {
        toast.error(response?.data?.message || "Failed to update settings.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans text-gray-800 text-left select-none">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100 text-[#8b5cf6] shadow-3xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
              Bonus & Limits Management
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1.5 uppercase tracking-wider">
              View performance and manage platform rules
            </p>
          </div>
        </div>

        <button 
          onClick={() => { fetchSettings(); fetchBonusStats(); }}
          className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isStatsLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. Top Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Bonus Awarded */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 flex items-center gap-3.5 shadow-3xs hover:shadow-2xs transition-shadow">
          <div className="bg-orange-50 text-orange-600 p-2.5 rounded-xl border border-orange-100">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Total Bonus Awarded</span>
            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-300 mt-1"/> : (
              <span className="text-lg font-bold text-gray-900 mt-0.5 block">₹{stats.totalBonusAwarded}</span>
            )}
          </div>
        </div>

        {/* Signup Bonuses */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 flex items-center gap-3.5 shadow-3xs hover:shadow-2xs transition-shadow">
          <div className="bg-green-50 text-green-600 p-2.5 rounded-xl border border-green-100">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Signup Bonuses</span>
            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-300 mt-1"/> : (
              <span className="text-lg font-bold text-gray-900 mt-0.5 block">₹{stats.totalSignupBonus}</span>
            )}
          </div>
        </div>

        {/* Referral Bonuses */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 flex items-center gap-3.5 shadow-3xs hover:shadow-2xs transition-shadow">
          <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl border border-purple-100">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Referral Bonuses</span>
            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-300 mt-1"/> : (
              <span className="text-lg font-bold text-gray-900 mt-0.5 block">₹{stats.totalReferralBonus}</span>
            )}
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 flex items-center gap-3.5 shadow-3xs hover:shadow-2xs transition-shadow">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Active Users</span>
            {isStatsLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-300 mt-1"/> : (
              <span className="text-lg font-bold text-gray-900 mt-0.5 block">{stats.activeUsersCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Settings (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 2. Left Column: Bonus Settings Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Header Accent block */}
          <div className="border-b border-gray-150 p-5 bg-gray-50/50 flex items-center gap-3">
            <Settings className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-950 uppercase tracking-wider">App Rules & Configuration</h2>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Modify platform incentives and transaction thresholds</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* --- SECTION 1: TRANSACTION LIMITS --- */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5 text-purple-600"/> Transaction Limits
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minimum Deposit */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum Deposit Amount</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors shadow-3xs">
                    <span className="pl-3.5 pr-2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number" 
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      className="w-full py-2.5 outline-none bg-transparent font-semibold text-xs text-gray-850"
                    />
                  </div>
                </div>

                {/* Minimum Withdrawal */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum Withdrawal Amount</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors shadow-3xs">
                    <span className="pl-3.5 pr-2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number" 
                      value={minWithdrawal}
                      onChange={(e) => setMinWithdrawal(e.target.value)}
                      className="w-full py-2.5 outline-none bg-transparent font-semibold text-xs text-gray-855"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: BONUS SETTINGS --- */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-purple-600"/> Incentive Configuration
              </h3>

              <div className="space-y-4">
                {/* Signup Bonus */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">New User Signup Reward</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors shadow-3xs">
                    <span className="pl-3.5 pr-2 text-gray-400 font-bold text-xs">₹</span>
                    <input 
                      type="number" 
                      value={signupBonus}
                      onChange={(e) => setSignupBonus(e.target.value)}
                      className="w-full py-2.5 outline-none bg-transparent font-semibold text-xs text-gray-850"
                    />
                    <span className="px-3.5 text-gray-400 text-[10px] font-bold uppercase border-l border-gray-150">Points</span>
                  </div>
                </div>

                {/* Toggle: Referral Bonus Type */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4.5 flex items-center justify-between shadow-3xs">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Referral Reward Model</span>
                    <span className="text-[10px] text-gray-450 font-semibold block mt-0.5">Define if rewards are flat amounts or percentage based</span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-200 shadow-3xs">
                    <button 
                      onClick={() => setIsPercentage(false)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        !isPercentage ? 'bg-purple-600 text-white shadow-3xs' : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      FIXED
                    </button>
                    <button 
                      onClick={() => setIsPercentage(true)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        isPercentage ? 'bg-purple-600 text-white shadow-3xs' : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      PERCENT
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Referrer Bonus */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Referrer Incentive</label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors shadow-3xs">
                      <span className="pl-3.5 pr-2 text-gray-400 font-bold text-xs">{isPercentage ? '%' : '₹'}</span>
                      <input 
                        type="number" 
                        value={referrerBonus}
                        onChange={(e) => setReferrerBonus(e.target.value)}
                        className="w-full py-2.5 outline-none bg-transparent font-semibold text-xs text-gray-850"
                      />
                    </div>
                  </div>

                  {/* Referred User Bonus */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Invite Reward</label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors shadow-3xs">
                      <span className="pl-3.5 pr-2 text-gray-400 font-bold text-xs">{isPercentage ? '%' : '₹'}</span>
                      <input 
                        type="number" 
                        value={referredBonus}
                        onChange={(e) => setReferredBonus(e.target.value)}
                        className="w-full py-2.5 outline-none bg-transparent font-semibold text-xs text-gray-855"
                      />
                    </div>
                  </div>
                </div>

                {/* Maximum Referral Limit */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Max Referrals Per User</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors shadow-3xs">
                    <input 
                      type="number" 
                      value={maxReferrals}
                      onChange={(e) => setMaxReferrals(e.target.value)}
                      className="w-full py-2.5 px-3.5 outline-none bg-transparent font-semibold text-xs text-gray-850"
                    />
                    <span className="px-3.5 text-gray-400 text-[10px] font-bold uppercase border-l border-gray-150">Limit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
              <button 
                onClick={fetchSettings} 
                className="flex items-center gap-1.5 px-4.5 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-xs font-bold active:scale-95 cursor-pointer shadow-3xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Form
              </button>
              
              <button 
                onClick={handleUpdateSettings} 
                disabled={isLoading}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all text-xs font-bold shadow-sm active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isLoading ? 'Saving...' : 'Update Platform Rules'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. Right Column: Settings Preview */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
          <div className="bg-[#f97316] p-5 text-white text-center flex flex-col items-center justify-center">
            <Gift className="w-8 h-8 mb-2 opacity-90" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Live Logic Preview</h2>
            <p className="text-orange-100 text-[9px] font-semibold uppercase tracking-widest mt-0.5">How users see the platform</p>
          </div>

          <div className="p-5 space-y-4">
            
            {/* Box 1: Transaction Limits Preview */}
            <div className="border border-indigo-100 bg-[#f8fafc] rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Thresholds
              </h3>
              <ul className="text-xs text-indigo-700 space-y-1.5 font-semibold">
                <li className="flex justify-between"><span>Min Deposit:</span> <span className="font-bold text-indigo-950">₹{minDeposit || 0}</span></li>
                <li className="flex justify-between"><span>Min Withdraw:</span> <span className="font-bold text-indigo-950">₹{minWithdrawal || 0}</span></li>
              </ul>
            </div>

            {/* Box 2: New User Signup */}
            <div className="border border-orange-100 bg-[#fdfaf7] rounded-2xl p-4 space-y-1.5">
              <h3 className="font-bold text-orange-900 text-xs">Join Incentive</h3>
              <p className="text-xs text-orange-700 leading-relaxed font-semibold">
                A new user will receive <span className="font-bold text-orange-950">{signupBonus || 0} points</span> as a welcome reward.
              </p>
            </div>

            {/* Box 3: Referral Scenario */}
            <div className="border border-purple-100 bg-[#faf8fd] rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Invite Logic
              </h3>
              <div className="space-y-2">
                <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-3xs font-semibold">
                  <span className="text-[9px] uppercase font-bold text-purple-400 block mb-0.5">Referrer Reward</span>
                  <span className="text-xs font-bold text-purple-900">{referrerBonus || 0}{isPercentage ? '%' : ' Points'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-purple-100 shadow-3xs font-semibold">
                  <span className="text-[9px] uppercase font-bold text-purple-400 block mb-0.5">Referred Reward</span>
                  <span className="text-xs font-bold text-purple-900">{referredBonus || 0}{isPercentage ? '%' : ' Points'}</span>
                </div>
              </div>
            </div>

            {/* Box 4: Referral Limits */}
            <div className="border border-blue-100 bg-[#f7fafc] rounded-2xl p-4 space-y-1.5">
              <h3 className="font-bold text-blue-900 text-xs">Guardrails</h3>
              <p className="text-[11px] text-blue-700 leading-relaxed font-semibold">
                Individual users are limited to <span className="font-bold text-blue-950">{maxReferrals || 0} successful invites</span>. Once reached, their referral code will be deactivated.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BonusManagementPage;