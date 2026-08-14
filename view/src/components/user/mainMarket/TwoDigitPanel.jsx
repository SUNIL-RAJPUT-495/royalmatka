import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const generateTwoDigitPanelPanas = (twoDigitsInput) => {
  const clean = twoDigitsInput.replace(/\D/g, '').slice(0, 2);
  if (clean.length !== 2) {
    return { 
      panas: [], 
      subtext: clean.length === 1 ? `Digits: ${clean[0]} & _ — 0 panas found` : '' 
    };
  }

  const d1 = parseInt(clean[0], 10);
  const d2 = parseInt(clean[1], 10);
  const result = [];
  const panaSet = new Set();

  for (let x = 0; x <= 9; x++) {
    const panaArr = [d1, d2, x].sort((a, b) => a - b);
    const panaStr = panaArr.join('');

    if (panaSet.has(panaStr)) continue;
    panaSet.add(panaStr);

    const distinctCount = new Set(panaArr).size;
    let type = 'Single';
    if (distinctCount === 2) {
      type = 'Double';
    } else if (distinctCount === 1) {
      type = 'Triple';
    }

    result.push({ pana: panaStr, type });
  }

  const subtext = `Digits: ${clean[0]} & ${clean[1]} — ${result.length} panas found`;
  return { panas: result, subtext };
};

export const TwoDigitPanel = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [digitsInput, setDigitsInput] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const { panas, subtext } = generateTwoDigitPanelPanas(digitsInput);

  const handleAddMoreTwoDigitPanel = () => {
    setErrorBannerMsg('');
    const cleanDigits = digitsInput.trim().replace(/\D/g, '');

    if (cleanDigits.length !== 2) {
      const msg = 'Please enter exactly 2 digits (e.g. 12 or 17) to generate 3-digit panas!';
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

    if (panas.length === 0) {
      const msg = 'No valid panas generated!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = panas.map(item => ({
      id: Date.now() + Math.random(),
      session,
      pana: item.pana,
      type: item.type,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setDigitsInput('');
    setPoints('');
    setErrorBannerMsg('');
    toast.success(`${newBids.length} Two Digit Panel bids added to list! ➕`);
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

        {/* Row 2: Enter 2 Digits Input */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Enter 2 Digits</span>
            <div className="w-44">
              <input
                type="text"
                maxLength={2}
                placeholder="e.g. 12"
                value={digitsInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setDigitsInput(val);
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

        {/* Row 3: Points Input */}
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

        {/* Row 4: Taller + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreTwoDigitPanel}
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

export default TwoDigitPanel;
