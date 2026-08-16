import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaHistory, FaFilter, FaRedo, 
  FaCalendarAlt, FaTrophy, FaTimesCircle, FaCheckCircle,
  FaPhoneAlt, FaSearch, FaUser, FaMoneyBillWave
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const ReportsPage = () => {
  // Active Tab: 'bid_history' or 'sell_report'
  const [activeTab, setActiveTab] = useState('bid_history');

  // Filter States
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [sessionFilter, setSessionFilter] = useState('All Sessions'); // 'All Sessions', 'Open', 'Close'
  const [marketFilter, setMarketFilter] = useState('All Markets');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [bids, setBids] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Bids & Markets from API
  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Bids
      const bidsRes = await AxiosAdmin({
        url: SummaryApi.getAllBids.url,
        method: SummaryApi.getAllBids.method
      });

      if (bidsRes?.data?.success && Array.isArray(bidsRes.data.bids || bidsRes.data.data)) {
        setBids(bidsRes.data.bids || bidsRes.data.data);
      } else if (Array.isArray(bidsRes?.data)) {
        setBids(bidsRes.data);
      } else {
        setBids([]);
      }

      // 2. Fetch Markets
      const marketsRes = await AxiosAdmin({
        url: SummaryApi.getGame.url,
        method: SummaryApi.getGame.method
      });

      if (marketsRes?.data?.success && Array.isArray(marketsRes.data.markets || marketsRes.data.data)) {
        setMarkets(marketsRes.data.markets || marketsRes.data.data);
      } else if (Array.isArray(marketsRes?.data)) {
        setMarkets(marketsRes.data);
      } else {
        setMarkets([]);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load reports from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleRefresh = () => {
    fetchReportData();
    toast.success('Reports updated successfully!');
  };

  // Extract unique market names from markets API + bids
  const availableMarkets = useMemo(() => {
    const set = new Set();
    markets.forEach(m => {
      if (m.name || m.marketName) set.add((m.name || m.marketName).toUpperCase());
    });
    bids.forEach(b => {
      if (b.marketName) set.add(b.marketName.toUpperCase());
    });
    return Array.from(set).sort();
  }, [markets, bids]);

  // Helper date checker
  const isDateInFilter = (dateObj, filter) => {
    if (filter === 'All Time') return true;
    if (!dateObj) return false;

    const bidDate = new Date(dateObj);
    const today = new Date();

    if (filter === 'Today') {
      return bidDate.toDateString() === today.toDateString();
    }

    if (filter === 'Yesterday') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      return bidDate.toDateString() === yesterday.toDateString();
    }

    if (filter === 'This Week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return bidDate >= sevenDaysAgo;
    }

    return true;
  };

  // Filtered Bids list
  const filteredBids = useMemo(() => {
    return bids.filter(bid => {
      // 1. Time Filter
      const matchTime = isDateInFilter(bid.createdAt || bid.bidDate, timeFilter);

      // 2. Session Filter
      const bidSession = (bid.session || '').toUpperCase();
      const matchSession =
        sessionFilter === 'All Sessions' ||
        (sessionFilter === 'Open' && (bidSession === 'OPEN' || bidSession === 'MAIN')) ||
        (sessionFilter === 'Close' && bidSession === 'CLOSE');

      // 3. Market Filter
      const matchMarket =
        marketFilter === 'All Markets' ||
        (bid.marketName && bid.marketName.toUpperCase() === marketFilter.toUpperCase());

      // 4. Status Filter
      const bidStatus = (bid.status || '').toLowerCase();
      const matchStatus =
        statusFilter === 'All Status' ||
        (statusFilter === 'Win' && (bidStatus === 'won' || bidStatus === 'win')) ||
        (statusFilter === 'Loss' && (bidStatus === 'lost' || bidStatus === 'loss')) ||
        (statusFilter === 'Pending' && bidStatus === 'pending');

      // 5. Search Term (Name or Mobile)
      const s = searchTerm.toLowerCase().trim();
      const matchSearch =
        s === '' ||
        (bid.userName && bid.userName.toLowerCase().includes(s)) ||
        (bid.userMobile && bid.userMobile.includes(s)) ||
        (bid.digit && bid.digit.includes(s)) ||
        (bid.pana && bid.pana.includes(s)) ||
        (bid.jodi && bid.jodi.includes(s));

      return matchTime && matchSession && matchMarket && matchStatus && matchSearch;
    });
  }, [bids, timeFilter, sessionFilter, marketFilter, statusFilter, searchTerm]);

  // Group Bids by Market
  const groupedBidsByMarket = useMemo(() => {
    const map = new Map();
    filteredBids.forEach(bid => {
      const mName = (bid.marketName || 'UNKNOWN MARKET').toUpperCase();
      if (!map.has(mName)) {
        map.set(mName, []);
      }
      map.get(mName).push(bid);
    });
    return map;
  }, [filteredBids]);

  // Customer Sell Report Aggregation (Per Market)
  const sellReportsData = useMemo(() => {
    const marketMap = new Map();

    // Initialize with all known markets
    availableMarkets.forEach(mName => {
      marketMap.set(mName, {
        marketName: mName,
        totalBids: 0,
        openAmount: 0,
        openBids: 0,
        closeAmount: 0,
        closeBids: 0,
        totalAmount: 0,
        winAmount: 0
      });
    });

    // Process bids according to active filters (Time, Session, Market)
    bids.forEach(bid => {
      const mName = (bid.marketName || 'OTHER MARKET').toUpperCase();

      // Check time filter
      if (!isDateInFilter(bid.createdAt || bid.bidDate, timeFilter)) return;
      if (marketFilter !== 'All Markets' && mName !== marketFilter.toUpperCase()) return;

      if (!marketMap.has(mName)) {
        marketMap.set(mName, {
          marketName: mName,
          totalBids: 0,
          openAmount: 0,
          openBids: 0,
          closeAmount: 0,
          closeBids: 0,
          totalAmount: 0,
          winAmount: 0
        });
      }

      const report = marketMap.get(mName);
      const points = Number(bid.points || bid.betAmount || 0);
      const winPoints = Number(bid.winAmount || 0);
      const session = (bid.session || '').toUpperCase();

      report.totalBids += 1;
      report.totalAmount += points;
      report.winAmount += winPoints;

      if (session === 'OPEN' || session === 'MAIN') {
        report.openAmount += points;
        report.openBids += 1;
      } else if (session === 'CLOSE') {
        report.closeAmount += points;
        report.closeBids += 1;
      } else {
        // Fallback for default open if unassigned
        report.openAmount += points;
        report.openBids += 1;
      }
    });

    return Array.from(marketMap.values()).filter(
      item => marketFilter === 'All Markets' || item.marketName === marketFilter.toUpperCase()
    );
  }, [bids, availableMarkets, timeFilter, marketFilter]);

  // Grand Totals for Customer Sell Report
  const grandTotals = useMemo(() => {
    let openAmt = 0;
    let closeAmt = 0;
    let totalAmt = 0;
    let winAmt = 0;

    sellReportsData.forEach(r => {
      openAmt += r.openAmount;
      closeAmt += r.closeAmount;
      totalAmt += r.totalAmount;
      winAmt += r.winAmount;
    });

    return { openAmt, closeAmt, totalAmt, winAmt };
  }, [sellReportsData]);

  // Total metrics for Bid History tab
  const totalBidsCount = filteredBids.length;
  const openBidsCount = filteredBids.filter(b => (b.session || '').toUpperCase() === 'OPEN').length;
  const closeBidsCount = filteredBids.filter(b => (b.session || '').toUpperCase() === 'CLOSE').length;
  const totalBetAmount = filteredBids.reduce((sum, b) => sum + Number(b.points || b.betAmount || 0), 0);
  const totalWinAmount = filteredBids.reduce((sum, b) => sum + Number(b.winAmount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800 text-left">
      
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
            <p className="text-xs text-gray-500 font-medium mt-1.5 uppercase tracking-wider">
              Bid history, win history and customer sell report
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all w-fit"
        >
          <FaRedo size={10} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* 2. Top Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-200 rounded-2xl w-fit shadow-2xs">
          <button
            onClick={() => setActiveTab('bid_history')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'bid_history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Bid History / Win History
          </button>
          <button
            onClick={() => setActiveTab('sell_report')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'sell_report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Customer Sell Report
          </button>
        </div>

        {/* 3. Filters Section */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <FaFilter className="text-gray-400" size={11} />
              <span>Filters</span>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">
              Showing {filteredBids.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="Search user name, mobile or digit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={11} />
            </div>

            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
            </select>

            {/* Markets Filter */}
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs max-w-[180px] truncate"
            >
              <option value="All Markets">All Markets</option>
              {availableMarkets.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Session Filter */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="All Sessions">All Sessions</option>
              <option value="Open">Open</option>
              <option value="Close">Close</option>
            </select>

            {/* Session Pill Selector Indicator */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-xl p-0.5 bg-gray-50/50 shadow-2xs">
              <button
                type="button"
                onClick={() => setSessionFilter('Open')}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  sessionFilter === 'Open'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sessionFilter === 'Open' ? 'bg-white' : 'bg-blue-500'}`} />
                <span>Open</span>
              </button>

              <button
                type="button"
                onClick={() => setSessionFilter('Close')}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                  sessionFilter === 'Close'
                    ? 'bg-orange-500 text-white shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sessionFilter === 'Close' ? 'bg-white' : 'bg-orange-500'}`} />
                <span>Close</span>
              </button>
            </div>

            {/* Status Filter (only shown in Bid History Mode) */}
            {activeTab === 'bid_history' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All Status">All Status</option>
                <option value="Win">Won Only</option>
                <option value="Loss">Loss Only</option>
                <option value="Pending">Pending Only</option>
              </select>
            )}
          </div>
        </div>

        {/* 4. Display Content Area */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center min-h-[220px]">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-semibold text-gray-400">Loading reports & bid history...</span>
          </div>
        ) : activeTab === 'bid_history' ? (
          /* ================== TAB A: BID HISTORY / WIN HISTORY ================== */
          <div className="space-y-6">
            
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              {/* Total Bids */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bids</span>
                <span className="text-xl font-bold text-indigo-600 mt-1 block">
                  {totalBidsCount}
                </span>
              </div>
              
              {/* Open Bids */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Open Bids</span>
                <span className="text-xl font-bold text-blue-600 mt-1 block">
                  {openBidsCount}
                </span>
              </div>

              {/* Close Bids */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Close Bids</span>
                <span className="text-xl font-bold text-orange-500 mt-1 block">
                  {closeBidsCount}
                </span>
              </div>

              {/* Total Amount */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bet Amount</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">
                  ₹{totalBetAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Total Win Amount */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-2xs col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Win Paid</span>
                <span className="text-xl font-bold text-amber-500 mt-1 block">
                  ₹{totalWinAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Render grouped bids per market */}
            {groupedBidsByMarket.size === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center min-h-[180px]">
                <span className="text-xs font-semibold text-gray-400">
                  Koi bid data nahi mila selected filters ke liye.
                </span>
              </div>
            ) : (
              Array.from(groupedBidsByMarket.entries()).map(([marketName, marketBids]) => {
                const mTotalBet = marketBids.reduce((sum, b) => sum + Number(b.points || b.betAmount || 0), 0);
                const mTotalWin = marketBids.reduce((sum, b) => sum + Number(b.winAmount || 0), 0);

                return (
                  <div key={marketName} className="border border-gray-200 rounded-3xl overflow-hidden shadow-2xs bg-white">
                    {/* Market Header with Stats */}
                    <div className="bg-[#1e293b] text-white px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <h4 className="font-bold text-sm tracking-wide flex items-center gap-2">
                        <span>{marketName}</span>
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
                        <span className="text-gray-300">{marketBids.length} bids</span>
                        <span className="text-gray-500">|</span>
                        <span className="text-emerald-400 font-bold">Bet: ₹{mTotalBet.toLocaleString('en-IN')}</span>
                        <span className="text-gray-500">|</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <FaTrophy size={11} /> Win: ₹{mTotalWin.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Bids Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs font-medium text-gray-700">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-3 px-4 w-12">#</th>
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Session</th>
                            <th className="py-3 px-4">Game Type</th>
                            <th className="py-3 px-4">Numbers / Digit</th>
                            <th className="py-3 px-4">Bet Amount</th>
                            <th className="py-3 px-4">Win Points</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date & Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 bg-white">
                          {marketBids.map((bid, idx) => {
                            const dateStr = bid.createdAt
                              ? new Date(bid.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : (bid.bidDate || 'N/A');

                            const points = Number(bid.points || bid.betAmount || 0);
                            const winPts = Number(bid.winAmount || 0);
                            const isWin = (bid.status || '').toLowerCase() === 'won' || (bid.status || '').toLowerCase() === 'win';
                            const isLoss = (bid.status || '').toLowerCase() === 'lost' || (bid.status || '').toLowerCase() === 'loss';
                            const numDisplay = bid.digit || bid.pana || bid.jodi || (bid.openPana ? `Open: ${bid.openPana}` : '') || (bid.closePana ? `Close: ${bid.closePana}` : '') || '—';

                            return (
                              <tr key={bid._id || idx} className="hover:bg-gray-50/70 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-gray-400">{idx + 1}</td>
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-gray-900">{bid.userName || 'User'}</div>
                                  <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                    <FaPhoneAlt size={8} /> {bid.userMobile || 'N/A'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md text-white ${
                                    (bid.session || '').toUpperCase() === 'CLOSE' ? 'bg-orange-500' : 'bg-blue-600'
                                  }`}>
                                    {(bid.session || 'OPEN').toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-gray-800">
                                  {bid.gameMode || bid.type || 'Single Ank'}
                                </td>
                                <td className="py-3.5 px-4 text-gray-800 font-bold font-mono">
                                  {numDisplay}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-emerald-700">
                                  ₹{points}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={isWin ? 'text-amber-600 font-black' : 'text-gray-400'}>
                                    {isWin ? `₹${winPts}` : '—'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    isWin 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                      : isLoss
                                      ? 'bg-red-50 text-red-500 border-red-200'
                                      : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}>
                                    {isWin ? 'Win' : isLoss ? 'Loss' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-gray-400 font-medium whitespace-nowrap">{dateStr}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        ) : (
          /* ================== TAB B: CUSTOMER SELL REPORT ================== */
          <div className="space-y-6">
            
            {/* Grand Total Banner */}
            <div className="bg-[#4f46e5] text-white rounded-3xl p-5 md:p-6 shadow-md text-left space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-100">
                  GRAND TOTAL — ALL MARKETS
                </h4>
                <span className="text-xs font-semibold text-indigo-200">
                  {sellReportsData.length} Markets
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
                {/* Session Open */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Session Open</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    ₹{grandTotals.openAmt.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Session Close */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Session Close</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    ₹{grandTotals.closeAmt.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Total Bids Volume</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    ₹{grandTotals.totalAmt.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Win Amount */}
                <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 shadow-2xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Total Win Paid</span>
                  <span className="text-2xl font-black text-amber-300 mt-1 block">
                    ₹{grandTotals.winAmt.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* List of Sell Reports per Market */}
            {sellReportsData.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center min-h-[180px]">
                <span className="text-xs font-semibold text-gray-400">
                  No market sell data available.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {sellReportsData.map((report, idx) => {
                  const openPct = report.totalAmount > 0 ? Math.round((report.openAmount / report.totalAmount) * 100) : 0;
                  const closePct = report.totalAmount > 0 ? Math.round((report.closeAmount / report.totalAmount) * 100) : 0;

                  return (
                    <div 
                      key={report.marketName || idx}
                      className="border border-gray-200 rounded-3xl overflow-hidden shadow-2xs bg-white"
                    >
                      {/* Market Title row */}
                      <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
                        <span className="font-bold text-sm tracking-wide">{report.marketName}</span>
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-300">
                          <span>{report.totalBids} bids</span>
                          <span>|</span>
                          <span className="text-amber-400 font-bold">Win: ₹{report.winAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Market Sell Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-150">
                        
                        {/* Session Open */}
                        <div className="p-5 flex flex-col justify-center bg-blue-50/20 text-left">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            SESSION OPEN
                          </span>
                          <span className="text-2xl font-black text-blue-600 mt-1 block">
                            ₹{report.openAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-1">{report.openBids} bids</span>
                        </div>

                        {/* Session Close */}
                        <div className="p-5 flex flex-col justify-center bg-orange-50/20 text-left">
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            SESSION CLOSE
                          </span>
                          <span className="text-2xl font-black text-orange-500 mt-1 block">
                            ₹{report.closeAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-1">{report.closeBids} bids</span>
                        </div>

                        {/* Open + Close Total */}
                        <div className="p-5 flex flex-col justify-center bg-gray-50/40 text-left">
                          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                            OPEN + CLOSE TOTAL
                          </span>
                          <span className="text-2xl font-black text-gray-800 mt-1 block">
                            ₹{report.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <div className="text-[10px] text-gray-500 font-semibold mt-1.5 flex items-center gap-3">
                            <span>Open: {openPct}%</span>
                            <span>Close: {closePct}%</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;
