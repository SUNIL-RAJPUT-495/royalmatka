import React, { useState, useEffect } from 'react';
import {
  Banknote,
  RefreshCw,
  Filter,
  Gamepad2,
  User,
  Hash,
  CalendarDays,
  Calendar,
  Loader2,
  Search,
  AlertTriangle
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';

export const AdminBid = () => {
  // --- States ---
  const [bids, setBids] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // --- Filter States (Binding UI to these) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('All Games');
  const [mechanicFilter, setMechanicFilter] = useState('All Mechanics');
  const [jodiFilter, setJodiFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time'); // For buttons
  const [selectedDate, setSelectedDate] = useState(''); // For Date Picker

  const fetchBids = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getAllBids.url,
        method: SummaryApi.getAllBids.method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`
        }
      });

      if (response.data) {
        setBids(response.data.bids || []);
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  console.log(bids)

  // --- ✨ Updated Filtering Logic ✨ ---
  const filteredBids = bids.filter((bid) => {
    // 1. Search by Name or ID
    const matchesSearch =
      (bid.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bid._id || '').includes(searchTerm);

    // 2. Filter by Game Name
    const matchesGame = gameFilter === 'All Games' || bid.market_id?.name === gameFilter;

    // 3. Filter by Jodi Number
    const matchesJodi = jodiFilter === '' || String(bid.bet_number || '').includes(jodiFilter);

    // 4. Filter by Date Logic
    const bidDateStr = new Date(bid.createdAt).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let matchesDate = true;
    if (dateFilter === 'Today') matchesDate = bidDateStr === todayStr;
    else if (dateFilter === 'Yesterday') matchesDate = bidDateStr === yesterdayStr;
    else if (selectedDate) matchesDate = bidDateStr === selectedDate;

    return matchesSearch && matchesGame && matchesJodi && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">

      {/* 1. Header Section */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-red-100 p-3 rounded-2xl">
            <Banknote className="text-red-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">Bids Management</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6 max-w-md">Analyze and monitor every player's move across all games in real-time.</p>

        <button
          onClick={fetchBids}
          disabled={loading}
          className="flex items-center gap-2 bg-[#31004A] hover:bg-[#4a0070] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Sync Bids'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* 2. Error Banner */}
        {hasError && (
          <div className="bg-red-50 border-l-[6px] border-red-500 p-4 rounded-r-xl mb-6 flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            <div>
              <h3 className="text-red-800 font-bold">Network Error</h3>
              <p className="text-red-600 text-sm">Could not fetch bids. Please check your backend connection.</p>
            </div>
          </div>
        )}

        {/* 3. Filter Box */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="text-gray-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-gray-800">Filter Bids</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            
            {/* Search Input (Added functionality to your Header Search) */}
            <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 w-full md:w-64 focus-within:border-blue-500 transition-colors mb-2 md:mb-0">
               <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
               <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search User or ID" 
                  className="bg-transparent w-full outline-none text-gray-700 text-sm" 
               />
            </div>

            {/* All Games Dropdown */}
            <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 w-48 focus-within:border-blue-500 transition-colors">
              <Gamepad2 className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
              <select 
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="bg-transparent w-full outline-none text-gray-700 text-sm appearance-none cursor-pointer"
              >
                <option>All Games</option>
                <option>Roulette</option>
                <option>Ludo</option>
                <option>Teen Patti</option>
              </select>
            </div>

            {/* Filter by Jodi Input */}
            <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 w-48 focus-within:border-blue-500 transition-colors">
              <Hash className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filter by Jodi"
                value={jodiFilter}
                onChange={(e) => setJodiFilter(e.target.value)}
                className="bg-transparent w-full outline-none text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Quick Date Filters */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setDateFilter('All Time'); setSelectedDate(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateFilter === 'All Time' ? 'bg-[#ef4444] text-white' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}
              >
                <CalendarDays className="w-4 h-4" /> All Time
              </button>
              <button 
                onClick={() => { setDateFilter('Today'); setSelectedDate(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateFilter === 'Today' ? 'bg-[#ef4444] text-white' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}
              >
                Today
              </button>
              <button 
                onClick={() => { setDateFilter('Yesterday'); setSelectedDate(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateFilter === 'Yesterday' ? 'bg-[#ef4444] text-white' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="relative flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 w-48 focus-within:border-blue-500 transition-colors">
            <Calendar className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setDateFilter('Custom'); }}
              className="bg-transparent w-full outline-none text-gray-700 text-sm cursor-pointer"
            />
          </div>
        </div>

        {/* 4. Data Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-[#601a91] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Crunching data...</p>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Gamepad2 className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No Bids Found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Bid ID</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">User Detail</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Game / Number</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Date & Time</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBids.map((bid) => (
                    <tr key={bid._id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-purple-600">#{bid._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{bid.user_id?.name || 'Unknown User'}</div>
                        <div className="text-[10px] text-gray-400">{bid.user_id?.mobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-700">{bid.market_id?.name || 'Manual'}</div>
                        <div className="text-[10px] text-blue-500 font-bold">JODI: {bid.bet_number || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">₹{bid.amount}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(bid.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                          ${bid.status === 'Won' ? 'bg-green-100 text-green-700 border border-green-200' :
                            bid.status === 'Lost' ? 'bg-red-100 text-red-700 border border-red-200' :
                              'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                          {bid.status || 'Pending'}
                        </span>
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