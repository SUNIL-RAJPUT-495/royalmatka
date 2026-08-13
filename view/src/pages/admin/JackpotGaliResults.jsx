import React, { useState } from 'react';
import { 
  Check, X, History, Edit3, Trash2, Eye, HelpCircle, Calendar, Plus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const JackpotGaliResults = () => {
  // Tabs: 'Declare Jodi' | 'Winners' | 'Losers' | 'History'
  const [activeTab, setActiveTab] = useState('Declare Jodi');

  // Form states
  const [selectedGame, setSelectedGame] = useState('DESAWAR');
  const [selectedDate, setSelectedDate] = useState('2026-03-16'); // Matching screenshot date format
  const [jodiDeclared, setJodiDeclared] = useState(false);
  const [leftDigit, setLeftDigit] = useState('0-9');
  const [rightDigit, setRightDigit] = useState('0-9');

  // Computed / declared states
  const [calculatedJodi, setCalculatedJodi] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [declaredJodi, setDeclaredJodi] = useState(''); // Live active declared jodi

  const [showHistory, setShowHistory] = useState(false);

  // All results list (stores declarations)
  const [resultsList, setResultsList] = useState([
    { id: 1, game: 'DESAWAR', date: '3/16/2026', jodi: '28', left: '2', right: '8' }
  ]);

  // Confirm modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  const handleCalculateJodi = () => {
    if (leftDigit === '0-9' || rightDigit === '0-9') {
      toast.error('Please select Left and Right digits');
      return;
    }
    setCalculatedJodi(leftDigit + rightDigit);
    setIsCalculated(true);
    toast.success(`Jodi combination calculated: ${leftDigit + rightDigit}`);
  };

  const handleDeclareOrUpdateJodi = () => {
    if (leftDigit === '0-9' || rightDigit === '0-9') {
      toast.error('Please select Left and Right digits');
      return;
    }
    const targetJodi = leftDigit + rightDigit;
    
    // Check if it already exists for this date/game
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US');
    const existingIndex = resultsList.findIndex(r => r.game === selectedGame && r.date === formattedDate);

    if (existingIndex > -1) {
      // Update
      const updated = [...resultsList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        jodi: targetJodi,
        left: leftDigit,
        right: rightDigit
      };
      setResultsList(updated);
      toast.success('Jodi updated successfully!');
    } else {
      // Create new
      const newRecord = {
        id: Date.now(),
        game: selectedGame,
        date: formattedDate,
        jodi: targetJodi,
        left: leftDigit,
        right: rightDigit
      };
      setResultsList(prev => [newRecord, ...prev]);
      toast.success('Jodi declared successfully!');
    }

    setDeclaredJodi(targetJodi);
    setJodiDeclared(true);
  };

  const handleLoadResult = (res) => {
    setSelectedGame(res.game);
    setLeftDigit(res.left);
    setRightDigit(res.right);
    setCalculatedJodi(res.jodi);
    setDeclaredJodi(res.jodi);
    setIsCalculated(true);
    toast.success(`Loaded result for ${res.game} (${res.date})`);
  };

  const triggerDeleteResult = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteResult = () => {
    setResultsList(prev => prev.filter(r => r.id !== targetDeleteId));
    if (declaredJodi) {
      setDeclaredJodi('');
      setCalculatedJodi('');
      setIsCalculated(false);
    }
    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
    toast.success('Result entry deleted');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-4xl shadow-sm rounded-3xl overflow-hidden border border-gray-200">
        
        {/* 1. Purple Header Banner */}
        <div className="bg-[#7c3aed] text-white py-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">Jackpot Result Admin Panel</h1>
          <p className="text-xs text-white/80 mt-1 font-semibold">Declare Jackpot Jodi</p>
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
                  className={`flex items-center gap-1 pb-3 -mb-3 transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-[#7c3aed] border-b-2 border-[#7c3aed]' 
                      : 'hover:text-gray-600'
                  }`}
                >
                  {tab === 'History' && <History size={12} />}
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'Declare Jodi' && (
            <div className="space-y-6">
              
              {/* Form Grid 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Game */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Game</label>
                  <div className="relative">
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none shadow-3xs"
                    >
                      <option value="DESAWAR">DESAWAR</option>
                      <option value="GALI">GALI</option>
                      <option value="FARIDABAD">FARIDABAD</option>
                    </select>
                    <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
                  </div>

                  {/* Jodi Declared indicator checkbox */}
                  <div className="flex items-center gap-1.5 pt-2">
                    <input
                      type="checkbox"
                      id="jodiDeclaredCheckbox"
                      checked={jodiDeclared}
                      onChange={(e) => setJodiDeclared(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer"
                    />
                    <label htmlFor="jodiDeclaredCheckbox" className="text-[10px] font-bold text-green-600 flex items-center gap-1 cursor-pointer">
                      <Check className="w-3 h-3 stroke-[3.5]" />
                      <span>Jodi Declared</span>
                    </label>
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
                      <option value="0-9">0-9</option>
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
                      <option value="0-9">0-9</option>
                      {[...Array(10).keys()].map(num => (
                        <option key={num} value={String(num)}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculated Jodi display box matching Screenshot 2 */}
              {isCalculated && calculatedJodi && (
                <div className="border border-purple-200 bg-purple-50/20 text-center py-4 rounded-xl space-y-1 shadow-3xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Calculated Jodi:</span>
                  <p className="text-4xl font-bold text-[#7c3aed]">{calculatedJodi}</p>
                </div>
              )}

              {/* Action Buttons row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleCalculateJodi}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-[0.99] text-center"
                >
                  Calculate Jodi
                </button>

                <button
                  type="button"
                  onClick={handleDeclareOrUpdateJodi}
                  className={`py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-[0.99] border ${
                    leftDigit !== '0-9' && rightDigit !== '0-9'
                      ? 'border-[#7c3aed] text-[#7c3aed] hover:bg-purple-50 bg-white'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {resultsList.some(r => r.game === selectedGame) ? 'Update Jodi' : 'Declare Jodi'}
                </button>
              </div>

              {/* Hide/Show previous results toggle matching Screenshot 4 */}
              <div className="flex flex-col items-center justify-center pt-4 border-t border-gray-150 space-y-4">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-[#f3f4f6] border border-gray-200 text-gray-650 hover:bg-gray-200 text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 cursor-pointer shadow-3xs transition-all"
                >
                  <History size={11} />
                  <span>{showHistory ? 'Hide Previous Results' : 'Show Previous Results'} ({resultsList.length})</span>
                </button>

                {showHistory && resultsList.length > 0 && (
                  <div className="w-full text-left space-y-3 bg-gray-50/50 border border-gray-150 rounded-3xl p-5 shadow-inner">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Previous Results</span>
                    <div className="flex flex-wrap gap-4">
                      {resultsList.map((res) => (
                        <div 
                          key={res.id} 
                          className="bg-white border border-gray-300 rounded-2xl p-4 w-60 text-left flex flex-col relative space-y-3 shadow-3xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-700">{res.date}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleLoadResult(res)}
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-[#7c3aed] border border-purple-100 flex items-center gap-0.5 cursor-pointer hover:bg-purple-100"
                              >
                                <Eye size={8} />
                                <span>Load</span>
                              </button>
                              <button
                                onClick={() => triggerDeleteResult(res.id)}
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-0.5 cursor-pointer hover:bg-red-100"
                              >
                                <Trash2 size={8} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="text-center space-y-0.5">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Jodi:</span>
                            <span className="text-2xl font-bold text-[#7c3aed] block">{res.jodi}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Declared Jodi card section matching Screenshot 2 bottom */}
              {declaredJodi && (
                <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-800">Declared Jodi</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          const matched = resultsList.find(r => r.jodi === declaredJodi);
                          if (matched) handleLoadResult(matched);
                        }}
                        className="px-3 py-1 border border-purple-200 text-[#7c3aed] text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-purple-50 cursor-pointer shadow-3xs"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => triggerDeleteResult(resultsList[0]?.id)}
                        className="px-3 py-1 border border-red-200 text-red-600 text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-red-50 cursor-pointer shadow-3xs"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-450 font-bold">
                    Jodi for <span className="text-gray-700 font-black">{selectedGame}</span> on {selectedDate}:
                  </p>

                  <div className="border border-purple-100 bg-purple-50/20 text-center py-5 rounded-2xl shadow-3xs">
                    <p className="text-3xl font-bold text-[#7c3aed] tracking-wider">{declaredJodi}</p>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'Winners' && (
            <div className="text-center py-10 font-semibold text-xs text-gray-400">
              No winners available for this result.
            </div>
          )}

          {activeTab === 'Losers' && (
            <div className="text-center py-10 font-semibold text-xs text-gray-400">
              No losers list generated.
            </div>
          )}

          {activeTab === 'History' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800 tracking-wide">Jodi History</h2>
              
              {resultsList.length === 0 ? (
                <div className="text-xs text-gray-400 font-semibold">
                  No commissions created yet
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {resultsList.map((res) => (
                    <div 
                      key={res.id} 
                      className="bg-white border border-gray-300 rounded-2xl p-4 w-60 text-left flex flex-col relative space-y-3 shadow-3xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700">{res.date}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoadResult(res)}
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-[#7c3aed] border border-purple-100 flex items-center gap-0.5 cursor-pointer hover:bg-purple-100"
                          >
                            <Eye size={8} />
                            <span>Load</span>
                          </button>
                          <button
                            onClick={() => triggerDeleteResult(res.id)}
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 border border-red-100 flex items-center gap-0.5 cursor-pointer hover:bg-red-100"
                          >
                            <Trash2 size={8} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-center space-y-0.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Jodi:</span>
                        <span className="text-2xl font-bold text-[#7c3aed] block">{res.jodi}</span>
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
        title="Delete Jodi Record?"
        message="Are you sure you want to delete this declared jodi result entry permanently?"
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

export default JackpotGaliResults;
