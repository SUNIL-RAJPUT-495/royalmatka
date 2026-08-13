import React, { useState } from 'react';
import { 
  FaHistory, FaChartLine, FaFilter, FaRedo, 
  FaCalendarAlt, FaCaretDown, FaTrophy, FaTimesCircle, FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
  // Active Tab: 'bid_history' or 'sell_report'
  const [activeTab, setActiveTab] = useState('bid_history');

  // Filter States
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [sessionFilter, setSessionFilter] = useState('All Sessions'); // 'All Sessions', 'Open', 'Close'
  const [marketFilter, setMarketFilter] = useState('All Markets');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Dummy data for Bid History
  const dummyBids = [
    { id: 1, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 0', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 2, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 1', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 3, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 2', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 4, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 3', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 5, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 4', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 6, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 5', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 7, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 6', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 8, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 7', betAmount: 10, winPoints: 90, status: 'Win', date: '12 Aug, 03:49 pm' },
    { id: 9, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 8', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
    { id: 10, session: 'CLOSE', gameType: 'Single Ank', numbers: 'Close: 9', betAmount: 10, winPoints: '—', status: 'Loss', date: '12 Aug, 03:49 pm' },
  ];

  // Dummy Customer Sell Report Data
  const dummySellReports = [
    {
      marketName: 'MILAN DAY',
      totalBids: 10,
      openAmount: 0,
      openBids: 0,
      closeAmount: 100,
      closeBids: 10,
      totalAmount: 100,
      winAmount: 90
    },
    {
      marketName: 'ANDHRA DAY',
      totalBids: 0,
      openAmount: 0,
      openBids: 0,
      closeAmount: 0,
      closeBids: 0,
      totalAmount: 0,
      winAmount: 0
    }
  ];

  const handleRefresh = () => {
    toast.success('Reports updated successfully!');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800">
      
      {/* 1. Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-md">
            <FaHistory size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
              Reports & History
            </h1>
            <p className="text-xs text-gray-505 font-medium mt-1.5 uppercase tracking-wider">
              Bid history, win history and customer sell report
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all w-fit"
        >
          <FaRedo size={10} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* 2. Top Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-2xl w-fit shadow-3xs">
          <button
            onClick={() => setActiveTab('bid_history')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'bid_history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-655 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Bid History / Win History
          </button>
          <button
            onClick={() => setActiveTab('sell_report')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sell_report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-655 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Customer Sell Report
          </button>
        </div>

        {/* 3. Filters Section */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 border-b border-gray-100 pb-2.5">
            <FaFilter className="text-gray-400" size={11} />
            <span>Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
            </select>

            {/* Session Filter */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
            >
              <option value="All Sessions">All Sessions</option>
              <option value="Open">Open</option>
              <option value="Close">Close</option>
            </select>

            {/* Session Pill Selector Indicator */}
            <div className="flex items-center gap-1.5 border border-gray-300 rounded-xl p-1 bg-gray-50/50 shadow-3xs">
              <button
                type="button"
                onClick={() => setSessionFilter('Open')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  sessionFilter === 'Open'
                    ? 'bg-blue-600 text-white shadow-3xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${sessionFilter === 'Open' ? 'bg-white' : 'bg-blue-500'}`} />
                <span>Open</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionFilter('Close')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  sessionFilter === 'Close'
                    ? 'bg-orange-500 text-white shadow-3xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${sessionFilter === 'Close' ? 'bg-white' : 'bg-orange-500'}`} />
                <span>Close</span>
              </button>
            </div>

            {/* Markets Filter */}
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
            >
              <option value="All Markets">All Markets</option>
              <option value="MILAN DAY">Milan Day</option>
              <option value="ANDHRA DAY">Andhra Day</option>
            </select>

            {/* Status Filter (only shown in Bid History Mode) */}
            {activeTab === 'bid_history' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-3xs"
              >
                <option value="All Status">All Status</option>
                <option value="Win">Win Only</option>
                <option value="Loss">Loss Only</option>
              </select>
            )}
          </div>
        </div>

        {/* 4. Display Content Area */}
        {activeTab === 'bid_history' ? (
          /* ================== TAB A: BID HISTORY / WIN HISTORY ================== */
          <div className="space-y-6">
            
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Bids */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4.5 text-center shadow-3xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bids</span>
                <span className="text-xl font-bold text-indigo-650 mt-1 block">
                  {dummyBids.length}
                </span>
              </div>
              
              {/* Open Bids */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4.5 text-center shadow-3xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Open Bids</span>
                <span className="text-xl font-bold text-blue-600 mt-1 block">
                  {dummyBids.filter(b => b.session === 'OPEN').length}
                </span>
              </div>

              {/* Close Bids */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4.5 text-center shadow-3xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Close Bids</span>
                <span className="text-xl font-bold text-orange-500 mt-1 block">
                  {dummyBids.filter(b => b.session === 'CLOSE').length}
                </span>
              </div>

              {/* Total Amount */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4.5 text-center shadow-3xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Amount</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">
                  ₹{dummyBids.reduce((sum, b) => sum + b.betAmount, 0)}
                </span>
              </div>
            </div>

            {/* Milan Day Header with stats */}
            <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white">
              <div className="bg-[#1e293b] text-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <h4 className="font-bold text-sm tracking-wide">MILAN DAY</h4>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-gray-300">10 bids</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-emerald-450">Bet: ₹100</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-yellow-400 flex items-center gap-1">
                    <FaTrophy size={11} /> Win: ₹90
                  </span>
                </div>
              </div>

              {/* Milan Day Bids Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-medium text-gray-700">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Session</th>
                      <th className="py-3 px-4">Game Type</th>
                      <th className="py-3 px-4">Numbers</th>
                      <th className="py-3 px-4">Bet Amount</th>
                      <th className="py-3 px-4">Win Points</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 bg-white">
                    {dummyBids.map((bid, idx) => (
                      <tr key={bid.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md text-white ${
                            bid.session === 'CLOSE' ? 'bg-orange-500' : 'bg-blue-600'
                          }`}>
                            ⬇ {bid.session}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">{bid.gameType}</td>
                        <td className="py-3.5 px-4 text-gray-500 font-semibold">{bid.numbers}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-800">₹{bid.betAmount}</td>
                        <td className="py-3.5 px-4">
                          <span className={bid.winPoints !== '—' ? 'text-emerald-600 font-black' : 'text-gray-400'}>
                            {bid.winPoints !== '—' ? `₹${bid.winPoints}` : '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            bid.status === 'Win' 
                              ? 'bg-emerald-50 text-emerald-650 border-emerald-100'
                              : 'bg-red-50 text-red-500 border-red-100'
                          }`}>
                            {bid.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 font-semibold">{bid.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* ================== TAB B: CUSTOMER SELL REPORT ================== */
          <div className="space-y-6">
            
            {/* Grand Total Banner */}
            <div className="bg-[#4f46e5] text-white rounded-3xl p-5 md:p-6 shadow-md text-left space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-100">
                GRAND TOTAL — ALL MARKETS
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Session Open */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Session Open</span>
                  <span className="text-2xl font-black text-white mt-1 block">₹0</span>
                </div>

                {/* Session Close */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Session Close</span>
                  <span className="text-2xl font-black text-white mt-1 block">₹100</span>
                </div>

                {/* Total */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Total</span>
                  <span className="text-2xl font-black text-white mt-1 block">₹100</span>
                </div>
              </div>
            </div>

            {/* List of Sell Reports per Market */}
            <div className="space-y-4">
              {dummySellReports.map((report, idx) => (
                <div 
                  key={idx}
                  className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white"
                >
                  {/* Market Title row */}
                  <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
                    <span className="font-bold text-sm tracking-wide">{report.marketName}</span>
                    <span className="text-xs font-semibold text-gray-300">{report.totalBids} bids</span>
                  </div>

                  {/* Market Sell Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-150">
                    
                    {/* Session Open */}
                    <div className="p-5 flex flex-col justify-center bg-blue-50/20 text-left">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        SESSION OPEN
                      </span>
                      <span className="text-2xl font-black text-blue-600 mt-1 block">₹{report.openAmount}</span>
                      <span className="text-[10px] text-gray-400 font-semibold mt-1">{report.openBids} bids</span>
                    </div>

                    {/* Session Close */}
                    <div className="p-5 flex flex-col justify-center bg-orange-50/20 text-left">
                      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        SESSION CLOSE
                      </span>
                      <span className="text-2xl font-black text-orange-500 mt-1 block">₹{report.closeAmount}</span>
                      <span className="text-[10px] text-gray-400 font-semibold mt-1">{report.closeBids} bids</span>
                    </div>

                    {/* Open + Close Total */}
                    <div className="p-5 flex flex-col justify-center bg-gray-50/40 text-left">
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-750" />
                        OPEN + CLOSE TOTAL
                      </span>
                      <span className="text-2xl font-black text-gray-800 mt-1 block">₹{report.totalAmount}</span>
                      <div className="text-[10px] text-gray-450 font-semibold mt-1.5 flex items-center gap-3">
                        <span>Open: {report.totalAmount > 0 ? Math.round((report.openAmount / report.totalAmount) * 100) : 0}%</span>
                        <span>Close: {report.totalAmount > 0 ? Math.round((report.closeAmount / report.totalAmount) * 100) : 100}%</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;
