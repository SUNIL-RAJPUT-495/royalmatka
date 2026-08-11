import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  History,
  Calendar,
  Gamepad2,
  Phone,
  Skull,
  Eye,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  Edit3,
  X,
  Check,
  AlertTriangle,
  XCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { fetchGame } from '../../utils/api';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';

export const MatkaResults = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('All Results'); // 'All Results' | 'Calculate Results' | 'Winners' | 'Losers' | 'History'
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form & Filter states
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [openPana, setOpenPana] = useState('');
  const [closePana, setClosePana] = useState('');

  // Data states for individual game tabs
  const [winners, setWinners] = useState([]);
  const [losers, setLosers] = useState([]);
  const [history, setHistory] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);

  // Quick Declare Modal state (from table action)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGame, setModalGame] = useState(null);
  const [modalSession, setModalSession] = useState('Open');
  const [modalOpenPana, setModalOpenPana] = useState('');
  const [modalClosePana, setModalClosePana] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto calculate sum digit (e.g. 128 -> 1+2+8 = 11 -> 1)
  const calculateDigit = (pana) => {
    if (!pana || pana.length !== 3) return '';
    const sum = pana.split('').reduce((acc, digit) => acc + parseInt(digit || 0, 10), 0);
    return String(sum % 10);
  };

  const openDigit = useMemo(() => calculateDigit(openPana), [openPana]);
  const closeDigit = useMemo(() => calculateDigit(closePana), [closePana]);
  const modalOpenDigit = useMemo(() => calculateDigit(modalOpenPana), [modalOpenPana]);
  const modalCloseDigit = useMemo(() => calculateDigit(modalClosePana), [modalClosePana]);

  const tabs = [
    { id: 'All Results', label: 'All Markets Result', icon: Layers },
    { id: 'Calculate Results', label: 'Calculate & Declare', icon: Sparkles },
    { id: 'Winners', label: 'Winners', icon: Trophy },
    { id: 'Losers', label: 'Losers', icon: Skull },
    { id: 'History', label: 'History Archive', icon: History }
  ];

  // 1. Fetch Games List
  const loadGames = async () => {
    setLoading(true);
    try {
      const gameData = await fetchGame();
      if (gameData && Array.isArray(gameData)) {
        setGames(gameData);
        if (!selectedGame && gameData.length > 0) {
          setSelectedGame(gameData[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  // 2. Fetch specific tab data
  const fetchData = async () => {
    if (!selectedGame || !selectedDate) return;
    if (activeTab === 'All Results') return;

    setLoading(true);
    try {
      let endpoint = null;
      let params = { market_id: selectedGame, date: selectedDate };

      if (activeTab === 'Winners') {
        endpoint = SummaryApi.getFilteredBids;
        params.status = 'Winner';
      } else if (activeTab === 'Losers') {
        endpoint = SummaryApi.getFilteredBids;
        params.status = 'Loser';
      } else if (activeTab === 'Calculate Results') {
        endpoint = SummaryApi.getFilteredBids;
        params.status = 'Pending';
      } else if (activeTab === 'History') {
        endpoint = SummaryApi.getMarketResults;
      }

      if (endpoint) {
        const res = await AxiosAdmin({
          url: endpoint.url,
          method: endpoint.method,
          params: params
        });

        const data = res.data.data || res.data.bids || res.data.results || [];
        if (activeTab === 'Winners') setWinners(data);
        else if (activeTab === 'Losers') setLosers(data);
        else if (activeTab === 'History') setHistory(data);
        else if (activeTab === 'Calculate Results') setPendingBids(data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}:`, error);
      toast.error(`Failed to load ${activeTab} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'All Results') {
      fetchData();
    }
  }, [selectedGame, selectedDate, activeTab]);

  // 3. Declare Result from Calculate Form
  const handleResult = async () => {
    if (!selectedGame || (!openPana && !closePana)) {
      toast.error('Please enter at least Open Pana or Close Pana.');
      return;
    }
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.declareResult.url,
        method: SummaryApi.declareResult.method,
        data: {
          market_id: selectedGame,
          date: selectedDate,
          open_panna: openPana,
          close_panna: closePana
        }
      });
      toast.success(res.data.message || 'Result generated successfully!');
      setOpenPana('');
      setClosePana('');
      loadGames();
      fetchData();
    } catch (error) {
      console.error('Failed to declare result:', error);
      toast.error(error?.response?.data?.message || 'Failed to declare result!');
    } finally {
      setLoading(false);
    }
  };

  // 4. Quick Modal Declare
  const handleOpenModal = (game, session = 'Open') => {
    setModalGame(game);
    setModalSession(session);
    setModalOpenPana(game.open_result_pana || game.open_pana || '');
    setModalClosePana(game.close_result_pana || game.close_pana || '');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalGame) return;

    if (modalSession === 'Open' && modalOpenPana.length !== 3) {
      toast.error('Please enter a 3-digit Open Pana (e.g. 128)');
      return;
    }
    if (modalSession === 'Close' && modalClosePana.length !== 3) {
      toast.error('Please enter a 3-digit Close Pana (e.g. 347)');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.declareResult.url,
        method: SummaryApi.declareResult.method,
        data: {
          market_id: modalGame._id,
          date: selectedDate,
          open_panna: modalOpenPana,
          close_panna: modalClosePana,
          session: modalSession
        }
      });

      toast.success(res?.data?.message || 'Result declared successfully!');
      setModalOpen(false);
      loadGames();
    } catch (error) {
      console.error('Modal declare error:', error);
      toast.error(error?.response?.data?.message || 'Failed to declare result!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadHistoryResult = (item) => {
    setOpenPana(item.open_panna || '');
    setClosePana(item.close_panna || '');
    setActiveTab('Calculate Results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PAYOUT_RATES = {
    Single: 10,
    SingleBulk: 10,
    Jodi: 100,
    JodiBulk: 100,
    'Single Panna': 160,
    SinglePannaBulk: 160,
    'Double Panna': 320,
    DoublePannaBulk: 320,
    'Triple Panna': 700,
    FullSangam: 10000,
    HalfSangamA: 1000,
    HalfSangamB: 1000,
    SP: 10,
    DP: 100,
    TP: 700,
    TwoDigitPana: 100,
    SPMotor: 160,
    DPMotor: 320,
    RedJodi: 100,
    OddEven: 2,
    SPCOMMON: 10,
    DPCOMMON: 100,
    'Cycle Pana': 160,
    CyclePana: 160,
    'Family Panel': 100,
    FamilyPanel: 100
  };

  const getWonAmount = (bid) => {
    const savedWon = Number(bid?.wonAmount ?? bid?.won_amount ?? 0);
    if (savedWon > 0) return savedWon;
    if (bid?.status !== 'Winner') return 0;
    const rate = PAYOUT_RATES[bid?.game_type] || 0;
    return Number(bid?.amount || 0) * rate;
  };

  // Filtered games for All Results tab
  const filteredGames = useMemo(() => {
    return games.filter((g) => (g.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [games, searchTerm]);

  // Declared count
  const declaredCount = games.filter((g) => g.open_result || g.open_pana || g.close_result).length;

  return (
    <div className="min-h-screen bg-gray-50/70 font-sans p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* TOP HEADER - Royal Purple Tara777 Theme */}
        <div className="bg-gradient-to-r from-[#1b0826] via-[#2c0d3d] to-[#42125c] text-white p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-amber-400/20 p-2.5 rounded-2xl border border-amber-400/30 text-amber-300 backdrop-blur-md">
                  <Trophy className="w-7 h-7" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                  Matka Result Page
                </h1>
              </div>
              <p className="text-purple-200 text-xs md:text-sm font-medium tracking-wide ml-12">
                REAL-TIME MARKET RESULTS, DECLARATION & WINNERS/LOSERS MANAGEMENT
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadGames();
                  if (activeTab !== 'All Results') fetchData();
                }}
                disabled={loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Sync Data'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Total Games</span>
              <div className="text-xl font-black text-white mt-0.5">{games.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Results Declared</span>
              <div className="text-xl font-black text-emerald-300 mt-0.5">{declaredCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Pending Results</span>
              <div className="text-xl font-black text-amber-300 mt-0.5">{Math.max(0, games.length - declaredCount)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Active Markets</span>
              <div className="text-xl font-black text-blue-300 mt-0.5">{games.filter((g) => g.status === 'Active').length}</div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="px-4 md:px-8 pt-4 border-b border-gray-200 flex items-center gap-2 md:gap-6 overflow-x-auto no-scrollbar bg-gray-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 md:px-4 text-xs md:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer rounded-t-xl
                  ${
                    isActive
                      ? 'text-[#380e4b] bg-white border-t border-x border-gray-200 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                <Icon className={`w-4 h-4 ${tab.id === 'Winners' ? 'text-amber-500' : tab.id === 'Losers' ? 'text-red-500' : ''}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#380e4b]"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* BODY CONTAINER */}
        <div className="p-4 md:p-8">
          {showError && (
            <div className="bg-rose-50 border-l-[4px] border-rose-500 rounded-xl p-4 mb-6 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-800 text-sm">Connection Error</h4>
                <p className="text-rose-600 text-xs">Failed to load games from backend. Please verify your connection.</p>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TAB 1: ALL MARKETS RESULT (DEFAULT TARA777 MATKA RESULT PAGE) */}
          {/* ========================================================== */}
          {activeTab === 'All Results' && (
            <div>
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="relative flex-1 max-w-md flex items-center border border-gray-200 rounded-xl px-3.5 py-2 bg-white focus-within:border-[#380e4b]">
                  <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search game / market name..."
                    className="bg-transparent w-full outline-none text-gray-700 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-gray-700 text-xs md:text-sm font-semibold outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Table of All Games */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-[#2a0c38] text-white text-xs uppercase tracking-wider font-bold">
                        <th className="p-4">Game / Market</th>
                        <th className="p-4 text-center">Open Time</th>
                        <th className="p-4 text-center">Close Time</th>
                        <th className="p-4 text-center">Open Result</th>
                        <th className="p-4 text-center">Jodi</th>
                        <th className="p-4 text-center">Close Result</th>
                        <th className="p-4 text-center">Full Result</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center py-12 text-gray-400">
                            <RefreshCw className="w-8 h-8 text-[#380e4b] animate-spin mx-auto mb-2" />
                            Loading Matka Results...
                          </td>
                        </tr>
                      ) : filteredGames.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                            No games found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredGames.map((game, idx) => {
                          const oPana = game.open_result_pana || game.open_pana || '***';
                          const cPana = game.close_result_pana || game.close_pana || '***';
                          const oDigit = game.open_digit || (oPana !== '***' ? calculateDigit(oPana) : '*');
                          const cDigit = game.close_digit || (cPana !== '***' ? calculateDigit(cPana) : '*');
                          const jodi = `${oDigit}${cDigit}`;
                          const isDeclared = oPana !== '***' || cPana !== '***';

                          return (
                            <tr key={game._id || idx} className="hover:bg-purple-50/40 transition-colors">
                              {/* Game Name */}
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                                  <span className="font-extrabold text-gray-900 uppercase">{game.name}</span>
                                </div>
                                <div className="text-[11px] text-gray-400 mt-0.5 ml-6">
                                  Status: <span className={game.status === 'Active' ? 'text-green-600 font-bold' : 'text-gray-500'}>{game.status || 'Active'}</span>
                                </div>
                              </td>

                              {/* Timings */}
                              <td className="p-4 text-center font-medium text-gray-700">
                                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100">
                                  {game.open_time || 'N/A'}
                                </span>
                              </td>
                              <td className="p-4 text-center font-medium text-gray-700">
                                <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100">
                                  {game.close_time || 'N/A'}
                                </span>
                              </td>

                              {/* Open Result */}
                              <td className="p-4 text-center font-mono font-bold text-purple-700">
                                <span className="bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                                  {oPana}-{oDigit}
                                </span>
                              </td>

                              {/* Jodi */}
                              <td className="p-4 text-center">
                                <span className="bg-[#380e4b] text-amber-300 font-mono font-black text-base px-3 py-1 rounded-lg shadow-sm">
                                  {jodi}
                                </span>
                              </td>

                              {/* Close Result */}
                              <td className="p-4 text-center font-mono font-bold text-purple-700">
                                <span className="bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                                  {cDigit}-{cPana}
                                </span>
                              </td>

                              {/* Full Matka Pill */}
                              <td className="p-4 text-center">
                                <div className="inline-flex items-center gap-1 bg-[#1b0826] text-white px-3 py-1 rounded-xl font-mono font-bold text-xs shadow-sm">
                                  <span className="text-amber-300">{oPana}</span>
                                  <span>-</span>
                                  <span className="text-emerald-300 font-black">{jodi}</span>
                                  <span>-</span>
                                  <span className="text-amber-300">{cPana}</span>
                                </div>
                              </td>

                              {/* Action Buttons */}
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenModal(game, 'Open')}
                                    className="bg-[#380e4b] hover:bg-[#52136e] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                                  >
                                    Declare
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedGame(game._id);
                                      setActiveTab('Winners');
                                    }}
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                    title="View Winners"
                                  >
                                    <Trophy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TABS 2-5: CALCULATOR, WINNERS, LOSERS, HISTORY             */}
          {/* ========================================================== */}
          {activeTab !== 'All Results' && (
            <div>
              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8 bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Game</label>
                  <div className="relative">
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all cursor-pointer font-bold shadow-sm"
                    >
                      {games.map((game) => (
                        <option key={game._id} value={game._id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                    <Gamepad2 className="w-5 h-5 text-gray-300 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-300 absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all cursor-pointer font-bold shadow-sm"
                    />
                  </div>
                </div>

                {/* Stats Summary Card */}
                {selectedGame && selectedDate && (
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Total Bids</span>
                      <span className="text-xl font-black text-blue-700">
                        ₹
                        {winners.reduce((acc, curr) => acc + (curr.amount || 0), 0) +
                          losers.reduce((acc, curr) => acc + (curr.amount || 0), 0) +
                          pendingBids.reduce((acc, curr) => acc + (curr.amount || 0), 0)}
                      </span>
                    </div>
                    <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-green-400 uppercase tracking-tighter">Total Payout</span>
                      <span className="text-xl font-black text-green-700">
                        ₹{winners.reduce((acc, curr) => acc + getWonAmount(curr), 0)}
                      </span>
                    </div>
                    <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-tighter">Profit/Loss</span>
                      <span
                        className={`text-xl font-black ${
                          winners.reduce((acc, curr) => acc + (curr.amount || 0), 0) +
                            losers.reduce((acc, curr) => acc + (curr.amount || 0), 0) -
                            winners.reduce((acc, curr) => acc + getWonAmount(curr), 0) >=
                          0
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        ₹
                        {winners.reduce((acc, curr) => acc + (curr.amount || 0), 0) +
                          losers.reduce((acc, curr) => acc + (curr.amount || 0), 0) -
                          winners.reduce((acc, curr) => acc + getWonAmount(curr), 0)}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'Calculate Results' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Open Pana (3 Digits)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="e.g. 123"
                        value={openPana}
                        onChange={(e) => setOpenPana(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all placeholder-gray-400 font-bold shadow-sm font-mono text-center text-lg"
                      />
                      <span className="text-[11px] text-gray-400 block text-center mt-1">
                        Open Digit: <b className="text-purple-700">{openDigit || '-'}</b>
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Close Pana (3 Digits)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="e.g. 456"
                        value={closePana}
                        onChange={(e) => setClosePana(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#380e4b]/20 focus:border-[#380e4b] transition-all placeholder-gray-400 font-bold shadow-sm font-mono text-center text-lg"
                      />
                      <span className="text-[11px] text-gray-400 block text-center mt-1">
                        Close Digit: <b className="text-purple-700">{closeDigit || '-'}</b>
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Content */}
              <div className="transition-all duration-300">
                <h3 className="text-base md:text-lg font-bold text-[#380e4b] mb-4 flex items-center gap-2">
                  {activeTab} Data
                  <span className="text-xs bg-purple-100 text-[#380e4b] px-2.5 py-0.5 rounded-full font-bold">
                    {selectedDate}
                  </span>
                </h3>

                {/* Calculate Tab Table */}
                {activeTab === 'Calculate Results' && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Game Type</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Input</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loading ? (
                            <tr>
                              <td colSpan="5" className="text-center py-8 text-gray-400">Loading pending bids...</td>
                            </tr>
                          ) : pendingBids.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-8 text-gray-400">No pending bids found for this game.</td>
                            </tr>
                          ) : (
                            pendingBids.map((bid) => (
                              <tr key={bid._id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 font-bold text-gray-800">{bid.user_id?.name || 'User'}</td>
                                <td className="px-4 py-3 text-xs text-gray-600">{bid.game_type} ({bid.session})</td>
                                <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono font-bold">{bid.bet_number}</span></td>
                                <td className="px-4 py-3 font-bold text-gray-800">₹{bid.amount}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{new Date(bid.createdAt).toLocaleTimeString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-center pt-2">
                      <button
                        onClick={handleResult}
                        disabled={loading || (!openPana && !closePana)}
                        className={`font-black tracking-widest py-4 px-12 rounded-2xl text-sm md:text-base transition-all uppercase shadow-lg cursor-pointer ${
                          loading || (!openPana && !closePana)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#380e4b] to-[#601a91] text-white hover:scale-105 hover:shadow-xl active:scale-95'
                        }`}
                      >
                        {loading ? 'Processing...' : 'Declare & Verify Results'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Winners Tab Table */}
                {activeTab === 'Winners' && (
                  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Game</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Input</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-xs font-bold text-emerald-600 uppercase">Won Amount</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loading ? (
                          <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading winners...</td></tr>
                        ) : winners.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-8 text-gray-400">No winners found.</td></tr>
                        ) : (
                          winners.map((bid) => (
                            <tr key={bid._id} className="hover:bg-emerald-50/30">
                              <td className="px-4 py-3 font-bold text-gray-800">{bid.user_id?.name || 'User'}</td>
                              <td className="px-4 py-3 text-xs text-gray-600">{bid.game_type} ({bid.session})</td>
                              <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-mono font-bold">{bid.bet_number}</span></td>
                              <td className="px-4 py-3 font-bold text-gray-800">₹{bid.amount}</td>
                              <td className="px-4 py-3 font-black text-emerald-600">₹{getWonAmount(bid)}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{new Date(bid.createdAt).toLocaleTimeString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Losers Tab Table */}
                {activeTab === 'Losers' && (
                  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Game</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Input</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loading ? (
                          <tr><td colSpan="5" className="text-center py-8 text-gray-400">Loading losers...</td></tr>
                        ) : losers.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-8 text-gray-400">No losers found.</td></tr>
                        ) : (
                          losers.map((bid) => (
                            <tr key={bid._id} className="hover:bg-rose-50/30">
                              <td className="px-4 py-3 font-bold text-gray-800">{bid.user_id?.name || 'User'}</td>
                              <td className="px-4 py-3 text-xs text-gray-600">{bid.game_type} ({bid.session})</td>
                              <td className="px-4 py-3"><span className="bg-rose-50 text-rose-700 px-2 py-1 rounded font-mono font-bold">{bid.bet_number}</span></td>
                              <td className="px-4 py-3 font-bold text-gray-800">₹{bid.amount}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{new Date(bid.createdAt).toLocaleTimeString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* History Tab Table */}
                {activeTab === 'History' && (
                  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Date</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Open</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Jodi</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Close</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-center">
                        {loading ? (
                          <tr><td colSpan="5" className="text-center py-8 text-gray-400">Loading history...</td></tr>
                        ) : history.length === 0 ? (
                          <tr><td colSpan="5" className="text-center py-8 text-gray-400">No history found for this game.</td></tr>
                        ) : (
                          history.map((item) => (
                            <tr key={item._id} className="hover:bg-purple-50/30">
                              <td className="px-4 py-3 font-bold text-gray-700">{new Date(item.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-mono font-black text-purple-700">{item.open_panna || '***'}</td>
                              <td className="px-4 py-3 font-mono font-black text-base">{item.jodi || '**'}</td>
                              <td className="px-4 py-3 font-mono font-black text-purple-700">{item.close_panna || '***'}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => loadHistoryResult(item)}
                                  className="p-1.5 text-gray-400 hover:text-[#380e4b] hover:bg-purple-50 rounded-full transition-all cursor-pointer"
                                  title="Load Result"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK DECLARE RESULT MODAL */}
      {modalOpen && modalGame && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#200030] text-white p-6 flex justify-between items-center border-b border-purple-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 text-black p-2 rounded-xl">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">Declare Result</h3>
                  <p className="text-purple-200 text-xs mt-0.5">{modalGame.name}</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-6">
              {/* Session Selector */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Session
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalSession('Open')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      modalSession === 'Open'
                        ? 'bg-[#380e4b] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Open Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalSession('Close')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      modalSession === 'Close'
                        ? 'bg-[#380e4b] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Close Session
                  </button>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Open Pana */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Open Pana (3 Digits)</label>
                  <input
                    type="text"
                    maxLength={3}
                    disabled={modalSession === 'Close'}
                    value={modalOpenPana}
                    onChange={(e) => setModalOpenPana(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 128"
                    className="w-full border border-gray-300 focus:border-[#380e4b] focus:ring-2 focus:ring-purple-200 rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <div className="mt-1 text-center text-xs text-gray-500 font-semibold">
                    Open Digit: <b className="text-purple-700">{modalOpenDigit || '-'}</b>
                  </div>
                </div>

                {/* Close Pana */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Close Pana (3 Digits)</label>
                  <input
                    type="text"
                    maxLength={3}
                    disabled={modalSession === 'Open'}
                    value={modalClosePana}
                    onChange={(e) => setModalClosePana(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 347"
                    className="w-full border border-gray-300 focus:border-[#380e4b] focus:ring-2 focus:ring-purple-200 rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <div className="mt-1 text-center text-xs text-gray-500 font-semibold">
                    Close Digit: <b className="text-purple-700">{modalCloseDigit || '-'}</b>
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 text-center">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-widest block mb-1">
                  Result Preview
                </span>
                <div className="font-mono text-xl font-black text-[#380e4b]">
                  <span className="text-purple-900">{modalOpenPana || '***'}</span>
                  <span className="mx-1 text-purple-400">-</span>
                  <span className="bg-[#380e4b] text-amber-300 px-2 py-0.5 rounded-md">
                    {modalOpenDigit || '*'}{modalCloseDigit || '*'}
                  </span>
                  <span className="mx-1 text-purple-400">-</span>
                  <span className="text-purple-900">{modalClosePana || '***'}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#380e4b] hover:bg-[#52136e] text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Declaring...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirm & Declare
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatkaResults;
