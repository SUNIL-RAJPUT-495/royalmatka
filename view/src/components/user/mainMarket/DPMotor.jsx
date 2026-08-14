import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const generateDPMotorPanas = (digitsStr) => {
  const cleanStr = digitsStr.replace(/\D/g, '');
  if (!cleanStr) return { panas: [], subtext: '' };

  const digitsArr = cleanStr.split('').map(Number);
  const freqMap = {};
  digitsArr.forEach(d => { freqMap[d] = (freqMap[d] || 0) + 1; });

  const uniqueDigits = Object.keys(freqMap).map(Number).sort((a, b) => a - b);
  const panasSet = new Set();

  uniqueDigits.forEach(d1 => {
    if (freqMap[d1] >= 2) {
      uniqueDigits.forEach(d2 => {
        if (d1 !== d2) {
          const panaArr = [d1, d1, d2].sort((a, b) => a - b);
          panasSet.add(panaArr.join(''));
        }
      });
    }
  });

  const panas = Array.from(panasSet).sort();
  const formattedDigits = digitsArr.join(', ');
  const subtext = `Digits: ${formattedDigits} — ${panas.length} double panas found`;
  return { panas, subtext };
};

export const DPMotor = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [digitsInput, setDigitsInput] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const { panas, subtext } = generateDPMotorPanas(digitsInput);

  const handleAddMoreDPMotor = () => {
    setErrorBannerMsg('');
    const cleanDigits = digitsInput.replace(/\D/g, '');

    if (cleanDigits.length < 3) {
      const msg = 'Pana requires 3 digits! Please enter digits with duplicate pairs (e.g. 223377).';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    if (panas.length === 0) {
      const msg = 'DP Motor requires duplicate digits to generate double panas (e.g. 223377)!';
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

    const pointsNum = parseInt(points, 10);
    const newBids = panas.map(pana => ({
      id: Date.now() + Math.random(),
      session,
      pana,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setDigitsInput('');
    setPoints('');
    setErrorBannerMsg('');
    toast.success(`${newBids.length} DP Motor bids added to list! ➕`);
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
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-3.5">
        
        {/* Row 1: Session Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Session</span>
          <div className="bg-[#f0f2f5] rounded-lg p-0.5 flex items-center w-52">
            <button
              type="button"
              disabled={!isOpenSessionOpen}
              onClick={() => isOpenSessionOpen && setSession('Open')}
              style={{ backgroundColor: session === 'Open' && isOpenSessionOpen ? themeColor : 'transparent' }}
              className={`flex-1 py-1 rounded-md text-xs font-bold text-center transition-all ${
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
              className={`flex-1 py-1 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${
                session === 'Close' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Close
            </button>
          </div>
        </div>

        {/* Row 2: Enter Digits Input */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Enter Digits</span>
            <div className="w-44">
              <input
                type="text"
                placeholder=""
                value={digitsInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDigitsInput(val);
                  if (errorBannerMsg) setErrorBannerMsg('');
                }}
                style={{ borderColor: themeColor }}
                className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
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

        {/* Row 4: + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreDPMotor}
            style={{ backgroundColor: themeColor }}
            className="px-8 py-2.5 text-white font-bold text-xs rounded-xl shadow-3xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            + Add More
          </button>
        </div>

      </div>

    </div>
  );
};

export default DPMotor;
