import React, { useState } from 'react';
import { 
  FaGamepad, FaCalendarAlt, FaEdit, FaPlus, FaPaperPlane, 
  FaHistory, FaTrashAlt, FaClock
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const TipsAdmin = () => {
  // Market Info States
  const [marketName, setMarketName] = useState('MILAN MORNING');
  const [marketDate, setMarketDate] = useState('2026-08-13');
  const [marketNote, setMarketNote] = useState('');

  // Add individual prediction fields
  const [predType, setPredType] = useState('Single Ank');
  const [predValue, setPredValue] = useState('');
  const [predStatus, setPredStatus] = useState('Pending');

  // List of added predictions inside the form
  const [predictionsList, setPredictionsList] = useState([]);

  // Published history list
  const [publishedHistory, setPublishedHistory] = useState([
    {
      id: 1,
      market: 'MILAN MORNING',
      date: '13-08-2026',
      note: 'Solid Ank prediction',
      predictions: [
        { type: 'Single Ank', value: '7', status: 'Pending' },
        { type: 'Jodi', value: '75', status: 'Pending' }
      ]
    }
  ]);

  // Add prediction to individual list
  const handleAddPrediction = (e) => {
    e.preventDefault();
    if (!predValue.trim()) {
      toast.error('Please enter prediction value');
      return;
    }
    const newPred = {
      id: Date.now(),
      type: predType,
      value: predValue.trim(),
      status: predStatus
    };
    setPredictionsList(prev => [...prev, newPred]);
    setPredValue('');
    toast.success('Prediction row added!');
  };

  // Remove prediction from local table
  const handleRemovePrediction = (id) => {
    setPredictionsList(prev => prev.filter(p => p.id !== id));
  };

  // Publish tips globally
  const handlePublishTips = () => {
    if (predictionsList.length === 0) {
      toast.error('Please add at least one prediction row first');
      return;
    }

    const newHistoryItem = {
      id: Date.now(),
      market: marketName,
      date: marketDate,
      note: marketNote || 'No custom notes',
      predictions: predictionsList
    };

    setPublishedHistory(prev => [newHistoryItem, ...prev]);
    setPredictionsList([]);
    setMarketNote('');
    toast.success('Tips successfully published to live app! 🎯');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800 text-left">
      
      {/* 1. Header Banner */}
      <div className="bg-[#487463] text-white rounded-b-3xl px-6 py-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl text-white">
            <FaGamepad size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tips Admin</h1>
            <p className="text-xs text-white/80 font-medium mt-1">Create and Manage Market Predictions</p>
          </div>
        </div>

        {/* Status Capsule */}
        <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-semibold shrink-0 w-fit">
          <FaClock size={11} />
          <span>Session: Active</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 2. Main Form Card */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-150 shadow-sm space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Market Name Select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Market Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-400">
                  <FaGamepad size={12} />
                </span>
                <select
                  value={marketName}
                  onChange={(e) => setMarketName(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none focus:border-emerald-600"
                >
                  <option value="MILAN MORNING">MILAN MORNING</option>
                  <option value="MILAN DAY">MILAN DAY</option>
                  <option value="SITA MORNING">SITA MORNING</option>
                  <option value="ANDHRA DAY">ANDHRA DAY</option>
                </select>
                <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>

            {/* Market Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Market Date</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-400">
                  <FaCalendarAlt size={11} />
                </span>
                <input
                  type="date"
                  value={marketDate}
                  onChange={(e) => setMarketDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Market Note */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Market Note</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-400">
                  <FaEdit size={11} />
                </span>
                <input
                  type="text"
                  placeholder="Enter short note..."
                  value={marketNote}
                  onChange={(e) => setMarketNote(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-250 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Form List of currently added prediction rows (if any) */}
          {predictionsList.length > 0 && (
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-gray-50/50 shadow-2xs">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase">
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Value</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {predictionsList.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-bold text-gray-700">{p.type}</td>
                      <td className="py-2.5 px-4 font-semibold text-gray-650">{p.value}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePrediction(p.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <FaTrashAlt size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. + ADD INDIVIDUAL PREDICTION Card */}
          <div className="border border-dashed border-[#cbd5e1] rounded-2xl p-4 bg-gray-50/50 space-y-3">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              + Add Individual Prediction
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Type Select */}
              <div className="relative">
                <select
                  value={predType}
                  onChange={(e) => setPredType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs font-semibold cursor-pointer outline-none"
                >
                  <option value="Single Ank">Single Ank</option>
                  <option value="Jodi">Jodi</option>
                  <option value="Single Panna">Single Panna</option>
                  <option value="Double Panna">Double Panna</option>
                  <option value="Triple Panna">Triple Panna</option>
                </select>
              </div>

              {/* Value Input */}
              <input
                type="text"
                placeholder="Enter Prediction Value (e.g. 145-0)"
                value={predValue}
                onChange={(e) => setPredValue(e.target.value)}
                className="w-full md:col-span-2 px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs font-semibold outline-none"
              />

              {/* Status Select */}
              <div className="flex gap-2">
                <select
                  value={predStatus}
                  onChange={(e) => setPredStatus(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs font-semibold cursor-pointer outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddPrediction}
                  className="bg-[#487463] hover:bg-[#395c4e] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <FaPlus size={9} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Publish Action Button */}
          <button
            type="button"
            onClick={handlePublishTips}
            className={`w-full py-4.5 rounded-2xl flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-xs border transition-all active:scale-[0.99] cursor-pointer ${
              predictionsList.length > 0
                ? 'bg-emerald-650 hover:bg-emerald-700 text-white border-transparent shadow-xs'
                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane size={11} />
            <span>Publish Tips to Live App</span>
          </button>

        </div>

        {/* 4. Published History Area */}
        <div className="space-y-4 text-left">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <FaHistory size={12} className="text-gray-400" />
            <span>Published History</span>
          </h3>

          <div className="space-y-3">
            {publishedHistory.map((hist) => (
              <div 
                key={hist.id}
                className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2.5 gap-2">
                  <div>
                    <span className="font-bold text-xs text-gray-800 block uppercase">{hist.market}</span>
                    <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Date: {hist.date}</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-750 border border-emerald-100 text-[10px] font-bold px-3 py-1 rounded-full w-fit">
                    Active Tips
                  </span>
                </div>

                {/* Sub Predictions list */}
                <div className="flex flex-wrap gap-2">
                  {hist.predictions.map((p, idx) => (
                    <span 
                      key={idx}
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-3xs"
                    >
                      {p.type}: <span className="text-emerald-650">{p.value}</span> ({p.status})
                    </span>
                  ))}
                </div>

                {/* Note */}
                <p className="text-[10px] text-gray-450 font-semibold italic">
                  Note: {hist.note}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default TipsAdmin;
