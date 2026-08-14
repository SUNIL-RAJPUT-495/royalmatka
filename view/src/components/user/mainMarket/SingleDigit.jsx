import React from 'react';

export const SingleDigit = ({ 
  session, 
  setSession, 
  digit, 
  setDigit, 
  points, 
  setPoints, 
  handleAddMore, 
  themeColor 
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-3.5">
      {/* Row 1: Session Selector */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Session</span>
        <div className="bg-[#f0f2f5] rounded-lg p-0.5 flex items-center w-48">
          <button
            type="button"
            onClick={() => setSession('Open')}
            style={{ backgroundColor: session === 'Open' ? themeColor : 'transparent' }}
            className={`flex-1 py-1 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${
              session === 'Open' ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
            }`}
          >
            Open
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

      {/* Row 2: Single Digit Input */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Single Digit</span>
        <div className="w-32">
          <input
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setDigit(val);
            }}
            style={{ borderColor: themeColor }}
            className="w-full h-9 px-3 border rounded-lg text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
          />
        </div>
      </div>

      {/* Row 3: Points Input */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Points</span>
        <div className="w-32">
          <input
            type="text"
            value={points}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPoints(val);
            }}
            style={{ borderColor: themeColor }}
            className="w-full h-9 px-3 border rounded-lg text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
          />
        </div>
      </div>

      {/* Row 4: + Add More Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleAddMore}
          style={{ backgroundColor: themeColor }}
          className="px-6 py-2 text-white font-bold text-xs rounded-lg shadow-3xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          + Add More
        </button>
      </div>
    </div>
  );
};

export default SingleDigit;
