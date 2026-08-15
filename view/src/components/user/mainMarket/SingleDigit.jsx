import React from 'react';

export const SingleDigit = ({ 
  session, 
  setSession, 
  digit, 
  setDigit, 
  points, 
  setPoints, 
  handleAddMore, 
  themeColor,
  isOpenSessionOpen = true,
  isCloseSessionOpen = true
}) => {
  return (
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
            disabled={isCloseSessionOpen === false}
            onClick={() => isCloseSessionOpen !== false && setSession('Close')}
            style={{ backgroundColor: session === 'Close' && isCloseSessionOpen !== false ? themeColor : 'transparent' }}
            className={`flex-1 py-1.5 h-8 rounded-lg text-xs font-extrabold text-center transition-all flex items-center justify-center ${
              isCloseSessionOpen === false
                ? 'text-gray-400 cursor-not-allowed opacity-60'
                : session === 'Close'
                ? 'text-white shadow-3xs cursor-pointer'
                : 'text-gray-600 font-semibold cursor-pointer'
            }`}
          >
            {isCloseSessionOpen === false ? 'Close (Closed)' : 'Close'}
          </button>
        </div>
      </div>

      {/* Row 2: Single Digit Input */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Single Digit</span>
        <div className="w-44">
          <input
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setDigit(val);
            }}
            style={{ borderColor: themeColor }}
            className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
          />
        </div>
      </div>

      {/* Row 3: Points Input */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Points</span>
        <div className="w-44">
          <input
            type="text"
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

      {/* Row 4: Taller + Add More Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleAddMore}
          style={{ backgroundColor: themeColor }}
          className="px-9 py-2.5 h-10 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-2xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        >
          + Add More
        </button>
      </div>
    </div>
  );
};

export default SingleDigit;
