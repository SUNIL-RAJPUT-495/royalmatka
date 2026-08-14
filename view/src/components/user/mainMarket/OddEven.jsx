import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const ODD_DIGITS = ['1', '3', '5', '7', '9'];
export const EVEN_DIGITS = ['0', '2', '4', '6', '8'];

export const OddEven = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [selectedType, setSelectedType] = useState('Odd'); // 'Odd' | 'Even'
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const handleAddMoreOddEven = () => {
    setErrorBannerMsg('');
    if (!points || parseInt(points, 10) <= 0) {
      const msg = 'Please enter valid points!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const digits = selectedType === 'Odd' ? ODD_DIGITS : EVEN_DIGITS;
    const pointsNum = parseInt(points, 10);

    const newBids = digits.map(d => ({
      id: Date.now() + Math.random(),
      session,
      digit: d,
      type: selectedType,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setPoints('');
    setErrorBannerMsg('');
    toast.success(`5 ${selectedType} bids added to list! ➕`);
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

        {/* Row 2: Select Type Segmented Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Select Type</span>
          <div className="bg-[#f0f2f5] rounded-xl p-1 flex items-center w-56 h-10">
            <button
              type="button"
              onClick={() => setSelectedType('Odd')}
              style={{ backgroundColor: selectedType === 'Odd' ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 h-8 rounded-lg text-xs font-extrabold text-center transition-all cursor-pointer flex items-center justify-center ${
                selectedType === 'Odd' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Odd
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('Even')}
              style={{ backgroundColor: selectedType === 'Even' ? themeColor : 'transparent' }}
              className={`flex-1 py-1.5 h-8 rounded-lg text-xs font-extrabold text-center transition-all cursor-pointer flex items-center justify-center ${
                selectedType === 'Even' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
              }`}
            >
              Even
            </button>
          </div>
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
            onClick={handleAddMoreOddEven}
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

export default OddEven;
