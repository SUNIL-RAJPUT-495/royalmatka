import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { SINGLE_PANA_MAP } from './SinglePana';
import { DOUBLE_PANA_MAP } from './DoublePana';
import { TRIPLE_PANAS } from './TriplePana';

export const SpDpTp = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [selectedTypes, setSelectedTypes] = useState(['SP', 'DP']); // Array of selected types, e.g. ['SP', 'DP']
  const [digitInput, setDigitInput] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  // Toggle Type Selection
  const toggleType = (type) => {
    setErrorBannerMsg('');
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Generate Panas for given digit & selected types
  const getGeneratedPanas = () => {
    const cleanDigit = digitInput.trim().replace(/\D/g, '').slice(0, 1);
    if (!cleanDigit) return { panasList: [], subtext: '' };

    let resultPanas = [];

    if (selectedTypes.includes('SP')) {
      const spPanas = SINGLE_PANA_MAP[cleanDigit] || [];
      spPanas.forEach(p => resultPanas.push({ pana: p, type: 'SP' }));
    }

    if (selectedTypes.includes('DP')) {
      const dpPanas = DOUBLE_PANA_MAP[cleanDigit] || [];
      dpPanas.forEach(p => resultPanas.push({ pana: p, type: 'DP' }));
    }

    if (selectedTypes.includes('TP')) {
      const tpPana = `${cleanDigit}${cleanDigit}${cleanDigit}`;
      if (TRIPLE_PANAS.includes(tpPana)) {
        resultPanas.push({ pana: tpPana, type: 'TP' });
      }
    }

    const subtext = `Digit: ${cleanDigit} — ${resultPanas.length} panas found`;
    return { panasList: resultPanas, subtext };
  };

  const { panasList, subtext } = getGeneratedPanas();

  const handleAddMoreSpDpTp = () => {
    setErrorBannerMsg('');
    const cleanDigit = digitInput.trim().replace(/\D/g, '').slice(0, 1);

    if (selectedTypes.length === 0) {
      const msg = 'Please select at least one Pana Type (SP, DP, or TP)!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    if (!cleanDigit) {
      const msg = 'Please enter a Single Digit (0-9)!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    if (!points || parseInt(points, 10) <= 0) {
      const msg = 'Please enter valid points!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    if (panasList.length === 0) {
      const msg = 'No valid panas generated for selected digit and types!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = panasList.map(item => ({
      id: Date.now() + Math.random(),
      session,
      pana: item.pana,
      type: item.type,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setDigitInput('');
    setPoints('');
    setErrorBannerMsg('');
    toast.success(`${newBids.length} bids added to list! ➕`);
  };

  return (
    <div className="space-y-3">
      
      {/* Red Warning Banner */}
      {errorBannerMsg && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-4">
        
        {/* Row 1: Taller Session Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Session</span>
          <div className="bg-[#f0f2f5] rounded-xl p-1 flex items-center w-56 h-10">
            <button
              type="button"
              disabled={!isOpenSessionOpen}
              onClick={() => isOpenSessionOpen && setSession('Open')}
              style={{ backgroundColor: session === 'Open' && isOpenSessionOpen ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 h-8 rounded-lg text-xs font-extrabold text-center transition-all flex items-center justify-center ${
                !isOpenSessionOpen
                  ? 'text-gray-400 cursor-not-allowed opacity-60'
                  : session === 'Open'
                  ? 'text-white shadow-3xs cursor-pointer'
                  : 'text-gray-600 font-semibold cursor-pointer'
              }`}
            >
              {isOpenSessionOpen ? 'Open' : 'Open (Closed)'}
            </button>
            <button
              type="button"
              onClick={() => setSession('Close')}
              style={{ backgroundColor: session === 'Close' ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 h-8 rounded-lg text-xs font-extrabold text-center transition-all cursor-pointer flex items-center justify-center ${
                session === 'Close' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Close
            </button>
          </div>
        </div>

        {/* Row 2: Pana Type Multi-Toggle Segmented Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Pana Type</span>
          <div className="bg-[#f0f2f5] rounded-xl p-1 flex items-center gap-1 w-56 h-10">
            {['SP', 'DP', 'TP'].map(type => {
              const isSelected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  style={{ backgroundColor: isSelected ? themeColor : 'transparent' }}
                  className={`flex-1 py-1.5 h-8 rounded-lg text-xs font-extrabold text-center transition-all cursor-pointer flex items-center justify-center ${
                    isSelected ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Digit (0-9) Input */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Digit (0–9)</span>
            <div className="w-44">
              <input
                type="text"
                maxLength={1}
                placeholder="e.g. 5"
                value={digitInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                  setDigitInput(val);
                  if (errorBannerMsg) setErrorBannerMsg('');
                }}
                style={{ borderColor: themeColor }}
                className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-xs outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Dynamic Subtext */}
          {subtext && (
            <div className="text-[10px] font-medium text-gray-400 text-right mt-1.5 px-0.5">
              {subtext}
            </div>
          )}
        </div>

        {/* Row 4: Points Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Points</span>
          <div className="w-44">
            <input
              type="text"
              placeholder="0"
              value={points}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPoints(val);
                if (errorBannerMsg) setErrorBannerMsg('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 5: Taller + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreSpDpTp}
            style={{ backgroundColor: themeColor }}
            className="px-9 py-2.5 h-10 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-2xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            + Add More
          </button>
        </div>

      </div>

    </div>
  );
};

export default SpDpTp;
