import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const OddEven = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [oddEvenType, setOddEvenType] = useState('Odd'); // 'Odd' | 'Even'
  const [points, setPoints] = useState('');

  const oddDigits = ['1', '3', '5', '7', '9'];
  const evenDigits = ['0', '2', '4', '6', '8'];

  const currentDigits = oddEvenType === 'Odd' ? oddDigits : evenDigits;

  const handleAddMoreOddEven = () => {
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = currentDigits.map(digit => ({
      id: Date.now() + Math.random(),
      session,
      digit,
      points: pointsNum,
      type: oddEvenType
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setPoints('');
    toast.success(`5 ${oddEvenType} bids added to list! ➕`);
  };

  return (
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

      {/* Row 2: Type Toggle (Odd | Even) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Type</span>
        <div className="bg-[#f0f2f5] rounded-lg p-0.5 flex items-center w-52">
          <button
            type="button"
            onClick={() => setOddEvenType('Odd')}
            style={{ backgroundColor: oddEvenType === 'Odd' ? themeColor : 'transparent' }}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${
              oddEvenType === 'Odd' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
            }`}
          >
            Odd
          </button>
          <button
            type="button"
            onClick={() => setOddEvenType('Even')}
            style={{ backgroundColor: oddEvenType === 'Even' ? themeColor : 'transparent' }}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${
              oddEvenType === 'Even' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
            }`}
          >
            Even
          </button>
        </div>
      </div>

      {/* Row 3: Digits Pill Indicator */}
      <div className="space-y-1.5 pt-1">
        <span className="block text-xs font-medium text-gray-500">
          {oddEvenType === 'Odd' ? 'Odd Digits' : 'Even Digits'}
        </span>
        <div className="flex items-center justify-start gap-2">
          {currentDigits.map(d => (
            <div
              key={d}
              style={{ backgroundColor: themeColor }}
              className="w-10 h-10 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-3xs scale-100"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Points Input */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-gray-500">Points</span>
        <div className="w-44">
          <input
            type="text"
            placeholder="0"
            value={points}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPoints(val);
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
          onClick={handleAddMoreOddEven}
          style={{ backgroundColor: themeColor }}
          className="px-8 py-2.5 text-white font-bold text-xs rounded-xl shadow-3xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          + Add More
        </button>
      </div>

    </div>
  );
};

export default OddEven;
