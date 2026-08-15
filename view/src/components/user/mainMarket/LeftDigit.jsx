import React from 'react';

export const LeftDigit = ({
  digit,
  setDigit,
  points,
  setPoints,
  handleAddMore,
  themeColor = '#52856e'
}) => {
  const digitsList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handleDigitClick = (numStr) => {
    if (digit === numStr) {
      setDigit('');
    } else {
      setDigit(numStr);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs space-y-4">
      {/* 1. Header Label */}
      <h3 className="text-xs font-semibold text-gray-600 tracking-tight">
        Select Left Digit (0-9)
      </h3>

      {/* 2. 10-Digit Interactive Selection Grid (2 rows of 5) */}
      <div className="grid grid-cols-5 gap-2.5 my-1">
        {digitsList.map((numStr) => {
          const isSelected = digit === numStr;
          return (
            <button
              key={numStr}
              type="button"
              onClick={() => handleDigitClick(numStr)}
              style={isSelected ? { backgroundColor: themeColor } : { backgroundColor: '#f1f4f6' }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all duration-150 text-center select-none cursor-pointer active:scale-95 ${
                isSelected
                  ? 'text-white font-extrabold shadow-sm'
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              {numStr}
            </button>
          );
        })}
      </div>

      {/* 3. Points Input Row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-gray-600">Points</span>
        <div className="w-32">
          <input
            type="text"
            value={points}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPoints(val);
            }}
            placeholder=""
            style={{ borderColor: themeColor }}
            className="w-full h-10 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-900"
          />
        </div>
      </div>

      {/* 4. Add More Button (Right Aligned) */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleAddMore}
          style={{ backgroundColor: themeColor }}
          className="px-6 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        >
          + Add More
        </button>
      </div>
    </div>
  );
};

export default LeftDigit;
