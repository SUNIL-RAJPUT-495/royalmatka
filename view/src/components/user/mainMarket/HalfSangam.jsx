import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const HalfSangam = ({ 
  setBidsList, 
  themeColor
}) => {
  const [sangamType, setSangamType] = useState('Open Digit Close Pana'); // 'Open Digit Close Pana' | 'Open Pana Close Digit'
  const [digit, setDigit] = useState('');
  const [pana, setPana] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const isOpenDigitClosePana = sangamType === 'Open Digit Close Pana';

  const handleAddMoreHalfSangam = () => {
    setErrorBannerMsg('');
    if (!digit || !pana || !points || parseInt(points, 10) <= 0) {
      setErrorBannerMsg('Please select digit, pana, and enter points');
      toast.error('Please enter digit, pana, and valid points!');
      return;
    }

    const newBid = {
      id: Date.now() + Math.random(),
      digit: digit.trim(),
      pana: pana.trim(),
      points: parseInt(points, 10),
      type: sangamType
    };

    setBidsList(prev => [...prev, newBid]);
    setDigit('');
    setPana('');
    setPoints('');
    setErrorBannerMsg('');
    toast.success('Half Sangam bid added to list! ➕');
  };

  return (
    <div className="space-y-3">
      
      {/* Red Error Banner matching Screenshot 1 & 4 */}
      {errorBannerMsg && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD matching Screenshot 1 & 4 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-4">
        
        {/* Row 1: Type Segmented Toggle with Clean Button Spacing */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500 shrink-0">Type</span>
          <div className="bg-[#f0f2f5] rounded-xl p-1 flex items-center gap-1 w-full max-w-[270px]">
            <button
              type="button"
              onClick={() => {
                setSangamType('Open Digit Close Pana');
                setErrorBannerMsg('');
              }}
              style={{ backgroundColor: isOpenDigitClosePana ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center leading-tight transition-all cursor-pointer ${
                isOpenDigitClosePana ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Open Digit Close Pana
            </button>
            <button
              type="button"
              onClick={() => {
                setSangamType('Open Pana Close Digit');
                setErrorBannerMsg('');
              }}
              style={{ backgroundColor: !isOpenDigitClosePana ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center leading-tight transition-all cursor-pointer ${
                !isOpenDigitClosePana ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Open Pana Close Digit
            </button>
          </div>
        </div>

        {/* Row 2: Field 1 (Open Digit or Open Pana) */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {isOpenDigitClosePana ? 'Open Digit' : 'Open Pana'}
          </span>
          <div className="w-44">
            <input
              type="text"
              maxLength={isOpenDigitClosePana ? 1 : 3}
              placeholder={isOpenDigitClosePana ? '2' : '124'}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, isOpenDigitClosePana ? 1 : 3);
                setDigit(val);
                if (errorBannerMsg) setErrorBannerMsg('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 3: Field 2 (Close Pana or Close Digit) */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {isOpenDigitClosePana ? 'Close Pana' : 'Close Digit'}
          </span>
          <div className="w-44">
            <input
              type="text"
              maxLength={isOpenDigitClosePana ? 3 : 1}
              placeholder={isOpenDigitClosePana ? '124' : '2'}
              value={pana}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, isOpenDigitClosePana ? 3 : 1);
                setPana(val);
                if (errorBannerMsg) setErrorBannerMsg('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
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

        {/* Row 5: + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreHalfSangam}
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

export default HalfSangam;
