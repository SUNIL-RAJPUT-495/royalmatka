import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const generateRedBracketJodis = (digitStr) => {
  const clean = digitStr.replace(/\D/g, '').slice(0, 1);
  if (!clean) return [];

  const d = parseInt(clean, 10);
  const halfRed = `${d}${d}`;
  const cutDigit = (d + 5) % 10;
  const fullRed = `${d}${cutDigit}`;

  return Array.from(new Set([halfRed, fullRed]));
};

export const RedBrackets = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [digitInput, setDigitInput] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');
  const [successBannerMsg, setSuccessBannerMsg] = useState('');

  const generatedJodis = generateRedBracketJodis(digitInput);

  const handleAddMoreRedBrackets = () => {
    setErrorBannerMsg('');
    setSuccessBannerMsg('');

    const cleanDigit = digitInput.trim().replace(/\D/g, '').slice(0, 1);

    if (!cleanDigit) {
      const msg = 'Please enter a digit (0-9)!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }
    if (generatedJodis.length === 0) {
      const msg = 'No valid Red Jodis found!';
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

    const newBids = generatedJodis.map(jodi => ({
      id: Date.now() + Math.random(),
      jodi,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setDigitInput('');
    setPoints('');
    setErrorBannerMsg('');
    setSuccessBannerMsg(`${newBids.length} jodis added successfully!`);
    toast.success(`${newBids.length} jodis added successfully!`);
  };

  return (
    <div className="space-y-3">
      
      {/* Green Success Banner */}
      {successBannerMsg && (
        <div className="bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {successBannerMsg}
        </div>
      )}

      {/* Red Error Banner */}
      {errorBannerMsg && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-3.5">
        
        {/* Row 1: Digit (0-9) Input */}
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
                  if (successBannerMsg) setSuccessBannerMsg('');
                }}
                style={{ borderColor: themeColor }}
                className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-xs outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Orange Pill Badges for Jodis matching screenshot */}
          {generatedJodis.length > 0 && (
            <div className="flex items-center justify-end gap-1.5 mt-2 px-0.5">
              <span className="text-[10px] font-medium text-gray-400">Jodis:</span>
              <div className="flex items-center gap-1.5">
                {generatedJodis.map((jodi) => (
                  <span
                    key={jodi}
                    style={{ backgroundColor: themeColor }}
                    className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-extrabold shadow-3xs"
                  >
                    {jodi}
                  </span>
                ))}
              </div>
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
                if (successBannerMsg) setSuccessBannerMsg('');
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
            onClick={handleAddMoreRedBrackets}
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

export default RedBrackets;
