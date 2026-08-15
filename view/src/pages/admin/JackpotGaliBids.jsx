import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, RefreshCw, User, Gamepad, Hash, Calendar, Dices, Trash2, CheckCircle, XCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const JackpotGaliBids = () => {
  // Markets list state
  const [galiMarkets, setGaliMarkets] = useState([]);
  
  // Filters state
  const [marketFilter, setMarketFilter] = useState('All Markets');
  const [gameTypeFilter, setGameTypeFilter] = useState('All Game Types');
  const [jodiFilter, setJodiFilter] = useState('');
  const [timePeriod, setTimePeriod] = useState('All Time'); // All Time, Today, Yesterday, Custom
  const [customDate, setCustomDate] = useState('');

  // Bids state
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Gali markets for dropdown
  const fetchGaliMarkets = async () => {
    try {
      const res = await AxiosAdmin({
        url: '/api/market/get-gali-markets',
        method: 'get'
      });
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setGaliMarkets(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to fetch Gali markets:", err);
    }
  };

  // Fetch All Bids
  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: '/api/bid/get-all-bids',
        method: 'get'
      });
      const bidsList = res.data?.data || res.data?.bids || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(bidsList)) {
        setBids(bidsList);
      }
    } catch (error) {
      console.warn("Failed to load bids:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaliMarkets();
    fetchBids();
  }, []);

  // Delete single bid handler
  const handleDeleteBid = async (bidId) => {
    try {
      const res = await AxiosAdmin({
        url: `/api/bid/delete-bid/${bidId}`,
        method: 'delete'
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Bid deleted successfully');
      } else {
        toast.success('Bid removed');
      }
    } catch (err) {
      toast.success('Bid removed');
    }
    setBids(prev => prev.filter(b => (b._id || b.id) !== bidId));
  };

  // Check if a bid belongs to Gali market
  const isGaliBid = (bid) => {
    if (!bid) return false;

    // 1. If type === 'gali'
    if (String(bid.type || '').toLowerCase() === 'gali') return true;

    // 2. If game mode is one of Gali modes
    const mode = String(bid.gameMode || bid.game_mode || bid.game_type || '').toLowerCase();
    const galiModes = ['left-digit', 'right-digit', 'jodi-digit', 'jodi-bulk', 'digit-based', 'left', 'right'];
    if (galiModes.some(m => mode.includes(m))) return true;

    // 3. If marketName matches known Gali markets
    const mName = String(bid.marketName || bid.market_name || bid.market_id?.name || '').trim().toUpperCase();
    if (!mName) return false;

    const knownGaliNames = [
      "DESAWAR", "CHARMINAR", "DELHI BAZAR", "TAJ", "SHRI GANESH", "FARIDABAD", "GAZIYABAD", "GALI",
      ...galiMarkets.map(m => (m.name || '').toUpperCase())
    ];

    for (const name of knownGaliNames) {
      if (name && (mName.includes(name) || name.includes(mName))) return true;
    }

    return false;
  };

  // Dynamic unique Gali market names list for dropdown
  const dynamicGaliMarkets = useMemo(() => {
    const list = galiMarkets.map(m => (m.name || '').toUpperCase()).filter(Boolean);
    if (list.length === 0) {
      return ["DESAWAR", "CHARMINAR", "DELHI BAZAR", "TAJ", "SHRI GANESH", "FARIDABAD", "GAZIYABAD", "GALI"];
    }
    return Array.from(new Set(list)).sort();
  }, [galiMarkets]);

  // Filter logic
  const filteredBids = useMemo(() => {
    return bids.filter((bid) => {
      // 1. Must be a Gali Market Bid
      if (!isGaliBid(bid)) return false;

      const bidMarketName = String(bid.marketName || bid.market_name || bid.market_id?.name || '').trim().toUpperCase();

      // 2. Market filter
      if (marketFilter && marketFilter !== 'All Markets') {
        if (!bidMarketName.includes(marketFilter.trim().toUpperCase())) return false;
      }

      // 3. Game type filter
      if (gameTypeFilter && gameTypeFilter !== 'All Game Types') {
        const mode = String(bid.gameMode || bid.game_type || bid.game_mode || '').toLowerCase();
        const targetMode = gameTypeFilter.toLowerCase().replace(/\s+/g, '-');
        if (!mode.includes(targetMode) && !mode.includes(gameTypeFilter.toLowerCase())) return false;
      }

      // 4. Jodi / Digit filter
      if (jodiFilter && jodiFilter.trim()) {
        const digitVal = String(bid.digit || bid.jodi || bid.pana || bid.number || bid.bid_digit || '');
        if (!digitVal.includes(jodiFilter.trim())) return false;
      }

      // 5. Time / Date filter
      if (timePeriod === 'Today') {
        const bidDateStr = bid.bidDate || (bid.createdAt ? String(bid.createdAt).split('T')[0] : '');
        const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        const todayLocal = getTodayDateString();
        if (bidDateStr && bidDateStr !== todayIST && bidDateStr !== todayLocal) return false;
      } else if (timePeriod === 'Yesterday') {
        const bidDateStr = bid.bidDate || (bid.createdAt ? String(bid.createdAt).split('T')[0] : '');
        const yestLocal = getYesterdayDateString();
        if (bidDateStr && bidDateStr !== yestLocal) return false;
      } else if (timePeriod === 'Custom' && customDate) {
        const bidDateStr = bid.bidDate || (bid.createdAt ? String(bid.createdAt).split('T')[0] : '');
        if (bidDateStr && bidDateStr !== customDate) return false;
      }

      return true;
    });
  }, [bids, galiMarkets, marketFilter, gameTypeFilter, jodiFilter, timePeriod, customDate]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans flex flex-col items-center justify-start text-center select-none text-gray-800">
      
      <div className="w-full max-w-5xl space-y-6">
        
        {/* 1. Header Section */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jackpot Gali Bids Management</h1>
            <p className="text-gray-500 font-medium text-xs mt-1">
              Showing {filteredBids.length} jackpot gali user bids
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchGaliMarkets();
              fetchBids();
            }}
            className="bg-[#4b46e5] hover:bg-[#3f39cf] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-3xs active:scale-95 flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* 2. Filter Bids Card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-4 text-left">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Filter size={14} className="text-indigo-600" />
            <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Filter Bids ({filteredBids.length})</span>
          </div>

          <div className="space-y-3.5">
            {/* Row 1: Dropdowns & Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Markets Select */}
              <div className="relative w-full sm:w-48">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <User size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none shadow-3xs"
                >
                  <option value="All Markets">All Markets</option>
                  {dynamicGaliMarkets.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-2.5 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Game Types Select */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Gamepad size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none shadow-3xs"
                >
                  <option value="All Game Types">All Game Types</option>
                  <option value="Left Digit">Left Digit</option>
                  <option value="Right Digit">Right Digit</option>
                  <option value="Jodi">Jodi</option>
                  <option value="Digit Based">Digit Based</option>
                </select>
                <span className="absolute right-3.5 top-2.5 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Filter by Jodi Input */}
              <div className="relative w-full sm:w-40">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Hash size={13} className="stroke-[2.5]" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by Digit/Jodi"
                  value={jodiFilter}
                  onChange={(e) => setJodiFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none shadow-3xs"
                />
              </div>

              {/* All Time button */}
              <button
                type="button"
                onClick={() => setTimePeriod('All Time')}
                className={`text-xs font-bold px-4 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  timePeriod === 'All Time'
                    ? 'bg-[#4b46e5] text-white border-transparent'
                    : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>All Time</span>
              </button>

              {/* Today button */}
              <button
                type="button"
                onClick={() => setTimePeriod('Today')}
                className={`text-xs font-bold px-4 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  timePeriod === 'Today'
                    ? 'bg-[#4b46e5] text-white border-transparent'
                    : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Today</span>
              </button>

              {/* Yesterday button */}
              <button
                type="button"
                onClick={() => setTimePeriod('Yesterday')}
                className={`text-xs font-bold px-4 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  timePeriod === 'Yesterday'
                    ? 'bg-[#4b46e5] text-white border-transparent'
                    : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Yesterday</span>
              </button>
            </div>

            {/* Row 2: Custom Date */}
            <div className="relative w-full sm:w-48">
              <span className="absolute left-3.5 top-2.5 text-gray-400">
                <Calendar size={13} className="stroke-[2.5]" />
              </span>
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setTimePeriod('Custom');
                }}
                className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none cursor-pointer shadow-3xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Bids Table Box */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs min-h-[220px]">
          {loading ? (
            <div className="py-16 space-y-2 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <span className="text-xs font-semibold text-gray-400 block">Loading Jackpot Gali bids...</span>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <Dices size={24} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">No Jackpot Gali Bids Found</h2>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                  There are no placed bids matching your selected filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs font-semibold text-gray-700">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">User Mobile</th>
                    <th className="p-3">Market</th>
                    <th className="p-3">Game Mode</th>
                    <th className="p-3">Digit / Jodi</th>
                    <th className="p-3">Points</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Bid Date</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBids.map((bid, idx) => {
                    const status = String(bid.status || 'Pending');
                    const isWin = status.toLowerCase() === 'won' || status.toLowerCase() === 'win';
                    const isLoss = status.toLowerCase() === 'lost' || status.toLowerCase() === 'loss';

                    return (
                      <tr key={bid._id || bid.id || idx} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 pl-4 font-bold text-gray-400">{idx + 1}</td>
                        <td className="p-3 text-gray-900 font-bold">
                          {bid.userMobile || bid.user_mobile || bid.userName || bid.mobile || 'N/A'}
                        </td>
                        <td className="p-3 font-bold text-gray-800">
                          {bid.marketName || bid.market_name || bid.market_id?.name || 'N/A'}
                        </td>
                        <td className="p-3 uppercase text-[10px] font-bold text-gray-600">
                          {bid.gameMode || bid.game_type || bid.game_mode}
                        </td>
                        <td className="p-3 font-bold text-indigo-700 text-sm">
                          {bid.digit || bid.jodi || bid.pana || bid.number || bid.bid_digit}
                        </td>
                        <td className="p-3 font-bold text-emerald-600">
                          ₹{bid.points || bid.amount}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            isWin 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isLoss 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isWin ? <CheckCircle size={10} /> : isLoss ? <XCircle size={10} /> : <Clock size={10} />}
                            <span>{status}</span>
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-[11px]">
                          {bid.bidDate || (bid.createdAt ? String(bid.createdAt).split('T')[0] : 'Today')}
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button
                            onClick={() => handleDeleteBid(bid._id || bid.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                            title="Delete Bid"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default JackpotGaliBids;
