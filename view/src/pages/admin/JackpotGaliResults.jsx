import React, { useState, useEffect } from 'react';
import { 
  Check, X, History, Edit3, Trash2, Eye, HelpCircle, Calendar, Plus, RefreshCw, Trophy, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const JackpotGaliResults = () => {
  // Tabs: 'Declare Jodi' | 'Winners' | 'Losers' | 'History'
  const [activeTab, setActiveTab] = useState('Declare Jodi');

  // Gali markets from database
  const [galiMarkets, setGaliMarkets] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  const [leftDigit, setLeftDigit] = useState('0-9');
  const [rightDigit, setRightDigit] = useState('0-9');

  // Computed / declared states
  const [calculatedJodi, setCalculatedJodi] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [declaredJodi, setDeclaredJodi] = useState('');
  const [loading, setLoading] = useState(false);
  const [declaring, setDeclaring] = useState(false);

  // Bids for winners / losers analysis
  const [allBids, setAllBids] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Confirm modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // Fetch Gali markets from database
  const fetchGaliMarkets = async () => {
    try {
      setLoading(true);
      const res = await AxiosAdmin({
        url: '/api/market/get-gali-markets',
        method: 'get'
      });

      if (res?.data?.data && Array.isArray(res.data.data)) {
        setGaliMarkets(res.data.data);
      }
    } catch (err) {
      console.warn('Error fetching Gali markets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids for winners/losers tab
  const fetchAllBids = async () => {
    try {
      const res = await AxiosAdmin({
        url: '/api/bid/get-all-bids',
        method: 'get'
      });
      const bidsList = res?.data?.data || res?.data?.bids || (Array.isArray(res?.data) ? res.data : []);
      if (Array.isArray(bidsList)) {
        setAllBids(bidsList);
      }
    } catch (err) {
      console.warn('Error fetching bids:', err);
    }
  };

  useEffect(() => {
    fetchGaliMarkets();
    fetchAllBids();
  }, []);

  // Selected market object strictly from database galiMarkets
  const selectedMarketObj = galiMarkets.find(m => String(m._id || m.id) === String(selectedGameId) || String(m.name).toUpperCase() === String(selectedGameId).toUpperCase());

  useEffect(() => {
    if (selectedMarketObj) {
      const currentJodi = selectedMarketObj.jodi_result && selectedMarketObj.jodi_result !== '**' ? selectedMarketObj.jodi_result : '';
      setDeclaredJodi(currentJodi);
      if (currentJodi && currentJodi.length === 2) {
        setLeftDigit(currentJodi[0]);
        setRightDigit(currentJodi[1]);
        setCalculatedJodi(currentJodi);
        setIsCalculated(true);
      } else {
        setLeftDigit('0-9');
        setRightDigit('0-9');
        setCalculatedJodi('');
        setIsCalculated(false);
      }
    } else {
      setDeclaredJodi('');
      setLeftDigit('0-9');
      setRightDigit('0-9');
      setCalculatedJodi('');
      setIsCalculated(false);
    }
  }, [selectedGameId, galiMarkets]);

  const handleCalculateJodi = () => {
    if (!selectedGameId) {
      toast.error('Please select a Jackpot Gali Game first');
      return;
    }
    if (leftDigit === '0-9' || rightDigit === '0-9') {
      toast.error('Please select both Left Digit and Right Digit');
      return;
    }
    const resultJodi = leftDigit + rightDigit;
    setCalculatedJodi(resultJodi);
    setIsCalculated(true);
    toast.success(`Jodi calculated: ${resultJodi}`);
  };

  const handleDeclareOrUpdateJodi = async () => {
    if (!selectedGameId) {
      toast.error('Please select a Jackpot Gali Game first');
      return;
    }
    if (leftDigit === '0-9' || rightDigit === '0-9') {
      toast.error('Please select both Left Digit and Right Digit');
      return;
    }

    const targetJodi = leftDigit + rightDigit;
    setDeclaring(true);

    try {
      const res = await AxiosAdmin({
        url: SummaryApi.declareGaliResult?.url || '/api/market/declare-gali-result',
        method: SummaryApi.declareGaliResult?.method || 'post',
        data: {
          marketId: selectedGameId,
          jodiResult: targetJodi
        }
      });

      if (res?.data?.success) {
        const msg = res.data.message || `Result ${targetJodi} declared & bids settled! 🎯`;
        toast.success(msg);
        setDeclaredJodi(targetJodi);
        fetchGaliMarkets();
        fetchAllBids();
      } else {
        toast.error(res?.data?.message || 'Failed to declare result');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error declaring Jodi result');
    } finally {
      setDeclaring(false);
    }
  };

  const triggerDeleteResult = (marketId) => {
    setTargetDeleteId(marketId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteResult = async () => {
    if (!targetDeleteId) return;

    try {
      const res = await AxiosAdmin({
        url: `/api/market/update-gali-market/${targetDeleteId}`,
        method: 'put',
        data: { jodi_result: '**' }
      });

      if (res?.data?.success) {
        toast.success('Declared result cleared for market');
        fetchGaliMarkets();
      }
    } catch (err) {
      toast.error('Failed to clear result');
    }

    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
  };

  // Filter bids for winners & losers
  const marketBids = allBids.filter(b => {
    if (!selectedMarketObj) return false;
    const bMarket = (b.marketName || b.market_name || '').trim().toUpperCase();
    const selMarket = (selectedMarketObj.name || '').trim().toUpperCase();
    return bMarket === selMarket;
  });

  const winnerBids = marketBids.filter(b => {
    const status = String(b.status || '').toLowerCase();
    if (status === 'won' || status === 'win') return true;
    if (status === 'lost' || status === 'loss') return false;

    if (!declaredJodi || declaredJodi.length !== 2) return false;
    const lDigit = declaredJodi[0];
    const rDigit = declaredJodi[1];

    const mode = (b.gameMode || b.game_mode || b.game_type || '').toLowerCase();
    const digit = String(b.digit || b.bid_digit || '').trim();

    if (mode.includes('left') && digit === lDigit) return true;
    if (mode.includes('right') && digit === rDigit) return true;
    if (mode.includes('jodi') && digit === declaredJodi) return true;
    if (mode.includes('digit') && (digit === lDigit || digit === rDigit)) return true;
    return false;
  });

  const loserBids = marketBids.filter(b => {
    const status = String(b.status || '').toLowerCase();
    if (status === 'lost' || status === 'loss') return true;
    if (status === 'won' || status === 'win') return false;
    return !winnerBids.includes(b);
  });

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-4xl shadow-sm rounded-3xl overflow-hidden border border-gray-200">
        
        {/* 1. Purple Header Banner */}
        <div className="bg-[#7c3aed] text-white py-6 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Jackpot Result Admin Panel</h1>
            <p className="text-xs text-white/80 mt-1 font-semibold">Declare 2-Digit Jodi Results & Auto Settlement</p>
          </div>
          <button
            onClick={() => {
              fetchGaliMarkets();
              fetchAllBids();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 2. Main White Content Box */}
        <div className="bg-white p-6 space-y-6">
          
          {/* Tabs switch row */}
          <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 pb-3 text-xs font-bold text-gray-400">
            {['Declare Jodi', 'Winners', 'Losers', 'History'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 pb-3 -mb-3 transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-[#7c3aed] border-b-2 border-[#7c3aed]' 
                      : 'hover:text-gray-600'
                  }`}
                >
                  {tab === 'History' && <History size={12} />}
                  {tab === 'Winners' && <Trophy size={12} className="text-amber-500" />}
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'Declare Jodi' && (
            <div className="space-y-6">
              
              {/* Form Grid 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Game Dropdown (Defaults to empty -- Select Game --) */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Jackpot Gali Game</label>
                  <div className="relative">
                    <select
                      value={selectedGameId}
                      onChange={(e) => setSelectedGameId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none shadow-3xs"
                    >
                      <option value="">-- Select Jackpot Gali Game --</option>
                      {galiMarkets.map(m => (
                        <option key={m._id || m.id} value={m._id || m.id}>
                          {m.name} ({m.time}) {m.jodi_result && m.jodi_result !== '**' ? `[Result: ${m.jodi_result}]` : ''}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
                  </div>

                  {/* Jodi Declared indicator checkbox */}
                  {selectedGameId && (
                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="checkbox"
                        id="jodiDeclaredCheckbox"
                        checked={!!declaredJodi}
                        readOnly
                        className="w-3.5 h-3.5 rounded text-green-600 border-gray-300 focus:ring-green-500 cursor-default"
                      />
                      <label htmlFor="jodiDeclaredCheckbox" className={`text-[10px] font-bold flex items-center gap-1 ${
                        declaredJodi ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3.5]" />
                        <span>{declaredJodi ? `Jodi Declared (${declaredJodi})` : 'Jodi Not Declared Yet'}</span>
                      </label>
                    </div>
                  )}
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

              {!selectedGameId ? (
                /* Empty state prompt before game is selected */
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-3xl p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-gray-700">Please select a Jackpot Gali Game above.</p>
                  <p className="text-xs text-gray-400 font-medium">Select a game from the dropdown menu to calculate digits, declare results, and view winning payouts.</p>
                </div>
              ) : (
                <>
                  {/* Form Grid 2: Left & Right Digit select cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Digit */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Left Digit</label>
                      <div className="relative">
                        <select
                          value={leftDigit}
                          onChange={(e) => {
                            setLeftDigit(e.target.value);
                            setIsCalculated(false);
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold text-gray-900 cursor-pointer outline-none shadow-3xs"
                        >
                          <option value="0-9">Select Left Digit (0-9)</option>
                          {[...Array(10).keys()].map(num => (
                            <option key={num} value={String(num)}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right Digit */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Right Digit</label>
                      <div className="relative">
                        <select
                          value={rightDigit}
                          onChange={(e) => {
                            setRightDigit(e.target.value);
                            setIsCalculated(false);
                          }}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-center text-sm font-bold text-gray-900 cursor-pointer outline-none shadow-3xs"
                        >
                          <option value="0-9">Select Right Digit (0-9)</option>
                          {[...Array(10).keys()].map(num => (
                            <option key={num} value={String(num)}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Jodi display box */}
                  {isCalculated && calculatedJodi && (
                    <div className="border border-purple-200 bg-purple-50/30 text-center py-4 rounded-xl space-y-1 shadow-3xs animate-fadeIn">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Calculated Jodi:</span>
                      <p className="text-4xl font-bold text-[#7c3aed] tracking-widest">{calculatedJodi}</p>
                    </div>
                  )}

                  {/* Action Buttons row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={handleCalculateJodi}
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-[0.99] text-center"
                    >
                      Calculate Jodi
                    </button>

                    <button
                      type="button"
                      disabled={declaring || leftDigit === '0-9' || rightDigit === '0-9'}
                      onClick={handleDeclareOrUpdateJodi}
                      className={`py-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-[0.99] border ${
                        leftDigit !== '0-9' && rightDigit !== '0-9'
                          ? 'border-[#7c3aed] bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-sm'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {declaring ? 'Declaring & Settling...' : declaredJodi ? 'Update Jodi & Settle' : 'Declare Jodi & Settle'}
                    </button>
                  </div>

                  {/* Declared Jodi card section */}
                  {declaredJodi && selectedMarketObj && (
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-800">Declared Jodi for {selectedMarketObj.name}</span>
                        <button 
                          onClick={() => triggerDeleteResult(selectedMarketObj._id || selectedMarketObj.id)}
                          className="px-3 py-1 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-red-50 cursor-pointer shadow-3xs"
                        >
                          <Trash2 size={11} />
                          <span>Clear Result</span>
                        </button>
                      </div>

                      <p className="text-[10px] text-gray-450 font-bold">
                        Active Jodi Result for {selectedDate}:
                      </p>

                      <div className="border border-purple-100 bg-purple-50/20 text-center py-5 rounded-2xl shadow-3xs">
                        <p className="text-3xl font-bold text-[#7c3aed] tracking-wider">{declaredJodi}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Hide/Show previous results toggle */}
              <div className="flex flex-col items-center justify-center pt-4 border-t border-gray-150 space-y-4">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-[#f3f4f6] border border-gray-200 text-gray-650 hover:bg-gray-200 text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all"
                >
                  <History size={11} />
                  <span>{showHistory ? 'Hide Active Results' : 'Show Active Results'} ({galiMarkets.filter(m => m.jodi_result && m.jodi_result !== '**').length})</span>
                </button>

                {showHistory && (
                  <div className="w-full text-left space-y-3 bg-gray-50/50 border border-gray-150 rounded-3xl p-5 shadow-inner">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Declared Results</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {galiMarkets.filter(m => m.jodi_result && m.jodi_result !== '**').length === 0 ? (
                        <p className="text-xs text-gray-400 font-semibold col-span-2">No declared results found yet.</p>
                      ) : (
                        galiMarkets.filter(m => m.jodi_result && m.jodi_result !== '**').map((res) => (
                          <div 
                            key={res._id || res.id} 
                            className="bg-white border border-gray-300 rounded-2xl p-4 text-left flex flex-col justify-between space-y-3 shadow-3xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-800 uppercase">{res.name}</span>
                              <button
                                onClick={() => triggerDeleteResult(res._id || res.id)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1 cursor-pointer hover:bg-red-100"
                              >
                                <Trash2 size={10} />
                                <span>Clear Result</span>
                              </button>
                            </div>

                            <div className="text-center space-y-0.5">
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Declared Jodi:</span>
                              <span className="text-2xl font-bold text-[#7c3aed] block tracking-widest">{res.jodi_result}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'Winners' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Winning Bids {selectedMarketObj ? `for ${selectedMarketObj.name}` : ''} ({winnerBids.length})
              </h2>

              {!selectedGameId ? (
                <div className="text-center py-10 font-semibold text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-150">
                  Please select a game above to view winning bids.
                </div>
              ) : winnerBids.length === 0 ? (
                <div className="text-center py-10 font-semibold text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-150">
                  No winning bids found for declared result ({declaredJodi || 'None'}).
                </div>
              ) : (
                <div className="space-y-2">
                  {winnerBids.map((bid, idx) => (
                    <div key={idx} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold text-emerald-900">
                      <div>
                        <span className="font-bold block">{bid.userMobile || bid.user_mobile || bid.userName || bid.username || 'User'}</span>
                        <span className="text-[10px] text-emerald-600">Mode: {bid.gameMode || bid.game_type || bid.game_mode} | Digit: {bid.digit || bid.bid_digit}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 block">Payout: ₹{bid.winAmount || bid.win_amount || (Number(bid.points || 0) * 10)}</span>
                        <span className="text-[10px] text-emerald-600 font-normal">Bid: ₹{bid.points || bid.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Losers' && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Non-Winning Bids {selectedMarketObj ? `for ${selectedMarketObj.name}` : ''} ({loserBids.length})
              </h2>

              {!selectedGameId ? (
                <div className="text-center py-10 font-semibold text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-150">
                  Please select a game above to view non-winning bids.
                </div>
              ) : loserBids.length === 0 ? (
                <div className="text-center py-10 font-semibold text-xs text-gray-400 bg-gray-50 rounded-2xl border border-gray-150">
                  No losing bids found.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {loserBids.map((bid, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold text-gray-700">
                      <div>
                        <span className="font-bold block">{bid.userMobile || bid.user_mobile || bid.userName || bid.username || 'User'}</span>
                        <span className="text-[10px] text-gray-400">Mode: {bid.gameMode || bid.game_type || bid.game_mode} | Digit: {bid.digit || bid.bid_digit}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-500 block">Lost</span>
                        <span className="text-[10px] text-gray-400 font-normal">Bid: ₹{bid.points || bid.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'History' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide">All Declared Gali Results</h2>
              
              {galiMarkets.filter(m => m.jodi_result && m.jodi_result !== '**').length === 0 ? (
                <div className="text-xs text-gray-400 font-semibold bg-gray-50 p-6 rounded-2xl border border-gray-150 text-center">
                  No declared Gali results recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {galiMarkets.filter(m => m.jodi_result && m.jodi_result !== '**').map((res) => (
                    <div 
                      key={res._id || res.id} 
                      className="bg-white border border-gray-300 rounded-2xl p-4 text-left flex flex-col justify-between space-y-3 shadow-3xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-800 uppercase">{res.name} ({res.time})</span>
                        <button
                          onClick={() => triggerDeleteResult(res._id || res.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-1 cursor-pointer hover:bg-red-100"
                        >
                          <Trash2 size={10} />
                          <span>Clear</span>
                        </button>
                      </div>

                      <div className="text-center space-y-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Declared Jodi:</span>
                        <span className="text-2xl font-bold text-[#7c3aed] block tracking-widest">{res.jodi_result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Confirmation warning modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Clear Result?"
        message="Are you sure you want to clear this declared jodi result entry?"
        confirmText="Clear"
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

export default JackpotGaliResults;
