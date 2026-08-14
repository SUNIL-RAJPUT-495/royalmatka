import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const generateDigitBasedJodis = (leftInput, rightInput) => {
  const cleanLeft = leftInput.trim().replace(/\D/g, '').slice(0, 1);
  const cleanRight = rightInput.trim().replace(/\D/g, '').slice(0, 1);

  if (!cleanLeft && !cleanRight) {
    return { jodis: [], subtext: '' };
  }

  const jodisSet = new Set();

  if (cleanLeft && !cleanRight) {
    for (let i = 0; i <= 9; i++) {
      jodisSet.add(`${cleanLeft}${i}`);
    }
    const subtext = `Starting with ${cleanLeft} — ${jodisSet.size} jodis found`;
    return { jodis: Array.from(jodisSet), subtext };
  }

  if (!cleanLeft && cleanRight) {
    for (let i = 0; i <= 9; i++) {
      jodisSet.add(`${i}${cleanRight}`);
    }
    const subtext = `Ending with ${cleanRight} — ${jodisSet.size} jodis found`;
    return { jodis: Array.from(jodisSet), subtext };
  }

  // Both Left and Right entered
  for (let i = 0; i <= 9; i++) {
    jodisSet.add(`${cleanLeft}${i}`);
  }
  for (let i = 0; i <= 9; i++) {
    jodisSet.add(`${i}${cleanRight}`);
  }

  const jodis = Array.from(jodisSet);
  const subtext = `${cleanLeft}X then X${cleanRight} — ${jodis.length} jodis found`;
  return { jodis, subtext };
};

export const DigitBased = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [leftDigit, setLeftDigit] = useState('');
  const [rightDigit, setRightDigit] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');
  const [successBannerMsg, setSuccessBannerMsg] = useState('');

  const { jodis, subtext } = generateDigitBasedJodis(leftDigit, rightDigit);

  const handleAddMoreDigitBased = () => {
    setErrorBannerMsg('');
    setSuccessBannerMsg('');

    if (jodis.length === 0) {
      const msg = 'Please enter Left Digit or Right Digit (0-9)!';
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
    setLeftDigit('');
    setRightDigit('');
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
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-4">
        
        {/* Row 1: Left Digit & Right Digit side-by-side */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Left Digit</span>
              <input
                type="text"
                maxLength={1}
                placeholder="0-9"
                value={leftDigit}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                  setLeftDigit(val);
                  if (errorBannerMsg) setErrorBannerMsg('');
                  if (successBannerMsg) setSuccessBannerMsg('');
                }}
                style={{ borderColor: themeColor }}
                className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Right Digit</span>
              <input
                type="text"
                maxLength={1}
                placeholder="0-9"
                value={rightDigit}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                  setRightDigit(val);
                  if (errorBannerMsg) setErrorBannerMsg('');
                  if (successBannerMsg) setSuccessBannerMsg('');
                }}
                style={{ borderColor: themeColor }}
                className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Dynamic Subtext */}
          {subtext && (
            <div className="text-[10px] font-medium text-gray-400 text-center mt-2 px-0.5">
              {subtext}
            </div>
          )}
        </div>

        {/* Row 2: Points Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Points</span>
          <div className="w-52">
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

        {/* Row 3: Taller + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreDigitBased}
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

export default DigitBased;
