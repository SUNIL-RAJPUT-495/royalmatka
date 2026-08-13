import React, { useState } from 'react';
import { 
  Check, X, History, Edit3, Trash2, Eye, Calendar, Plus, AlertCircle, RefreshCw, BarChart2, Trophy 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const ResultAdmin = () => {
  // Tabs: 'Calculate Results' | 'Winners' | 'Losers' | 'History'
  const [activeTab, setActiveTab] = useState('Calculate Results');

  // Form inputs
  const [selectedGame, setSelectedGame] = useState('SITA MORNING');
  const [selectedDate, setSelectedDate] = useState('2026-08-13');
  
  const [openPana, setOpenPana] = useState('679');
  const [closePana, setClosePana] = useState('570');

  // Interactive calculated states
  const [isCalculated, setIsCalculated] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  
  // Results History stores all declarations
  const [resultsHistory, setResultsHistory] = useState([
    { id: 1, game: 'SITA MORNING', date: '8/13/2026', openPana: '679', closePana: '570', jodi: '22', openAnk: '2', closeAnk: '2' },
    { id: 2, game: 'SITA MORNING', date: '8/12/2026', openPana: '246', closePana: '348', jodi: '25', openAnk: '2', closeAnk: '5' }
  ]);

  // Modals state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  const calculateAnk = (pana) => {
    if (!pana || pana.length !== 3) return '-';
    const sum = pana.split('').reduce((acc, digit) => acc + parseInt(digit || 0), 0);
    return String(sum % 10);
  };

  const handleCalculate = () => {
    if (openPana.length !== 3 && closePana.length !== 3) {
      toast.error('Please enter valid 3-digit open or close pana values');
      return;
    }
    setIsCalculated(true);
    toast.success('Results calculated successfully!');
  };

  const handleUpdateResults = () => {
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US');
    const opAnk = calculateAnk(openPana);
    const clAnk = calculateAnk(closePana);
    const jodiVal = (opAnk !== '-' && clAnk !== '-') ? (opAnk + clAnk) : '-';

    const matchedIndex = resultsHistory.findIndex(r => r.game === selectedGame && r.date === formattedDate);
    
    if (matchedIndex > -1) {
      // Update
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
      toast.success('Results updated successfully!');
    } else {
      // Add new
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
      toast.success('Results declared successfully!');
    }
    setIsCalculated(true);
  };

  const handleLoadResult = (res) => {
    setSelectedGame(res.game);
    setOpenPana(res.openPana);
    setClosePana(res.closePana);
    setIsCalculated(true);
    toast.success(`Loaded result for ${res.game} (${res.date})`);
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
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none shadow-3xs"
                    >
                      <option value="SITA MORNING">SITA MORNING</option>
                      <option value="SITA BAZAR">SITA BAZAR</option>
                      <option value="SITA NIGHT">SITA NIGHT</option>
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

              {/* Form Grid 2: Open & Close Pana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Open Pana */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open Pana <span className="text-blue-650">(09:40)</span></label>
                  </div>
                  <input
                    type="text"
                    maxLength={3}
                    value={openPana}
                    onChange={(e) => setOpenPana(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none shadow-3xs"
                  />
                  <span className="text-[9px] text-gray-400 font-medium block pt-0.5">Debug: openPana = "{openPana}"</span>
                </div>

                {/* Close Pana */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Close Pana <span className="text-blue-650">(10:40)</span></label>
                  </div>
                  <input
                    type="text"
                    maxLength={3}
                    value={closePana}
                    onChange={(e) => setClosePana(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none shadow-3xs"
                  />
                  <span className="text-[9px] text-gray-400 font-medium block pt-0.5">Debug: closePana = "{closePana}"</span>
                </div>
              </div>

              {/* Action Buttons row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-[0.99] text-center"
                >
                  Calculate
                </button>

                <button
                  type="button"
                  onClick={handleUpdateResults}
                  className="border border-[#2563eb] text-[#2563eb] hover:bg-blue-50 bg-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer active:scale-[0.99] text-center"
                >
                  Update Results
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

              {/* Calculated Results Panel matching Screenshot 1 */}
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

                    {/* Double Panna */}
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

                    {/* Triple Panna */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs">
                      <span className="text-gray-450 block text-[10px]">Triple Pana</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Open: <span className="text-gray-900">-</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Close: <span className="text-gray-900">-</span>
                        </div>
                      </div>
                    </div>

                    {/* Half Sang */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs">
                      <span className="text-gray-450 block text-[10px]">Half Sang</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Open Digit: <span className="text-gray-900">{openAnk}</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Close Pana: <span className="text-gray-900">{closePana}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full Sang */}
                    <div className="bg-white border border-gray-250 rounded-2xl p-4 space-y-2 shadow-3xs md:col-span-2">
                      <span className="text-gray-450 block text-[10px]">Full Sang</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Open Pana: <span className="text-gray-900">{openPana}</span>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 text-blue-800 text-center py-2 rounded-xl text-xs">
                          Close Pana: <span className="text-gray-900">{closePana}</span>
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
                        onClick={() => toast.success('Editing active declared jodi result')}
                        className="px-3 py-1 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-blue-50 cursor-pointer shadow-3xs"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
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

            </div>
          )}

          {activeTab === 'Winners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Winners Report</h3>
                  <span className="text-[10px] text-gray-400 mt-0.5 font-bold">
                    {new Date(selectedDate).toLocaleDateString('en-US')} • {selectedGame}
                  </span>
                </div>
                <div className="bg-gray-100 p-0.5 rounded-lg flex items-center gap-1 text-[9px] font-bold text-gray-500">
                  <span className="bg-white px-2.5 py-1 rounded-md text-gray-900 shadow-3xs cursor-pointer">Cards</span>
                  <span className="px-2.5 py-1 cursor-pointer">Table</span>
                </div>
              </div>

              {/* Dotted border empty state matching Losers style */}
              <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="text-gray-300">
                  <Trophy size={32} className="stroke-[1.5] text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">No Winners Found</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    No winners found for {selectedGame} on {new Date(selectedDate).toLocaleDateString('en-US')}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Losers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-800">Losers Report</h3>
                  <span className="text-[10px] text-gray-400 mt-0.5 font-bold">8/13/2026 • SITA MORNING</span>
                </div>
                <div className="bg-gray-100 p-0.5 rounded-lg flex items-center gap-1 text-[9px] font-bold text-gray-500">
                  <span className="bg-white px-2.5 py-1 rounded-md text-gray-900 shadow-3xs cursor-pointer">Cards</span>
                  <span className="px-2.5 py-1 cursor-pointer">Table</span>
                </div>
              </div>

              {/* Dotted border empty state matching Screenshot 3 */}
              <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="text-gray-300">
                  <BarChart2 size={32} className="stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">No Losers Found</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">
                    No losers found for SITA MORNING on 8/13/2026.
                  </p>
                </div>
              </div>
            </div>
          )}

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
