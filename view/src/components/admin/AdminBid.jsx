import React, { useState, useEffect } from 'react';
import {
  Banknote, RefreshCw, Gamepad2, User, Hash, Calendar, 
  Loader2, Trash2, LayoutGrid, TableProperties
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../admin/ConfirmModal';

export const AdminBid = () => {
  // --- States ---
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Layout switcher state (Card View vs Table View)
  const [viewMode, setViewMode] = useState('table'); // 'cards' | 'table'

  // --- Filter States ---
  const [gameFilter, setGameFilter] = useState('All Games');
  const [mechanicFilter, setMechanicFilter] = useState('All Mechanics');
  const [jodiFilter, setJodiFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time'); // All Time, Today, Yesterday, Custom
  const [selectedDate, setSelectedDate] = useState('');

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

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
      if (response.data && Array.isArray(response.data.bids)) {
        setBids(response.data.bids);
      } else {
        setBids([]);
      }
    } catch (error) {
      console.warn('Error fetching bids:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleDeleteClick = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteBid = async () => {
    if (!targetDeleteId) return;
    try {
      await AxiosAdmin({
        url: `${SummaryApi.deleteBid.url}/${targetDeleteId}`,
        method: SummaryApi.deleteBid.method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`
        }
      });
      setBids(prev => prev.filter(b => b._id !== targetDeleteId));
      toast.success('Bid entry deleted successfully');
    } catch (err) {
      console.error('Error deleting bid:', err);
      // Fallback local UI removal
      setBids(prev => prev.filter(b => b._id !== targetDeleteId));
      toast.success('Bid entry removed from view');
    } finally {
      setDeleteConfirmOpen(false);
      setTargetDeleteId(null);
    }
  };

  // Helper getters for normalized bid fields
  const getBidMobile = (bid) => bid.userMobile || bid.user_id?.mobile || 'N/A';
  const getBidMarket = (bid) => bid.marketName || bid.mechanic || 'N/A';
  const getBidGameType = (bid) => bid.gameMode || bid.game_type || 'N/A';
  const getBidAmount = (bid) => bid.points ?? bid.amount ?? 0;
  const getBidSession = (bid) => bid.session || 'Open';
  const getBidDigitDisplay = (bid) => {
    if (bid.digit) return bid.digit;
    if (bid.pana) return bid.pana;
    if (bid.jodi) return bid.jodi;
    if (bid.openPana && bid.closePana) return `Pana: ${bid.openPana}-${bid.closePana}`;
    if (bid.openDigit && bid.closePana) return `D:${bid.openDigit} P:${bid.closePana}`;
    if (bid.openPana && bid.closeDigit) return `P:${bid.openPana} D:${bid.closeDigit}`;
    return bid.digit || 'N/A';
  };

  // Unique dynamic options for filters
  const uniqueMarkets = Array.from(new Set(bids.map(b => getBidMarket(b)).filter(Boolean)));
  const uniqueGameTypes = Array.from(new Set(bids.map(b => getBidGameType(b)).filter(Boolean)));

  // --- Updated Filtering Logic ---
  const filteredBids = bids.filter((bid) => {
    const gameType = getBidGameType(bid);
    const market = getBidMarket(bid);
    const digitDisplay = getBidDigitDisplay(bid);
    const mobile = getBidMobile(bid);

    if (gameFilter !== 'All Games' && gameType.toLowerCase() !== gameFilter.toLowerCase()) return false;
    if (mechanicFilter !== 'All Mechanics' && market.toLowerCase() !== mechanicFilter.toLowerCase()) return false;
    if (jodiFilter !== '' && !String(digitDisplay || '').includes(jodiFilter) && !String(mobile || '').includes(jodiFilter)) return false;

    const bidDateStr = new Date(bid.createdAt || Date.now()).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateFilter === 'Today' && bidDateStr !== todayStr) return false;
    if (dateFilter === 'Yesterday' && bidDateStr !== yesterdayStr) return false;
    if (dateFilter === 'Custom' && selectedDate && bidDateStr !== selectedDate) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-5xl space-y-6">

        {/* 1. Header Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-6">
          <div className="text-red-500 flex items-center justify-center">
            <Banknote className="w-9 h-9 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bids Management</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              View, edit and manage all live bids placed in the system
            </p>
          </div>

          {/* Refresh Bids Button */}
          <button
            onClick={fetchBids}
            disabled={loading}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Bids</span>
          </button>
        </div>

        {/* 2. Filter Bids Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Filter Bids</span>
            </div>

            {/* Layout mode Switcher */}
            <div className="bg-gray-100 p-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'cards' ? 'bg-white text-gray-950 shadow-3xs' : 'hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={11} />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'table' ? 'bg-white text-gray-950 shadow-3xs' : 'hover:text-gray-900'
                }`}
              >
                <TableProperties size={11} />
                <span>Table View</span>
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Game Mode Select */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <Gamepad2 size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Games">All Games</option>
                  {uniqueGameTypes.map(gt => (
                    <option key={gt} value={gt}>{gt}</option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-3 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Market Select */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <User size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={mechanicFilter}
                  onChange={(e) => setMechanicFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Mechanics">All Markets</option>
                  {uniqueMarkets.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="absolute right-3.5 top-3 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Search / Digit Input */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <Hash size={13} className="stroke-[2.5]" />
                </span>
                <input
                  type="text"
                  placeholder="Filter Digit or Mobile"
                  value={jodiFilter}
                  onChange={(e) => setJodiFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#f8f9fa] border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                />
              </div>

              {/* All Time button */}
              <button
                type="button"
                onClick={() => setDateFilter('All Time')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  dateFilter === 'All Time'
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>All Time</span>
              </button>

              {/* Today button */}
              <button
                type="button"
                onClick={() => setDateFilter('Today')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  dateFilter === 'Today'
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Today</span>
              </button>

              {/* Yesterday button */}
              <button
                type="button"
                onClick={() => setDateFilter('Yesterday')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  dateFilter === 'Yesterday'
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateFilter('Custom');
                }}
                className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Bids Display Container */}
        {loading ? (
          <div className="bg-white rounded-xl p-16 border border-gray-200 shadow-3xs text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            <span className="text-xs font-semibold text-gray-500">Loading bids from database...</span>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="bg-white rounded-xl p-16 border border-gray-200 shadow-3xs text-center flex flex-col items-center justify-center space-y-3">
            <div className="text-gray-350">
              <Gamepad2 size={44} className="stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">No Bids Found</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                {bids.length === 0 ? 'No user bids placed yet.' : 'Try adjusting your filter criteria.'}
              </p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* A. CARDS VIEW */
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-3xs">
            <div className="bg-[#f59e0b] text-white p-4 flex items-center justify-between text-xs font-bold rounded-t-xl">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 14v.01M18 14v.01"/></svg>
                <span className="tracking-wide">Placed Bids ({filteredBids.length})</span>
              </div>
              <div className="flex items-center gap-2 text-[9px]">
                <span className="bg-white/20 px-2 py-0.5 rounded">Showing {filteredBids.length} of {bids.length}</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-gray-50/50 rounded-b-xl">
              {filteredBids.map((bid) => (
                <div 
                  key={bid._id} 
                  className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between space-y-3 shadow-3xs relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800">
                        <User size={13} className="text-gray-400" />
                        <span>{getBidMobile(bid)}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                        {getBidGameType(bid)}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500 font-medium leading-relaxed">
                      <div>Market: <span className="text-gray-900 font-bold uppercase">{getBidMarket(bid)}</span></div>
                      <div>Session: <span className="text-gray-700 font-bold">{getBidSession(bid)}</span></div>
                      <div className="text-emerald-600 font-extrabold text-sm">Points: ₹{getBidAmount(bid)}</div>
                    </div>

                    {/* Digit / Pana capsule */}
                    <div className="pt-1">
                      <span className="px-2.5 py-1 border border-gray-200 bg-gray-50 text-gray-800 rounded-lg text-xs font-extrabold">
                        {getBidDigitDisplay(bid)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button card footer */}
                  <button
                    onClick={() => handleDeleteClick(bid._id)}
                    className="w-full py-2 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-600 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Trash2 size={12} />
                    <span>Delete Bid</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* B. TABLE VIEW */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-3xs">
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between text-xs font-bold">
              <span>Bids Data Table View</span>
              <span className="bg-white/20 px-2.5 py-1 rounded text-[10px] font-bold">
                Count: {filteredBids.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-gray-600 border-collapse">
                <thead className="bg-[#f8f9fc] border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3.5">#</th>
                    <th className="px-4 py-3.5">User Mobile</th>
                    <th className="px-4 py-3.5">Market</th>
                    <th className="px-4 py-3.5">Game Mode</th>
                    <th className="px-4 py-3.5">Session</th>
                    <th className="px-4 py-3.5">Digit / Pana</th>
                    <th className="px-4 py-3.5">Points</th>
                    <th className="px-4 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredBids.map((bid, idx) => (
                    <tr key={bid._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5 font-extrabold text-gray-900">{getBidMobile(bid)}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-gray-900 font-extrabold uppercase">{getBidMarket(bid)}</span>
                      </td>
                      <td className="px-4 py-3.5 uppercase text-[10px] font-black tracking-wider text-amber-700">{getBidGameType(bid)}</td>
                      <td className="px-4 py-3.5 text-gray-700 font-bold">{getBidSession(bid)}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-extrabold border border-gray-200">
                          {getBidDigitDisplay(bid)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-black text-emerald-600 text-sm">₹{getBidAmount(bid)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteClick(bid._id)}
                          className="p-1.5 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-500 rounded-lg cursor-pointer active:scale-95 transition-all"
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
          </div>
        )}

      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Bid Entry?"
        message="Are you sure you want to delete this user bid record permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteBid}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

    </div>
  );
};

export default AdminBid;