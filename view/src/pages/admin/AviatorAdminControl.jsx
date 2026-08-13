import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import { useAviatorStore } from '../../services/aviator/store/aviatorStore';
import { 
  FaPlane, 
  FaRocket, 
  FaBomb, 
  FaMoneyBillWave, 
  FaTrophy, 
  FaChartLine, 
  FaRedo, 
  FaShieldAlt,
  FaPercentage
} from 'react-icons/fa';
import { IoFlashSharp, IoSparkles } from 'react-icons/io5';

export const AviatorAdminControl = () => {
  const storeData = useAviatorStore();

  const [nextCrashInput, setNextCrashInput] = useState('2.00');
  const [profitMarginInput, setProfitMarginInput] = useState('25');
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeNextCrash, setActiveNextCrash] = useState(null);

  // Live backend stats state
  const [apiStats, setApiStats] = useState(null);

  // Fetch initial settings once on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await AxiosAdmin({
          url: SummaryApi.getAviatorSettings?.url || '/api/aviator/settings',
          method: SummaryApi.getAviatorSettings?.method || 'get'
        }).catch(() => null);

        if (res?.data?.data?.settings?.targetProfitPercent !== undefined) {
          setProfitMarginInput(res.data.data.settings.targetProfitPercent.toString());
        }
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  // Poll backend stats every 1 second
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await AxiosAdmin({
          url: SummaryApi.getAviatorStats?.url || '/api/aviator/stats',
          method: SummaryApi.getAviatorStats?.method || 'get'
        }).catch(() => null);

        if (res?.data?.success && res.data.data) {
          setApiStats(res.data.data);
        }
      } catch (e) {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick crash presets
  const crashPresets = ['1.10', '1.25', '1.50', '2.00', '3.00', '5.00', '10.00', '50.00'];

  // Combined stats (Live API stats + store fallback)
  const status = (apiStats?.status?.toLowerCase()) || storeData.status;
  const currentMultiplier = apiStats?.multiplier || storeData.multiplier;
  const crashPointVal = apiStats?.crashAt || storeData.crashMultiplier;
  
  const liveBetsList = (apiStats?.players && Array.isArray(apiStats.players))
    ? apiStats.players
    : storeData.liveBets;

  const historyList = (apiStats?.history && apiStats.history.length > 0) ? apiStats.history : storeData.history;

  const totalBetAmount = apiStats?.totalBetAmount !== undefined 
    ? apiStats.totalBetAmount 
    : liveBetsList.reduce((sum, b) => sum + (Number(b.amount || b.betAmount) || 0), 0);

  const totalCashedOut = apiStats?.totalCashout !== undefined 
    ? apiStats.totalCashout 
    : liveBetsList.reduce((sum, b) => sum + (Number(b.wonAmount || b.payout) || 0), 0);

  const adminProfit = Math.max(0, totalBetAmount - totalCashedOut);
  const profitPercentage = totalBetAmount > 0 ? Math.round((adminProfit / totalBetAmount) * 100) : 100;

  // Handle setting next crash multiplier
  const handleSetNextCrash = async (valToSet) => {
    const val = valToSet || nextCrashInput;
    const num = parseFloat(val);
    if (isNaN(num) || num < 1.0) {
      toast.error('Please enter a valid multiplier >= 1.00');
      return;
    }

    setLoadingAction(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.forceCrashNext?.url || '/api/aviator/force-crash-next',
        method: SummaryApi.forceCrashNext?.method || 'post',
        data: { multiplier: num }
      });

      if (res.data?.success) {
        setActiveNextCrash(num);
        toast.success(`🎯 Next Round Target set to ${num.toFixed(2)}x!`);
      } else {
        toast.error(res.data?.message || 'Failed to set target multiplier');
      }
    } catch (e) {
      toast.error('Failed to set target multiplier');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle instant flight crash
  const handleCrashNow = async () => {
    setLoadingAction(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.forceCrashNow?.url || '/api/aviator/force-crash-now',
        method: SummaryApi.forceCrashNow?.method || 'post'
      });

      if (res.data?.success) {
        toast.success('💥 Flight Crashed Instantly!');
      } else {
        toast.error(res.data?.message || 'Failed to crash flight');
      }
    } catch (e) {
      toast.error('Failed to crash flight');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle saving profit margin
  const handleSaveProfitMargin = async () => {
    const margin = parseInt(profitMarginInput);
    if (isNaN(margin) || margin < 0 || margin > 90) {
      toast.error('Please enter a profit margin between 0% and 90%');
      return;
    }

    setLoadingAction(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.updateAviatorSettings?.url || '/api/aviator/settings',
        method: SummaryApi.updateAviatorSettings?.method || 'post',
        data: { targetProfitPercent: margin }
      });

      if (res.data?.success) {
        toast.success(`⚙️ House Edge Profit Margin set to ${margin}%! 🎉`);
      } else {
        toast.error('Failed to update profit margin');
      }
    } catch (e) {
      toast.error('Failed to update profit margin');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 font-sans select-none space-y-6">
      {/* 1. TOP HEADER & STATUS BAR */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-3xs shrink-0">
            <FaRocket size={22} className="rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Aviator Control Panel</h1>
              <IoSparkles className="text-amber-500" size={18} />
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Live Flight & Profit Control System
            </p>
          </div>
        </div>

        {/* Live Game Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
              status === 'flying' 
                ? 'bg-emerald-500 text-white animate-pulse' 
                : status === 'waiting' 
                ? 'bg-amber-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {status}
            </span>
          </div>

          {activeNextCrash && (
            <div className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
              <span>Next Target: {activeNextCrash.toFixed(2)}x</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. LIVE STATS CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Multiplier Display */}
        <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-white rounded-3xl p-5 border border-gray-800 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Live Flight</span>
            <FaPlane size={16} className={status === 'flying' || status === 'running' ? 'text-red-500 animate-bounce' : 'text-slate-500'} />
          </div>
          <div className="mt-2">
            <span className={`text-4xl font-black tracking-tight ${status === 'flying' || status === 'running' ? 'text-emerald-400' : 'text-white'}`}>
              {status === 'flying' || status === 'running' ? `${Number(currentMultiplier).toFixed(2)}x` : `${Number(crashPointVal).toFixed(2)}x`}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
              {status === 'flying' || status === 'running' ? '🚀 Flight in progress' : '💥 Crash Multiplier'}
            </span>
          </div>
        </div>

        {/* Total Bets */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bets Placed</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FaMoneyBillWave size={15} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">₹{totalBetAmount.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-400 block font-medium mt-0.5">
              {liveBetsList.length} Active Players in Round
            </span>
          </div>
        </div>

        {/* Total Cashed Out */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Cashed Out</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <FaTrophy size={15} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-700 tracking-tight">₹{totalCashedOut.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-gray-400 block font-medium mt-0.5">
              Total Won Payouts
            </span>
          </div>
        </div>

        {/* Admin Net Profit */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Net Profit</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FaChartLine size={15} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">₹{adminProfit.toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {profitPercentage}% Margin
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block font-medium mt-0.5">
              House Edge Profit
            </span>
          </div>
        </div>
      </div>

      {/* 3. FLIGHT CONTROL & NEXT ROUND TARGET PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Round Crash Target Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-3xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <IoFlashSharp className="text-amber-500" size={20} />
              <h2 className="text-base font-bold text-gray-900">Next Round Crash Target</h2>
            </div>
            <span className="text-xs text-gray-400 font-normal">Set next round multiplier</span>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Quick Multiplier Presets
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {crashPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setNextCrashInput(preset);
                    handleSetNextCrash(preset);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    nextCrashInput === preset
                      ? 'bg-red-500 text-white border-red-500 shadow-3xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input & Set Button */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.01"
                min="1.00"
                value={nextCrashInput}
                onChange={(e) => setNextCrashInput(e.target.value)}
                placeholder="Custom multiplier e.g. 2.50"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-red-500 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">x</span>
            </div>

            <button
              type="button"
              disabled={loadingAction}
              onClick={() => handleSetNextCrash()}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-3xs transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <FaRocket size={14} />
              <span>Set Next Crash</span>
            </button>
          </div>
        </div>

        {/* Instant Flight Control & Profit Settings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-3xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
              <FaShieldAlt className="text-emerald-600" size={18} />
              <h2 className="text-base font-bold text-gray-900">Admin Live Control</h2>
            </div>

            {/* Instant Crash Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Instant Flight Crash
              </label>
              <button
                type="button"
                disabled={loadingAction || status !== 'flying'}
                onClick={handleCrashNow}
                className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaBomb size={16} />
                <span>CRASH FLIGHT NOW 💥</span>
              </button>
              <span className="text-[10px] text-gray-400 block text-center font-normal">
                {status === 'flying' ? '⚠️ Will immediately end flight at current multiplier' : 'Flight must be flying to crash'}
              </span>
            </div>
          </div>

          {/* House Edge Profit Setting */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Admin Target Profit
              </label>
              <span className="text-xs font-bold text-emerald-600">{profitMarginInput}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="90"
                value={profitMarginInput}
                onChange={(e) => setProfitMarginInput(e.target.value)}
                className="w-20 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveProfitMargin}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
              >
                Save Profit %
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROUND HISTORY MULTIPLIER BADGES */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-3xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Round Multipliers</h3>
          <span className="text-[10px] text-gray-400 font-medium">Last {historyList.length} Rounds</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {historyList.slice(0, 30).map((h, idx) => {
            const mult = typeof h === 'object' ? (h.crash || h.multiplier || 1.0) : Number(h);
            let colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
            if (mult >= 2.0 && mult < 10.0) colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
            if (mult >= 10.0) colorClass = 'bg-amber-50 text-amber-700 border-amber-200 font-black';

            return (
              <span
                key={`hist-${idx}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${colorClass}`}
              >
                {mult.toFixed(2)}x
              </span>
            );
          })}
        </div>
      </div>

      {/* 5. LIVE BETS TABLE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-3xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Current Round Active Bets</h3>
            <p className="text-xs text-gray-400 font-normal mt-0.5">Real-time player bet details</p>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
            {liveBetsList.length} Players
          </span>
        </div>

        {liveBetsList.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs font-medium">
            No bets placed in the current round yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Bet Amount</th>
                  <th className="py-3 px-4">Cashout Multiplier</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {liveBetsList.map((player, idx) => (
                  <tr key={player.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {player.username || player.user || `User_${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{player.amount}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {player.cashOutMultiplier ? `${player.cashOutMultiplier.toFixed(2)}x` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      {player.wonAmount ? `₹${player.wonAmount.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {player.isCashedOut ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                          Cashed Out
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                          In Flight
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AviatorAdminControl;
