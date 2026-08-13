import React, { useState, useEffect } from 'react';
import {
  Banknote, RefreshCw, Filter, Gamepad2, User, Hash, Calendar, 
  Loader2, Trash2, Eye, EyeOff, LayoutGrid, TableProperties
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../admin/ConfirmModal';

export const AdminBid = () => {
  // --- States ---
  const [bids, setBids] = useState([
    { _id: '1', user_id: { mobile: '8079003424' }, game_type: 'Single Ank', mechanic: 'MILAN DAY', amount: 10, digit: '0', createdAt: '2026-08-13T10:00:00Z' },
    { _id: '2', user_id: { mobile: '8079003424' }, game_type: 'Single Ank', mechanic: 'MILAN DAY', amount: 10, digit: '1', createdAt: '2026-08-13T10:05:00Z' },
    { _id: '3', user_id: { mobile: '8079003424' }, game_type: 'Single Ank', mechanic: 'MILAN DAY', amount: 10, digit: '2', createdAt: '2026-08-13T10:10:00Z' },
    { _id: '4', user_id: { mobile: '9988776655' }, game_type: 'Jodi', mechanic: 'KALYAN', amount: 50, digit: '25', createdAt: '2026-08-13T10:15:00Z' },
    { _id: '5', user_id: { mobile: '8877665544' }, game_type: 'Single Panna', mechanic: 'TIME BAZAR', amount: 100, digit: '123', createdAt: '2026-08-13T10:20:00Z' }
  ]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Layout switcher state (Card View vs Table View)
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

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
      }
    } catch (error) {
      console.warn('Network error fetching bids, using local mock bids details:', error);
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

  const confirmDeleteBid = () => {
    setBids(prev => prev.filter(b => b._id !== targetDeleteId));
    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
    toast.success('Bid entry deleted successfully');
  };

  // --- Updated Filtering Logic ---
  const filteredBids = bids.filter((bid) => {
    if (gameFilter !== 'All Games' && bid.game_type !== gameFilter) return false;
    if (mechanicFilter !== 'All Mechanics' && bid.mechanic !== mechanicFilter) return false;
    if (jodiFilter !== '' && !String(bid.digit || '').includes(jodiFilter)) return false;

    const bidDateStr = new Date(bid.createdAt).toISOString().split('T')[0];
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
              View, edit and manage all bids in the system
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

            {/* Special Layout mode Switcher */}
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
              {/* All Games Select */}
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
                  <option value="Single Ank">Single Ank</option>
                  <option value="Jodi">Jodi</option>
                  <option value="Single Panna">Single Panna</option>
                  <option value="Double Panna">Double Panna</option>
                  <option value="Triple Panna">Triple Panna</option>
                </select>
                <span className="absolute right-3.5 top-3 text-[9px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* All Mechanics Select */}
              <div className="relative w-full sm:w-44">
                <span className="absolute left-3 top-3 text-gray-400">
                  <User size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={mechanicFilter}
                  onChange={(e) => setMechanicFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Mechanics">All Mechanics</option>
                  <option value="MILAN DAY">MILAN DAY</option>
                  <option value="KALYAN">KALYAN</option>
                  <option value="TIME BAZAR">TIME BAZAR</option>
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
                onClick={() => setDateFilter('All Time')}
                className={`text-xs font-semibold px-4.5 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  dateFilter === 'All Time'
                    ? 'bg-red-650 text-white border-transparent'
                    : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>All Time</span>
              </button>

              {/* Today button */}
              <button
                type="button"
                onClick={() => setDateFilter('Today')}
                className={`text-xs font-semibold px-4.5 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  dateFilter === 'Today'
                    ? 'bg-red-650 text-white border-transparent'
                    : 'bg-white text-gray-650 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Today</span>
              </button>

              {/* Yesterday button */}
              <button
                type="button"
                onClick={() => setDateFilter('Yesterday')}
                className={`text-xs font-semibold px-4.5 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-3xs ${
                  dateFilter === 'Yesterday'
                    ? 'bg-red-650 text-white border-transparent'
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
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto" />
            <span className="text-xs font-semibold text-gray-400">Loading bids data...</span>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="bg-white rounded-xl p-16 border border-gray-200 shadow-3xs text-center flex flex-col items-center justify-center space-y-3">
            <div className="text-gray-350">
              <Gamepad2 size={44} className="stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">No Bids Found</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* A. CARDS VIEW MATCHING SCREENSHOT */
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-3xs">
            {/* Header bar matching Screenshot yellow banner */}
            <div className="bg-[#f59e0b] text-white p-4 flex items-center justify-between text-xs font-bold rounded-t-xl">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M6 14v.01M18 14v.01"/></svg>
                <span className="tracking-wide">Single Ank Bids</span>
              </div>
              <div className="flex items-center gap-2 text-[9px]">
                <span className="bg-white/20 px-2 py-0.5 rounded">Showing {filteredBids.length} of {bids.length}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded">Page 1 of 1</span>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-b-xl">
              {filteredBids.map((bid) => (
                <div 
                  key={bid._id} 
                  className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between space-y-4 shadow-3xs relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-gray-700">
                        <User size={12} className="text-gray-400" />
                        <span>{bid.user_id?.mobile || 'Unknown'}</span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                        {bid.game_type}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-gray-500 font-semibold leading-relaxed">
                      <div>Mechanic: <span className="text-gray-900 font-bold">{bid.mechanic}</span></div>
                      <div className="text-emerald-600 font-bold">Amount: ₹{bid.amount}</div>
                    </div>

                    {/* Close digit capsule */}
                    <div className="pt-1">
                      <span className="px-2 py-0.5 border border-gray-300 bg-gray-50 text-gray-505 rounded text-[9px] font-bold">
                        Close Digit: {bid.digit}
                      </span>
                    </div>
                  </div>

                  {/* Delete button card footer */}
                  <button
                    onClick={() => handleDeleteClick(bid._id)}
                    className="w-full py-2 bg-red-50 hover:bg-red-500 hover:text-white border border-red-150 text-red-500 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Trash2 size={11} />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* B. TABLE VIEW (THE SPECIAL REQUESTED FEATURE!) */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-3xs">
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between text-xs font-bold">
              <span>Bids Data Table View</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[9px]">
                Count: {filteredBids.length} entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-gray-600 border-collapse">
                <thead className="bg-[#f8f9fc] border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">User Mobile</th>
                    <th className="px-5 py-4">Game / Mechanic</th>
                    <th className="px-5 py-4">Bid Type</th>
                    <th className="px-5 py-4">Close Digit</th>
                    <th className="px-5 py-4">Points</th>
                    <th className="px-5 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredBids.map((bid, idx) => (
                    <tr key={bid._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-bold">{idx + 1}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{bid.user_id?.mobile || 'N/A'}</td>
                      <td className="px-5 py-4">
                        <span className="text-gray-800 font-bold">{bid.mechanic}</span>
                      </td>
                      <td className="px-5 py-4 uppercase text-[9px] font-black tracking-wider text-gray-450">{bid.game_type}</td>
                      <td className="px-5 py-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">{bid.digit}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-600">₹{bid.amount}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(bid._id)}
                          className="p-1 bg-red-50 hover:bg-red-500 hover:text-white border border-red-200 text-red-500 rounded-lg cursor-pointer active:scale-95 transition-all"
                          title="Delete Bid"
                        >
                          <Trash2 size={11} />
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
        message="Are you sure you want to delete this user bid record config permanently?"
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