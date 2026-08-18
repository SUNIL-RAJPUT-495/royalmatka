import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const DOUBLE_PANA_MAP = {
  '1': ['100', '119', '155', '227', '335', '344', '399', '588', '669'],
  '2': ['110', '200', '228', '255', '336', '444', '499', '660', '677'],
  '3': ['111', '166', '229', '300', '337', '355', '445', '599', '779'],
  '4': ['112', '144', '177', '220', '266', '338', '400', '446', '559'],
  '5': ['113', '122', '155', '188', '233', '277', '339', '447', '500'],
  '6': ['114', '222', '288', '330', '366', '448', '455', '556', '600'],
  '7': ['115', '133', '223', '299', '344', '377', '449', '557', '665'],
  '8': ['116', '144', '224', '233', '332', '388', '440', '558', '666'],
  '9': ['117', '155', '225', '244', '333', '399', '441', '559', '667'],
  '0': ['118', '166', '226', '255', '334', '355', '442', '550', '668']
};

export const DoublePanaBulk = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true,
  isCloseSessionOpen = true,
  isMarketClosed = false
}) => {
  const [selectedDigits, setSelectedDigits] = useState([]); // Selected digit buttons, e.g. ['1']
  const [points, setPoints] = useState('');
  const [successBannerMsg, setSuccessBannerMsg] = useState('');

  // Toggle digit selection (0-9)
  const toggleDigit = (digit) => {
    setSelectedDigits(prev => 
      prev.includes(digit) ? prev.filter(d => d !== digit) : [...prev, digit]
    );
  };

  // Add 9 Double Panas for each selected digit
  const handleAddMoreDoublePanaBulk = () => {
    if (selectedDigits.length === 0) {
      toast.error('Please select at least one digit (0-9)!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = [];

    selectedDigits.forEach(digit => {
      const panas = DOUBLE_PANA_MAP[digit] || [];
      panas.forEach(pana => {
        newBids.push({
          id: Date.now() + Math.random(),
          session,
          pana,
          points: pointsNum
        });
      });
    });

    setBidsList(prev => [...prev, ...newBids]);
    setSuccessBannerMsg(`${newBids.length} panas added successfully!`);
    setSelectedDigits([]);
    setPoints('');
    setTimeout(() => setSuccessBannerMsg(''), 3500);
    toast.success(`${newBids.length} Double Pana bids added to list! ➕`);
  };

  const digitsList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="space-y-3">
      
      {/* Green Banner Notification matching Screenshot 1 */}
      {successBannerMsg && (
        <div className="bg-[#e6f9ed] text-[#16a34a] border border-[#bbf7d0] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {successBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD matching Screenshot 1 & 3 */}
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

        {/* Row 2: Select Digits (0–9) Grid matching Screenshot 1 */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">
            Select Digits (0–9)
          </label>
          
          {/* 5 columns grid matching screenshot */}
          <div className="grid grid-cols-5 gap-2">
            {digitsList.map((d) => {
              const isSelected = selectedDigits.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDigit(d)}
                  style={{ backgroundColor: isSelected ? themeColor : '#f0f2f5' }}
                  className={`py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-3xs flex flex-col items-center justify-center ${
                    isSelected ? 'text-white shadow-xs scale-[1.02]' : 'text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  <span className="font-extrabold text-sm leading-tight">{d}</span>
                  <span className={`text-[10px] font-medium leading-tight ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                    (9)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Points Input matching Screenshot 1 */}
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
            onClick={handleAddMoreDoublePanaBulk}
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

export default DoublePanaBulk;
