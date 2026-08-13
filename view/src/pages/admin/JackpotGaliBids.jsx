import React, { useState, useEffect } from 'react';
import { 
  Filter, RefreshCw, User, Gamepad, Hash, Calendar, Dices, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const JackpotGaliBids = () => {
  // Filters state
  const [marketFilter, setMarketFilter] = useState('All Markets');
  const [gameTypeFilter, setGameTypeFilter] = useState('All Game Types');
  const [jodiFilter, setJodiFilter] = useState('');
  const [timePeriod, setTimePeriod] = useState('All Time'); // All Time, Today, Yesterday, Custom
  const [customDate, setCustomDate] = useState('');

  // Bids state
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getAllBids?.url || SummaryApi.getFilteredBids?.url,
        method: SummaryApi.getAllBids?.method || SummaryApi.getFilteredBids?.method || 'get'
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        setBids(res.data.data);
      }
    } catch (error) {
      console.warn("Failed to load real bids, using empty state:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const filteredBids = bids.filter((bid) => {
    if (marketFilter !== 'All Markets' && bid.market_id?.name !== marketFilter) return false;
    if (gameTypeFilter !== 'All Game Types' && bid.game_type !== gameTypeFilter) return false;
    if (jodiFilter && !String(bid.number || '').includes(jodiFilter)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 md:p-10 font-sans flex flex-col items-center justify-start text-center select-none text-gray-800">
      
      <div className="w-full max-w-5xl space-y-6">
        
        {/* 1. Header Section */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-blue-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4f46e5]"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jackpot Gali Bids Management</h1>
            <p className="text-gray-500 font-medium text-xs mt-1">View and manage all jackpot gali bids management</p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchBids}
            className="bg-[#4b46e5] hover:bg-[#3f39cf] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-3xs active:scale-95 flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* 2. Filter Bids Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 text-left">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Filter Bids</span>
          </div>

          <div className="space-y-3.5">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Markets Select */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <User size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Markets">All Markets</option>
                  <option value="GALI 1">GALI 1</option>
                  <option value="DISAWAR 1">DISAWAR 1</option>
                </select>
                <span className="absolute right-3.5 top-3 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Game Types Select */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <Gamepad size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Game Types">All Game Types</option>
                  <option value="Left Digit">Left Digit</option>
                  <option value="Right Digit">Right Digit</option>
                  <option value="Jodi">Jodi</option>
                </select>
                <span className="absolute right-3.5 top-3 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Filter by Jodi Input */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <Hash size={13} className="stroke-[2.5]" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by Jodi"
                  value={jodiFilter}
                  onChange={(e) => setJodiFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#f8f9fa] border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                />
              </div>

              {/* All Time button */}
              <button
                type="button"
                onClick={() => setTimePeriod('All Time')}
                className={`text-xs font-semibold px-4.5 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
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
                className={`text-xs font-semibold px-4.5 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
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
                className={`text-xs font-semibold px-4.5 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  timePeriod === 'Yesterday'
                    ? 'bg-[#4b46e5] text-white border-transparent'
                    : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Yesterday</span>
              </button>
            </div>

            {/* Row 2 */}
            <div className="relative w-full sm:w-44">
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
                className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Empty State Card Box */}
        <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-2xs flex flex-col items-center justify-center text-center min-h-[220px]">
          {loading ? (
            <div className="space-y-2">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto" />
              <span className="text-xs font-semibold text-gray-400">Loading bids...</span>
            </div>
          ) : filteredBids.length === 0 ? (
            /* EXACT MATCH LOOKUP */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m22 8-4-4"/><rect width="12" height="12" x="10" y="2" rx="2" ry="2"/><path d="m2 14 4-4"/><path d="m14 2 4 4"/></svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-950">No Bids Found</h2>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">
                  There are no bids matching your current filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-[#ebe9f1] rounded-2xl">
              <table className="w-full text-left border-collapse text-xs font-semibold text-gray-600">
                <thead>
                  <tr className="bg-[#f3f2f7] border-b border-[#ebe9f1] text-[10px] font-bold text-[#6e6b7b] uppercase tracking-wider">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Market</th>
                    <th className="p-3">Game Type</th>
                    <th className="p-3">Number</th>
                    <th className="p-3">Points</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe9f1]">
                  {filteredBids.map((bid, idx) => (
                    <tr key={bid._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 pl-4 font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-3 text-gray-900 font-bold">{bid.userId?.name || bid.userId || 'N/A'}</td>
                      <td className="p-3">{bid.market_id?.name || 'N/A'}</td>
                      <td className="p-3 uppercase text-[10px] font-bold">{bid.game_type}</td>
                      <td className="p-3 font-bold text-gray-900">{bid.number}</td>
                      <td className="p-3 font-bold text-indigo-600">₹{bid.amount}</td>
                      <td className="p-3 text-right pr-4">
                        <button
                          onClick={() => {
                            setBids(prev => prev.filter(b => b._id !== bid._id));
                            toast.success('Bid removed');
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Bid"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
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
