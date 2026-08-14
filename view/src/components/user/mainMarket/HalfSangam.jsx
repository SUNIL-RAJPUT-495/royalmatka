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

  const handleAddMoreHalfSangam = () => {
    setErrorBannerMsg('');
    const cleanDigit = digit.trim().replace(/\D/g, '').slice(0, 1);
    const cleanPana = pana.trim().replace(/\D/g, '').slice(0, 3);

    if (!cleanDigit || !cleanPana || cleanPana.length !== 3 || !points || parseInt(points, 10) <= 0) {
      const msg = 'Please select digit, pana, and enter points';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const newBid = {
      id: Date.now() + Math.random(),
      type: sangamType,
      digit: cleanDigit,
      pana: cleanPana,
      points: parseInt(points, 10)
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
      
      {/* Red Error Banner */}
      {errorBannerMsg && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-4">
        
        {/* Row 1: Type Segmented Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500 shrink-0">Type</span>
          <div className="bg-[#f0f2f5] rounded-xl p-1 flex items-center gap-1 w-full max-w-[270px] h-10">
            <button
              type="button"
              onClick={() => {
                setSangamType('Open Digit Close Pana');
                if (errorBannerMsg) setErrorBannerMsg('');
              }}
              style={{ backgroundColor: sangamType === 'Open Digit Close Pana' ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 h-8 px-2 rounded-lg text-[10px] sm:text-xs font-extrabold text-center leading-tight transition-all cursor-pointer flex items-center justify-center ${
                sangamType === 'Open Digit Close Pana' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Open Digit Close Pana
            </button>
            <button
              type="button"
              onClick={() => {
                setSangamType('Open Pana Close Digit');
                if (errorBannerMsg) setErrorBannerMsg('');
              }}
              style={{ backgroundColor: sangamType === 'Open Pana Close Digit' ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 h-8 px-2 rounded-lg text-[10px] sm:text-xs font-extrabold text-center leading-tight transition-all cursor-pointer flex items-center justify-center ${
                sangamType === 'Open Pana Close Digit' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Open Pana Close Digit
            </button>
          </div>
        </div>

        {/* Row 2: Dynamic Inputs based on selected Sangam Type */}
        {sangamType === 'Open Digit Close Pana' ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Open Digit</span>
              <div className="w-44">
                <input
                  type="text"
                  maxLength={1}
                  placeholder="2"
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                    setDigit(val);
                    if (errorBannerMsg) setErrorBannerMsg('');
                  }}
                  style={{ borderColor: themeColor }}
                  className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Close Pana</span>
              <div className="w-44">
                <input
                  type="text"
                  maxLength={3}
                  placeholder="124"
                  value={pana}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setPana(val);
                    if (errorBannerMsg) setErrorBannerMsg('');
                  }}
                  style={{ borderColor: themeColor }}
                  className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Open Pana</span>
              <div className="w-44">
                <input
                  type="text"
                  maxLength={3}
                  placeholder="124"
                  value={pana}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setPana(val);
                    if (errorBannerMsg) setErrorBannerMsg('');
                  }}
                  style={{ borderColor: themeColor }}
                  className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Close Digit</span>
              <div className="w-44">
                <input
                  type="text"
                  maxLength={1}
                  placeholder="2"
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                    setDigit(val);
                    if (errorBannerMsg) setErrorBannerMsg('');
                  }}
                  style={{ borderColor: themeColor }}
                  className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          </>
        )}

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
            onClick={handleAddMoreHalfSangam}
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

export default HalfSangam;
