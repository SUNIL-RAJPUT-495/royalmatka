import React, { useState } from 'react';
import { 
  User, Gamepad, Hash, Search, Calendar, RefreshCw, Trophy, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WinnersHistory = () => {
  // Tab selector: 'All Bids' | 'Winners' | 'Losers'
  const [activeTab, setActiveTab] = useState('All Bids');

  // Filter States
  const [mechanicsFilter, setMechanicsFilter] = useState('All Mechanics');
  const [gameTypeFilter, setGameTypeFilter] = useState('All Game Types');
  const [jodiFilter, setJodiFilter] = useState('');
  const [panaFilter, setPanaFilter] = useState('All Panas');
  const [timePeriod, setTimePeriod] = useState('All Time'); // 'All Time', 'Today', 'Yesterday', 'Custom'
  const [customDate, setCustomDate] = useState('');

  // Dummy bids database matching Screenshot 2
  const [bids, setBids] = useState([
    { id: 1, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '0', isWinner: false, winAmount: 0 },
    { id: 2, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '1', isWinner: false, winAmount: 0 },
    { id: 3, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '2', isWinner: false, winAmount: 0 },
    { id: 4, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '3', isWinner: false, winAmount: 0 },
    { id: 5, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '4', isWinner: false, winAmount: 0 },
    { id: 6, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '5', isWinner: false, winAmount: 0 },
    { id: 7, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '6', isWinner: false, winAmount: 0 },
    { id: 8, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '7', isWinner: true, winAmount: 90 },
    { id: 9, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '8', isWinner: false, winAmount: 0 },
    { id: 10, userId: '8079003424', game: 'Single Ank', bidAmount: 10, mechanic: 'MILAN DAY', date: '8/12/2026', closeDigit: '9', isWinner: false, winAmount: 0 },
  ]);

  const filteredBids = bids.filter((bid) => {
    if (activeTab === 'Winners' && !bid.isWinner) return false;
    if (activeTab === 'Losers' && bid.isWinner) return false;
    if (mechanicsFilter !== 'All Mechanics' && bid.mechanic !== mechanicsFilter) return false;
    if (gameTypeFilter !== 'All Game Types' && bid.game !== gameTypeFilter) return false;
    if (jodiFilter && !bid.closeDigit.includes(jodiFilter)) return false;
    return true;
  });

  const totalBidsAmount = filteredBids.reduce((sum, b) => sum + b.bidAmount, 0);
  const totalWinAmount = filteredBids.reduce((sum, b) => sum + b.winAmount, 0);
  const netProfitLoss = totalWinAmount - totalBidsAmount;

  const handleResetFilters = () => {
    setMechanicsFilter('All Mechanics');
    setGameTypeFilter('All Game Types');
    setJodiFilter('');
    setPanaFilter('All Panas');
    setTimePeriod('All Time');
    setCustomDate('');
    toast.success('Filters reset');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 md:p-10 font-sans flex justify-center items-start text-left select-none text-gray-800">
      
      <div className="w-full max-w-5xl space-y-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-blue-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dices"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m22 8-4-4"/><rect width="12" height="12" x="10" y="2" rx="2" ry="2"/><path d="m2 14 4-4"/><path d="m14 2 4 4"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Game Results History</h1>
            <p className="text-gray-500 font-medium text-xs mt-1">View historical winners and losers with detailed filters</p>
          </div>
        </div>

        {/* 2. Filter Results Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Filter Results</span>
          </div>

          <div className="space-y-3.5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Mechanics */}
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400">
                  <User size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={mechanicsFilter}
                  onChange={(e) => setMechanicsFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Mechanics">All Mechanics</option>
                  <option value="MILAN DAY">MILAN DAY</option>
                </select>
                <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Game Types */}
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400">
                  <Gamepad size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={gameTypeFilter}
                  onChange={(e) => setGameTypeFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Game Types">All Game Types</option>
                  <option value="Single Ank">Single Ank</option>
                  <option value="Jodi">Jodi</option>
                </select>
                <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Jodi Filter */}
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400">
                  <Hash size={13} className="stroke-[2.5]" />
                </span>
                <input
                  type="text"
                  placeholder="Filter by Jodi"
                  value={jodiFilter}
                  onChange={(e) => setJodiFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                />
              </div>

              {/* Panas */}
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400">
                  <Search size={13} className="stroke-[2.5]" />
                </span>
                <select
                  value={panaFilter}
                  onChange={(e) => setPanaFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold cursor-pointer outline-none appearance-none"
                >
                  <option value="All Panas">All Panas</option>
                </select>
                <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* All Time */}
              <button
                type="button"
                onClick={() => setTimePeriod('All Time')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                  timePeriod === 'All Time'
                    ? 'bg-[#2563eb] text-white border-transparent shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>All Time</span>
              </button>

              {/* Today */}
              <button
                type="button"
                onClick={() => setTimePeriod('Today')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                  timePeriod === 'Today'
                    ? 'bg-[#2563eb] text-white border-transparent shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Today</span>
              </button>

              {/* Yesterday */}
              <button
                type="button"
                onClick={() => setTimePeriod('Yesterday')}
                className={`text-xs font-semibold px-4 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                  timePeriod === 'Yesterday'
                    ? 'bg-[#2563eb] text-white border-transparent shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar size={13} className="stroke-[2.5]" />
                <span>Yesterday</span>
              </button>

              {/* Custom Date Input */}
              <div className="relative">
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
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none cursor-pointer"
                />
              </div>

              {/* Reset Filters */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer border border-gray-200"
              >
                Reset Filters
              </button>
            </div>

          </div>
        </div>

        {/* 3. Tab Switches (Centered) */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-200 shadow-2xs">
            {['All Bids', 'Winners', 'Losers'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold px-5 py-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gray-100 text-gray-800'
                      : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Summary Box */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 12h18"/><path d="M9 3v18"/></svg>
            <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">Summary for Selected Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Bids */}
            <div className="bg-[#eff6ff] border border-[#dbeafe] p-5 rounded-2xl text-center shadow-3xs flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Total Bids Amount</span>
              <span className="text-2xl font-bold text-[#1d4ed8] mt-1.5 block">₹{totalBidsAmount.toFixed(2)}</span>
            </div>

            {/* Total Win */}
            <div className="bg-[#f0fdf4] border border-[#dcfce7] p-5 rounded-2xl text-center shadow-3xs flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block">Total Win Amount</span>
              <span className="text-2xl font-bold text-[#15803d] mt-1.5 block">₹{totalWinAmount.toFixed(2)}</span>
            </div>

            {/* Net Profit/Loss */}
            <div className={`p-5 rounded-2xl text-center shadow-3xs border flex flex-col items-center justify-center ${
              netProfitLoss >= 0
                ? 'bg-[#f0fdf4] border-[#dcfce7] text-[#15803d]'
                : 'bg-[#fef2f2] border-[#fee2e2] text-[#b91c1c]'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Net Profit/Loss</span>
              <span className="text-2xl font-bold mt-1.5 block">
                {netProfitLoss >= 0 ? '+' : ''}₹{netProfitLoss.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 5. User Bid List Grid (Perfect Match) */}
        <div className="space-y-4">
          {filteredBids.length > 0 ? (
            filteredBids.map((bid) => (
              <div 
                key={bid.id} 
                className="bg-white border border-gray-200 border-l-[4px] border-l-blue-500 rounded-2xl p-5 shadow-2xs relative space-y-4"
              >
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">User</span>
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full border ${
                    bid.isWinner
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-red-50 text-red-500 border-red-200'
                  }`}>
                    {bid.isWinner ? 'Winner' : 'Loser'}
                  </span>
                </div>

                {/* Details layout columns */}
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  {/* Left Col */}
                  <div className="space-y-2 font-semibold">
                    <div className="text-gray-400">User ID: <span className="text-gray-850 font-bold ml-1">{bid.userId}</span></div>
                    <div className="text-gray-400">Bid: <span className="text-gray-850 font-bold ml-1">₹{bid.bidAmount}</span></div>
                    <div className="text-gray-400">Date: <span className="text-gray-850 font-bold ml-1">{bid.date}</span></div>
                  </div>

                  {/* Right Col */}
                  <div className="space-y-2 font-semibold">
                    <div className="text-gray-400">Game: <span className="text-gray-850 font-bold ml-1">{bid.game}</span></div>
                    <div className="text-gray-400">Mechanic: <span className="text-gray-850 font-bold ml-1">{bid.mechanic}</span></div>
                  </div>
                </div>

                {/* Inner gray container */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-center justify-between text-[11px] font-semibold text-gray-500">
                  <span>Game Details</span>
                  <div>
                    <span className="text-gray-400 font-medium">Close Digit:</span>
                    <span className="text-gray-850 font-bold ml-1.5">{bid.closeDigit}</span>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-gray-400">No results found for selected filters.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default WinnersHistory;
