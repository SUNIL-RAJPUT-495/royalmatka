import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const HALF_RED_JODIS = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
export const FULL_RED_JODIS = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
export const ALL_RED_JODIS = [...HALF_RED_JODIS, ...FULL_RED_JODIS];

export const RedBrackets = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [redType, setRedType] = useState('All Red'); // 'All Red' | 'Half Red' | 'Full Red'
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const getJodisList = () => {
    if (redType === 'Half Red') return HALF_RED_JODIS;
    if (redType === 'Full Red') return FULL_RED_JODIS;
    return ALL_RED_JODIS;
  };

  const currentJodis = getJodisList();

  const handleAddMoreRedBrackets = () => {
    setErrorBannerMsg('');
    if (!points || parseInt(points, 10) <= 0) {
      const msg = 'Please enter valid points!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = currentJodis.map(jodi => ({
      id: Date.now() + Math.random(),
      jodi,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setPoints('');
    setErrorBannerMsg('');
    toast.success(`${newBids.length} ${redType} Jodis added to list! ➕`);
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
        
        {/* Row 1: Red Type Segmented Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500 shrink-0">Select Type</span>
          <div className="bg-[#f0f2f5] rounded-xl p-1 flex items-center gap-1 w-full max-w-[270px]">
            {['All Red', 'Half Red', 'Full Red'].map(type => {
              const isSelected = redType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setRedType(type);
                    setErrorBannerMsg('');
                  }}
                  style={{ backgroundColor: isSelected ? themeColor : 'transparent' }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold text-center leading-tight transition-all cursor-pointer ${
                    isSelected ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
                  }`}
                >
                  {type} ({type === 'All Red' ? 20 : 10})
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Subtext Info */}
        <div className="text-[10px] font-medium text-gray-400 text-right px-0.5">
          {currentJodis.length} Red Bracket Jodis selected ({redType})
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

        {/* Row 4: + Add More Button */}
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
