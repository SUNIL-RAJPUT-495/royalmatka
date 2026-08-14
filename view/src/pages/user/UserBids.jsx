import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaWallet,
  FaCalendarAlt
} from 'react-icons/fa';
import {
  IoSearchOutline,
  IoTimeOutline,
  IoGameControllerOutline,
  IoClose
} from 'react-icons/io5';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const UserBids = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const isGreenTheme = currentTheme?.id?.includes('green') || currentTheme?.headerBgColor === '#447668';
  const themeColor = currentTheme?.headerBgColor || (isGreenTheme ? '#447668' : '#f95e07');

  // Status Filter: 'all' | 'wins' | 'losses' | 'pending'
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Drawer State (Closed by default)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'yesterday' | 'custom'
  const [customDate, setCustomDate] = useState('2026-08-12');
  const [sortOrder, setSortOrder] = useState('oldest'); // 'newest' | 'oldest'

  // Format custom date for display e.g. "12 Aug 2026"
  const formatDisplayDate = (dStr) => {
    if (!dStr) return 'Select date';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Live Bids list state
  const [bidsList, setBidsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch real user bids from backend
  React.useEffect(() => {
    const fetchUserBids = async () => {
      try {
        setLoading(true);
        const localUserStr = localStorage.getItem("user_data") || localStorage.getItem("user");
        let localUser = null;
        try { if (localUserStr) localUser = JSON.parse(localUserStr); } catch (e) {}
        const mobile = localUser?.mobile || '';

        if (!mobile) {
          setLoading(false);
          return;
        }

        const res = await Axios({
          url: `${SummaryApi.getUserBids.url}?mobile=${encodeURIComponent(mobile)}`,
          method: SummaryApi.getUserBids.method
        });

        if (res.data?.bids && Array.isArray(res.data.bids)) {
          const formatted = res.data.bids.map(b => {
            const createdAtDate = new Date(b.createdAt || Date.now());
            const dateStr = createdAtDate.toLocaleDateString('en-GB');
            const timeStr = createdAtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            let digitLabel = '';
            if (b.marketName === 'AVIATOR CASINO' || b.gameMode === 'Aviator' || b.type === 'Casino') {
              digitLabel = b.digit ? `Multiplier: ${b.digit}` : `Aviator Casino Bet`;
            } else if (b.digit) digitLabel = `${b.session || 'Open'} Digit: ${b.digit}`;
            else if (b.pana) digitLabel = `${b.session || 'Open'} Pana: ${b.pana}`;
            else if (b.jodi) digitLabel = `Jodi: ${b.jodi}`;
            else if (b.openPana && b.closePana) digitLabel = `Open Pana: ${b.openPana} | Close Pana: ${b.closePana}`;
            else if (b.openDigit && b.closePana) digitLabel = `Open Digit: ${b.openDigit} | Close Pana: ${b.closePana}`;
            else if (b.openPana && b.closeDigit) digitLabel = `Open Pana: ${b.openPana} | Close Digit: ${b.closeDigit}`;
            else digitLabel = `${b.session || 'Open'}`;

            const statusNorm = (b.status || 'Pending').toLowerCase();
            const points = Number(b.points) || 0;

            return {
              id: `#${String(b._id || b.id).slice(-8)}`,
              marketName: b.marketName || 'MAIN MARKET',
              date: dateStr,
              time: timeStr,
              createdAt: createdAtDate,
              bidAmount: String(points),
              potentialAmount: String(points * 9),
              gameType: b.gameMode || 'Main Market',
              digitLabel: digitLabel,
              session: b.session || 'Open',
              status: statusNorm === 'won' ? 'win' : (statusNorm === 'lost' ? 'loss' : 'pending')
            };
          });
          setBidsList(formatted);
        }
      } catch (err) {
        console.warn('Error loading user bids:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBids();
  }, []);

  // Theme-matched styling variables for bid cards
  const cardHeaderBg = isGreenTheme ? 'bg-[#ecfdf5]/60 border-b border-emerald-100/60' : 'bg-[#fff7ed]/60 border-b border-orange-100/60';
  const clockIconBg = isGreenTheme ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#ffedd5] text-[#ea580c]';
  const pendingBadgeClass = isGreenTheme ? 'bg-[#dcfce7] text-[#16a34a] border border-emerald-200/80' : 'bg-[#ffedd5] text-[#ea580c] border border-orange-200/80';
  const potentialBoxClass = isGreenTheme ? 'bg-[#ecfdf5]/50 border border-emerald-100/80' : 'bg-[#fff7ed]/50 border border-orange-100/80';
  const potentialTextClass = isGreenTheme ? 'text-[#16a34a]' : 'text-[#ea580c]';

  // Filtered bets
  const filteredBids = bidsList.filter((bid) => {
    // Status filter
    if (filterTab === 'wins' && bid.status !== 'win') return false;
    if (filterTab === 'losses' && bid.status !== 'loss') return false;
    if (filterTab === 'pending' && bid.status !== 'pending') return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesMarket = bid.marketName.toLowerCase().includes(q);
      const matchesType = bid.gameType.toLowerCase().includes(q);
      const matchesId = bid.id.toLowerCase().includes(q);
      return matchesMarket || matchesType || matchesId;
    }

    return true;
  });

  // Calculate totals dynamically
  const totalBets = bidsList.length;
  const totalWinnings = bidsList.filter(b => b.status === 'win').reduce((acc, curr) => acc + (Number(curr.potentialAmount) || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] select-none font-sans flex flex-col pb-28">
      {/* 1. TOP HEADER */}
      <div
        className="w-full text-white shadow-md rounded-b-[28px] transition-colors duration-300 shrink-0 mb-1 sticky top-0 z-30"
        style={{ backgroundColor: themeColor }}
      >
        <div className="px-4 pt-4 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
              title="Go Back"
            >
              <FaArrowLeft size={14} />
            </button>

            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
              My Bids
            </h1>
          </div>

          {/* Right Icon Button */}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/20 shadow-xs shrink-0">
            <IoGameControllerOutline size={18} />
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS (Screenshot 1) */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Total Winnings */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
              <FaWallet className="text-[#ea580c]" size={13} />
              <span className="text-xs font-semibold">Total Winnings</span>
            </div>
            <div className="text-2xl font-bold text-[#ea580c] tracking-tight">
              ₹{totalWinnings}
            </div>
          </div>

          {/* Card 2: Total Bets */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-gray-600">
              <IoGameControllerOutline className="text-[#ea580c]" size={15} />
              <span className="text-xs font-semibold">Total Bets</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {totalBets}
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATUS FILTER TABS */}
      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl p-1.5 shadow-2xs border border-gray-100 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            style={filterTab === 'all' ? { backgroundColor: themeColor } : undefined}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              filterTab === 'all'
                ? 'text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('wins')}
            style={filterTab === 'wins' ? { backgroundColor: themeColor } : undefined}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              filterTab === 'wins'
                ? 'text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Wins
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('losses')}
            style={filterTab === 'losses' ? { backgroundColor: themeColor } : undefined}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              filterTab === 'losses'
                ? 'text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Losses
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            style={filterTab === 'pending' ? { backgroundColor: themeColor } : undefined}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              filterTab === 'pending'
                ? 'text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* 4. SEARCH & FILTER SLIDER BAR */}
      <div className="px-4 pt-3 flex items-center gap-2">
        <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-gray-100 shadow-2xs flex items-center gap-2 flex-1">
          <IoSearchOutline size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full text-xs font-medium text-gray-800 placeholder-gray-400 bg-transparent outline-hidden"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          style={isFilterOpen ? { backgroundColor: themeColor, color: '#ffffff' } : undefined}
          className={`w-10 h-10 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
            isFilterOpen
              ? 'text-white shadow-xs'
              : 'bg-white text-[#ea580c] hover:bg-orange-50'
          }`}
          title="Filter options"
        >
          <HiOutlineAdjustmentsHorizontal size={18} />
        </button>
      </div>

      {/* 5. FILTER DRAWER / OPTIONS PANEL (Screenshots 1 & 2) */}
      {isFilterOpen && (
        <div className="px-4 pt-3">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-150 shadow-md shadow-black/5 space-y-3.5 transition-all">
            {/* Header: Title + Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiOutlineAdjustmentsHorizontal size={17} className="text-[#f95e07]" />
                <h3 className="font-bold text-xs sm:text-sm text-gray-900">
                  Filters
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                title="Close filters"
              >
                <IoClose size={18} />
              </button>
            </div>

            {/* Section 1: Date Range */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Date Range
              </label>

              <div className="grid grid-cols-4 gap-2">
                {/* All Time */}
                <button
                  type="button"
                  onClick={() => setDateRange('all')}
                  style={dateRange === 'all' ? { backgroundColor: themeColor } : undefined}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    dateRange === 'all'
                      ? 'text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>

                {/* Today */}
                <button
                  type="button"
                  onClick={() => setDateRange('today')}
                  style={dateRange === 'today' ? { backgroundColor: themeColor } : undefined}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    dateRange === 'today'
                      ? 'text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>

                {/* Yesterday */}
                <button
                  type="button"
                  onClick={() => setDateRange('yesterday')}
                  style={dateRange === 'yesterday' ? { backgroundColor: themeColor } : undefined}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    dateRange === 'yesterday'
                      ? 'text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Yesterday
                </button>

                {/* Custom */}
                <button
                  type="button"
                  onClick={() => setDateRange('custom')}
                  style={dateRange === 'custom' ? { backgroundColor: themeColor } : undefined}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    dateRange === 'custom'
                      ? 'text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Section 2: Custom Date Selector (When 'Custom' is selected -> Screenshot 2) */}
            {dateRange === 'custom' && (
              <div className="pt-1 transition-all">
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Select Date
                </label>

                <div
                  onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                  className="bg-white rounded-2xl px-3.5 py-3 border border-gray-200 shadow-2xs flex items-center gap-2.5 cursor-pointer hover:border-gray-300 transition-all relative"
                >
                  <FaCalendarAlt className="text-[#f95e07] shrink-0" size={14} />
                  <span className="text-xs font-semibold text-gray-800">
                    {formatDisplayDate(customDate)}
                  </span>

                  {/* Hidden date input for native picker */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                </div>
              </div>
            )}

            {/* Section 3: Sort Order */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Sort Order
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Newest First */}
                <button
                  type="button"
                  onClick={() => setSortOrder('newest')}
                  style={sortOrder === 'newest' ? { backgroundColor: themeColor } : undefined}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    sortOrder === 'newest'
                      ? 'text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Newest First
                </button>

                {/* Oldest First */}
                <button
                  type="button"
                  onClick={() => setSortOrder('oldest')}
                  style={sortOrder === 'oldest' ? { backgroundColor: themeColor } : undefined}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    sortOrder === 'oldest'
                      ? 'text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Oldest First
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. BIDS CARDS LIST OR EMPTY STATE */}
      <div className="px-4 pt-3.5 space-y-3.5">
        {filteredBids.length > 0 ? (
          filteredBids.map((bid, index) => {
            const isPending = bid.status === 'pending';
            const isWin = bid.status === 'win';
            const isLoss = bid.status === 'loss';

            return (
              <div
                key={bid.id || index}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden transition-all hover:shadow-xs"
              >
                {/* Top Header of Card (Theme-Matched Clean Light Tint) */}
                <div className={`${cardHeaderBg} px-3.5 py-2.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${clockIconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <IoTimeOutline size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-[13px] uppercase text-gray-900 tracking-wide leading-tight">
                        {bid.marketName}
                      </h3>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                        📅 {bid.date}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill Badge */}
                  <div>
                    {isPending && (
                      <span className={`font-bold text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wide ${pendingBadgeClass}`}>
                        PENDING
                      </span>
                    )}
                    {isWin && (
                      <span className="bg-[#dcfce7] text-[#16a34a] font-bold text-[10px] px-3 py-0.5 rounded-full border border-emerald-200/80 uppercase tracking-wide">
                        WIN
                      </span>
                    )}
                    {isLoss && (
                      <span className="bg-[#fee2e2] text-[#ef4444] font-bold text-[10px] px-3 py-0.5 rounded-full border border-red-200/80 uppercase tracking-wide">
                        LOSS
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2.5">
                  {/* Two Mini Boxes: BID and POTENTIAL */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Box 1: BID */}
                    <div className="bg-[#f8fafc] rounded-2xl p-3 border border-gray-100/60 shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">
                        BID
                      </span>
                      <span className="text-base font-bold text-gray-900 block mt-0.5">
                        ₹{bid.bidAmount}
                      </span>
                    </div>

                    {/* Box 2: POTENTIAL */}
                    <div className={`${potentialBoxClass} rounded-2xl p-3 shadow-2xs`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wide block ${potentialTextClass}`}>
                        POTENTIAL
                      </span>
                      <span className={`text-base font-bold block mt-0.5 ${potentialTextClass}`}>
                        ₹{bid.potentialAmount}
                      </span>
                    </div>
                  </div>

                  {/* Game Details Row */}
                  <div className="bg-[#f8fafc]/70 rounded-2xl p-3 border border-gray-100/60 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <IoGameControllerOutline size={14} className="text-[#ea580c]" />
                        <span>{bid.gameType}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="bg-white text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-150 shadow-2xs inline-block">
                          {bid.digitLabel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-150 shadow-2xs">
                        ○ {bid.session}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-3.5 py-2 bg-gray-50/60 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 font-medium">
                  <div className="flex items-center gap-1">
                    <IoTimeOutline size={12} />
                    <span>{bid.time}</span>
                  </div>
                  <span className="font-mono text-gray-400">{bid.id}</span>
                </div>
              </div>
            );
          })
        ) : (
          /* EMPTY STATE (Screenshot 2) */
          <div className="bg-white rounded-3xl p-10 border border-gray-150 shadow-xs flex flex-col items-center justify-center text-center my-4">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100 shadow-2xs">
              <IoSearchOutline size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 tracking-tight">
              No Bets Found
            </h3>
            <p className="text-xs text-gray-400 font-medium max-w-xs mt-1">
              We couldn't find any bets matching your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBids;
