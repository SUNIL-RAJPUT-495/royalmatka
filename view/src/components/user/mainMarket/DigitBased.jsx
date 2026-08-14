import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const generateDigitBasedJodis = (digitStr) => {
  const clean = digitStr.replace(/\D/g, '').slice(0, 1);
  if (!clean) return { jodis: [], subtext: '' };

  const jodis = [];
  const targetDigit = clean;

  // Generate 10 Jodis starting with targetDigit (e.g., 5 -> 50, 51, 52... 59)
  for (let i = 0; i <= 9; i++) {
    jodis.push(`${targetDigit}${i}`);
  }

  const subtext = `Digit: ${targetDigit} — ${jodis.length} jodis found`;
  return { jodis, subtext };
};

export const DigitBased = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [digitInput, setDigitInput] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const { jodis, subtext } = generateDigitBasedJodis(digitInput);

  const handleAddMoreDigitBased = () => {
    setErrorBannerMsg('');
    const cleanDigit = digitInput.trim().replace(/\D/g, '');

    if (!cleanDigit) {
      const msg = 'Please enter a valid single digit (0-9)!';
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
    const newBids = jodis.map(jodi => ({
      id: Date.now() + Math.random(),
      jodi,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setDigitInput('');
    setPoints('');
    setErrorBannerMsg('');
    toast.success(`${newBids.length} Digit Based Jodis added to list! ➕`);
  };

  return (
    <div className="space-y-3">
      
      {/* Red Error Banner */}
      {errorBannerMsg && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-3.5">
        
        {/* Row 1: Enter Digit Input */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Select Digit (0–9)</span>
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

        {/* Row 2: Points Input */}
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

        {/* Row 3: + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreDigitBased}
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

export default DigitBased;
