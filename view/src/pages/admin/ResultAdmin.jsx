import React, { useState, useEffect } from 'react';
import { 
  Check, X, History, Edit3, Trash2, Eye, Calendar, Plus, AlertCircle, RefreshCw, BarChart2, Trophy 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { fetchGame } from '../../utils/api';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';

export const ResultAdmin = () => {
  // Tabs: 'Calculate Results' | 'Winners' | 'Losers' | 'History'
  const [activeTab, setActiveTab] = useState('Calculate Results');

  // Real Form inputs - Default to Present Real-Time Date
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [gamesList, setGamesList] = useState([]);
  
  const [openPana, setOpenPana] = useState('');
  const [closePana, setClosePana] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [declaring, setDeclaring] = useState(false);

  // Bids list for Winners & Losers tabs
  const [allBids, setAllBids] = useState([]);

  const fetchBidsList = async () => {
    try {
      const bidsRes = await AxiosAdmin({
        url: SummaryApi.getAllBids.url,
        method: SummaryApi.getAllBids.method,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (bidsRes.data?.bids && Array.isArray(bidsRes.data.bids)) {
        setAllBids(bidsRes.data.bids);
      }
    } catch (err) {
      console.warn('Error loading bids list:', err);
    }
  };

  // Helper to handle game selection & auto-load existing declared result
  const handleSelectGame = (gameName, list = gamesList) => {
    setSelectedGame(gameName);
    const target = list.find(g => (g.market_name || g.name) === gameName);
    if (target) {
      const op = target.result_open && target.result_open !== '***' ? target.result_open : '';
      const cl = target.result_close && target.result_close !== '***' ? target.result_close : '';
      setOpenPana(op);
      setClosePana(cl);
      // If both or either declared in DB, default to locked mode until Edit clicked; if neither declared, default to editable
      if ((op && op !== '***') || (cl && cl !== '***')) {
        setIsEditable(false);
      } else {
        setIsEditable(true);
      }
    } else {
      setOpenPana('');
      setClosePana('');
      setIsEditable(true);
    }
  };

  // Fetch real markets and all bids
  useEffect(() => {
    const loadData = async () => {
      try {
        const markets = await fetchGame();
        if (Array.isArray(markets) && markets.length > 0) {
          setGamesList(markets);
          // Keep empty initially until user selects a game
          setSelectedGame('');
          setOpenPana('');
          setClosePana('');
        }
        await fetchBidsList();
      } catch (err) {
        console.warn('Error loading markets/bids for ResultAdmin:', err);
      }
    };
    loadData();
  }, []);

  // Interactive calculated states
  const [isCalculated, setIsCalculated] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  
  // Results History stores all declarations
  const [resultsHistory, setResultsHistory] = useState([
    { id: 1, game: 'SRIDEVI NIGHT', date: todayStr, openPana: '145', closePana: '480', jodi: '02', openAnk: '0', closeAnk: '2' }
  ]);

  // Modals state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  const calculateAnk = (pana) => {
    if (!pana || String(pana).trim().length !== 3) return '-';
    const sum = String(pana).trim().split('').reduce((acc, digit) => acc + parseInt(digit || 0, 10), 0);
    return String(sum % 10);
  };

  const handleCalculate = () => {
    if ((!openPana || openPana.length !== 3) && (!closePana || closePana.length !== 3)) {
      toast.error('Please enter valid 3-digit open or close pana values');
      return;
    }
    setIsCalculated(true);
    toast.success('Results calculated successfully!');
  };

  const handleUpdateResults = async () => {
    try {
      setDeclaring(true);
      const targetMarket = gamesList.find(g => (g.market_name || g.name) === selectedGame);
      const marketId = targetMarket?._id;

      const opAnk = calculateAnk(openPana);
      const clAnk = calculateAnk(closePana);
      const jodiVal = (opAnk !== '-' && clAnk !== '-') ? (opAnk + clAnk) : '-';

      // Call Backend Declare Result API
      const res = await AxiosAdmin({
        url: SummaryApi.declareResult.url,
        method: SummaryApi.declareResult.method,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        data: {
          marketId,
          marketName: selectedGame,
          resultOpen: openPana,
          resultClose: closePana,
          jodiResult: jodiVal !== '-' ? jodiVal : ''
        }
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Result declared & winning payouts processed! 🎯');
      } else {
        toast.success('Result updated successfully! 🎯');
      }

      const formattedDate = selectedDate;
      const matchedIndex = resultsHistory.findIndex(r => r.game === selectedGame && r.date === formattedDate);
      
      if (matchedIndex > -1) {
        const updated = [...resultsHistory];
        updated[matchedIndex] = {
          ...updated[matchedIndex],
          openPana,
          closePana,
          jodi: jodiVal,
          openAnk: opAnk,
          closeAnk: clAnk
        };
        setResultsHistory(updated);
      } else {
        const newRecord = {
          id: Date.now(),
          game: selectedGame,
          date: formattedDate,
          openPana,
          closePana,
          jodi: jodiVal,
          openAnk: opAnk,
          closeAnk: clAnk
        };
        setResultsHistory(prev => [newRecord, ...prev]);
      }
      setIsCalculated(true);
      setIsEditable(false);
      await fetchBidsList();
      const updatedMarkets = await fetchGame();
      if (Array.isArray(updatedMarkets)) {
        setGamesList(updatedMarkets);
      }
    } catch (err) {
      console.error('Error declaring result:', err);
      toast.error('Failed to declare result. Please check input values.');
    } finally {
      setDeclaring(false);
    }
  };

  const handleLoadResult = (res) => {
    setSelectedGame(res.game);
    setOpenPana(res.openPana && res.openPana !== '***' ? res.openPana : '');
    setClosePana(res.closePana && res.closePana !== '***' ? res.closePana : '');
    setIsEditable(false);
    setIsCalculated(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(`Loaded historical result for ${res.game} (${res.date})`);
  };

  const triggerDeleteClose = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteResult = () => {
    setResultsHistory(prev => prev.filter(r => r.id !== targetDeleteId));
    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
    toast.success('Result entry deleted');
  };

  // Calculated values derived for display cards
  const openAnk = calculateAnk(openPana);
  const closeAnk = calculateAnk(closePana);
  const calculatedJodi = (openAnk !== '-' && closeAnk !== '-') ? (openAnk + closeAnk) : '--';

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-4xl shadow-sm rounded-3xl overflow-hidden border border-gray-200 bg-white">
        
        {/* 1. Deep Blue Header Banner */}
        <div className="bg-[#0f53d6] text-white py-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">Game Result Admin Panel</h1>
          <p className="text-xs text-white/80 mt-1 font-semibold">Calculate and manage game results</p>
        </div>

        {/* 2. Main White Content Box */}
        <div className="p-6 space-y-6">
          
          {/* Tabs switch row */}
          <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 pb-3 text-xs font-bold text-gray-400">
            {['Calculate Results', 'Winners', 'Losers', 'History'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1 pb-3 -mb-3 transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-[#0f53d6] border-b-2 border-[#0f53d6]' 
                      : 'hover:text-gray-600'
                  }`}
                >
                  {tab === 'History' && <History size={12} />}
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'Calculate Results' && (
            <div className="space-y-6">
              
              {/* Form Grid 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Game */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Game</label>
                  <div className="relative">
                    <select
                      value={selectedGame}
                      onChange={(e) => handleSelectGame(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none shadow-3xs"
                    >
                      <option value="">Select Market / Game</option>
                      {gamesList.map((g) => {
                        const gName = g.market_name || g.name;
                        return (
                          <option key={g._id || gName} value={gName}>
                            {gName}
                          </option>
                        );
                      })}
                    </select>
                    <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
                  </div>

                  {/* Indicators Checkboxes Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span>Complete (Open + Close)</span>
                    </span>
                    <span className="text-[10px] font-bold text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Partial (Open only)</span>
                    </span>
                  </div>
                </div>

                {/* Select Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none cursor-pointer shadow-3xs"
                    />
                  </div>
                </div>
              </div>

              {!selectedGame ? (
                <div className="border border-dashed border-gray-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 mt-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shadow-3xs">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Please Select a Game / Market</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">
                      Select a market from the dropdown above to declare or view results.
                    </p>
                  </div>
                </div>
              ) : (
                <>

              {/* Form Grid 2: Open & Close Pana */}
              {(() => {
                const targetMarket = gamesList.find(g => (g.market_name || g.name) === selectedGame);
                const dbHasOpen = targetMarket?.result_open && targetMarket.result_open !== '***';
                const dbHasClose = targetMarket?.result_close && targetMarket.result_close !== '***';

                const isOpenLocked = !isEditable && Boolean(dbHasOpen);
                const isCloseLocked = !isEditable && Boolean(dbHasClose);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Open Pana */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open Pana</label>
                        {isOpenLocked ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            🔒 Declared (Locked)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✏️ Open For Entry
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={3}
                        disabled={isOpenLocked}
                        placeholder={isOpenLocked ? openPana : 'Enter Open Pana (e.g. 145)'}
                        value={openPana}
                        onChange={(e) => setOpenPana(e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold outline-none shadow-3xs transition-all ${
                          isOpenLocked 
                            ? 'bg-gray-100/90 text-gray-600 cursor-not-allowed border-gray-200' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        }`}
                      />
                    </div>

                    {/* Close Pana */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Close Pana</label>
                        {isCloseLocked ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            🔒 Declared (Locked)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✏️ Open For Entry
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={3}
                        disabled={isCloseLocked}
                        placeholder={isCloseLocked ? closePana : 'Enter Close Pana (e.g. 480)'}
                        value={closePana}
                        onChange={(e) => setClosePana(e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-xs font-semibold outline-none shadow-3xs transition-all ${
                          isCloseLocked 
                            ? 'bg-gray-100/90 text-gray-600 cursor-not-allowed border-gray-200' 
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-[0.99] text-center"
                >
                  Calculate Ank & Jodi
                </button>

                <button
                  type="button"
                  onClick={handleUpdateResults}
                  disabled={declaring}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-[0.99] text-center flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {declaring ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Declaring Result...</span>
                    </>
                  ) : (
                    <span>Declare & Pay Out Results 🎯</span>
                  )}
                </button>
              </div>

              {/* Toggle previous results button */}
              <div className="flex flex-col items-center justify-center pt-2 border-t border-gray-150 space-y-4">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-[#f3f4f6] border border-gray-200 text-gray-650 hover:bg-gray-200 text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all"
                >
                  <History size={11} />
                  <span>{showHistory ? 'Hide Previous Results' : 'Show Previous Results'} ({resultsHistory.length})</span>
                </button>

                {showHistory && resultsHistory.length > 0 && (
                  <div className="w-full text-left space-y-3 bg-gray-50/50 border border-gray-150 rounded-3xl p-5 shadow-inner">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Previous Results</span>
                    <div className="flex flex-wrap gap-4">
                      {resultsHistory.map((res) => (
                        <div 
                          key={res.id} 
                          className="bg-white border border-gray-300 rounded-2xl p-4 w-72 text-left flex flex-col relative space-y-3 shadow-3xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-805">{res.date}</span>
                            <button
                              onClick={() => handleLoadResult(res)}
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-0.5 cursor-pointer hover:bg-blue-100"
                            >
                              <Eye size={8} />
                              <span>Load</span>
                            </button>
                          </div>

                          <div className="space-y-1 text-[11px] text-gray-500 font-semibold">
                            <div className="flex justify-between">
                              <span>Open Pana:</span>
                              <span className="text-gray-900 font-bold">{res.openPana}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Close Pana:</span>
                              <span className="text-gray-900 font-bold">{res.closePana}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-1.5 flex justify-between text-[10px] text-gray-400 font-bold">
                              <span>Jodi: {res.jodi}</span>
                              <span>Single Ank: {res.openAnk} - {res.closeAnk}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Calculated Results Panel */}
              {isCalculated && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-center font-bold text-emerald-600 text-sm tracking-wide">
                    Current Calculated Results
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                    
                    {/* Single Ank */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs">
                      <span className="text-gray-450 block text-[10px]">Single Ank</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Open: <span className="text-gray-900">{openAnk}</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Close: <span className="text-gray-900">{closeAnk}</span>
                        </div>
                      </div>
                    </div>

                    {/* Jodi */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs">
                      <span className="text-gray-450 block text-[10px]">Jodi</span>
                      <div className="bg-blue-50/50 border border-blue-100 text-gray-900 text-center py-2 rounded-xl text-xs">
                        {calculatedJodi}
                      </div>
                    </div>

                    {/* Single Pana */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs">
                      <span className="text-gray-450 block text-[10px]">Single Pana</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Open: <span className="text-gray-900">{openPana || '-'}</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Close: <span className="text-gray-900">{closePana || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Double Pana */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs">
                      <span className="text-gray-450 block text-[10px]">Double Pana</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Open: <span className="text-gray-900">-</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Close: <span className="text-gray-900">-</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Declared Result Bottom block */}
              {isCalculated && (
                <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-800">Declared Result</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setIsEditable(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          toast.success(`Edit mode unlocked for ${selectedGame}! You can now modify Pana values.`);
                        }}
                        className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-3xs transition-all"
                      >
                        <Edit3 size={11} />
                        <span>Edit Result</span>
                      </button>
                      <button 
                        onClick={() => triggerDeleteClose(resultsHistory[0]?.id)}
                        className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-red-100 cursor-pointer shadow-3xs"
                      >
                        <Trash2 size={11} />
                        <span>Delete Close</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-450 font-bold">
                    Result for <span className="text-gray-700 font-black">{selectedGame}</span> on {new Date(selectedDate).toLocaleDateString('en-US')}:
                  </p>

                  <div className="bg-gray-50 border border-gray-200 text-center py-5 rounded-2xl flex items-center justify-center gap-10 font-bold text-sm">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Open Pana</span>
                      <span className="text-gray-900 block mt-0.5">{openPana}</span>
                    </div>
                    <div className="border-l border-gray-200 h-8"></div>
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Close Pana</span>
                      <span className="text-gray-900 block mt-0.5">{closePana}</span>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}

            </div>
          )}

          {activeTab === 'Winners' && (() => {
            const winnersList = allBids.filter(b => {
              const market = (b.marketName || b.mechanic || '').toUpperCase().trim();
              const status = (b.status || '').toLowerCase().trim();
              const matchGame = !selectedGame || market === selectedGame.toUpperCase().trim();
              return matchGame && (status === 'won' || status === 'win');
            });

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-800">Winners Report</h3>
                    <span className="text-[10px] text-gray-400 mt-0.5 font-bold">
                      {selectedDate} • {selectedGame || 'All Markets'}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
                    Total Winners: {winnersList.length}
                  </span>
                </div>

                {winnersList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {winnersList.map((bid, idx) => (
                      <div key={bid._id || idx} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">📱 {bid.userMobile || bid.user_id?.mobile || 'User'}</span>
                          <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full">WIN</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>Market: {bid.marketName || 'Main'} ({bid.session || 'Open'})</span>
                          <span className="font-bold">Digit: {bid.digit || bid.pana || bid.jodi}</span>
                        </div>
                        <div className="flex justify-between text-xs font-extrabold border-t border-emerald-200 pt-1.5">
                          <span className="text-gray-500">Bet: ₹{bid.points}</span>
                          <span className="text-emerald-700">Payout: ₹{bid.winAmount || Number(bid.points) * 9.5}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="text-gray-300">
                      <Trophy size={32} className="stroke-[1.5] text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">No Winners Found</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        No winning bids declared for {selectedGame || 'selected market'} on {selectedDate}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'Losers' && (() => {
            const losersList = allBids.filter(b => {
              const market = (b.marketName || b.mechanic || '').toUpperCase().trim();
              const status = (b.status || '').toLowerCase().trim();
              const matchGame = !selectedGame || market === selectedGame.toUpperCase().trim();
              return matchGame && (status === 'lost' || status === 'loss');
            });

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-800">Losers Report</h3>
                    <span className="text-[10px] text-gray-400 mt-0.5 font-bold">
                      {selectedDate} • {selectedGame || 'All Markets'}
                    </span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 rounded-full">
                    Total Losers: {losersList.length}
                  </span>
                </div>

                {losersList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {losersList.map((bid, idx) => (
                      <div key={bid._id || idx} className="bg-red-50/50 border border-red-200 rounded-2xl p-3.5 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">📱 {bid.userMobile || bid.user_id?.mobile || 'User'}</span>
                          <span className="bg-red-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full">LOSS</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>Market: {bid.marketName || 'Main'} ({bid.session || 'Open'})</span>
                          <span className="font-bold">Digit: {bid.digit || bid.pana || bid.jodi}</span>
                        </div>
                        <div className="flex justify-between text-xs font-extrabold border-t border-red-200 pt-1.5">
                          <span className="text-gray-500">Bet Amount: ₹{bid.points}</span>
                          <span className="text-red-600">Loss: ₹{bid.points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="text-gray-300">
                      <BarChart2 size={32} className="stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">No Losers Found</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        No losing bids recorded for {selectedGame || 'selected market'} on {selectedDate}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'History' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Results History</h2>
              
              <div className="flex flex-wrap gap-4">
                {resultsHistory.map((res) => (
                  <div 
                    key={res.id} 
                    className="bg-white border border-gray-300 rounded-2xl p-4 w-72 text-left flex flex-col relative space-y-3 shadow-3xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-800">{res.date}</span>
                      <button
                        onClick={() => handleLoadResult(res)}
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-0.5 cursor-pointer hover:bg-blue-100"
                      >
                        <Eye size={8} />
                        <span>Load</span>
                      </button>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-500 font-semibold">
                      <div className="flex justify-between">
                        <span>Open Pana:</span>
                        <span className="text-gray-900 font-bold">{res.openPana}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Close Pana:</span>
                        <span className="text-gray-900 font-bold">{res.closePana}</span>
                      </div>
                      <div className="border-t border-gray-100 pt-1.5 flex justify-between text-[10px] text-gray-400 font-bold">
                        <span>Jodi: {res.jodi}</span>
                        <span>Single Ank: {res.openAnk} - {res.closeAnk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Declared Result?"
        message="Are you sure you want to delete this game result config permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteResult}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

    </div>
  );
};

export default ResultAdmin;
