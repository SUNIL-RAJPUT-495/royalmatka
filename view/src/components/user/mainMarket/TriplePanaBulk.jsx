import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const TRIPLE_PANAS = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];

export const TriplePanaBulk = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [selectedPanas, setSelectedPanas] = useState([]); // Selected triple pana buttons, e.g. ['000', '222']
  const [points, setPoints] = useState('');
  const [successBannerMsg, setSuccessBannerMsg] = useState('');

  // Toggle triple pana selection
  const togglePana = (pana) => {
    setSelectedPanas(prev => 
      prev.includes(pana) ? prev.filter(p => p !== pana) : [...prev, pana]
    );
  };

  // Add Triple Pana Bulk bids
  const handleAddMoreTriplePanaBulk = () => {
    if (selectedPanas.length === 0) {
      toast.error('Please select at least one Triple Pana!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = selectedPanas.map(pana => ({
      id: Date.now() + Math.random(),
      session,
      pana,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setSuccessBannerMsg(`${newBids.length} panas added successfully!`);
    setSelectedPanas([]);
    setPoints('');
    setTimeout(() => setSuccessBannerMsg(''), 3500);
    toast.success(`${newBids.length} Triple Pana bids added to list! ➕`);
  };

  return (
    <div className="space-y-3">
      
      {/* Green Banner Notification matching Screenshot 2 */}
      {successBannerMsg && (
        <div className="bg-[#e6f9ed] text-[#16a34a] border border-[#bbf7d0] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {successBannerMsg}
        </div>
      )}

      {/* TOP INPUT CARD matching Screenshot 2 */}
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

        {/* Row 2: Select Triple Pana (000–999) Grid matching Screenshot 2 */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500">
            Select Triple Pana
          </label>
          
          {/* 5 columns grid matching screenshot */}
          <div className="grid grid-cols-5 gap-2">
            {TRIPLE_PANAS.map((pana) => {
              const isSelected = selectedPanas.includes(pana);
              return (
                <button
                  key={pana}
                  type="button"
                  onClick={() => togglePana(pana)}
                  style={{ backgroundColor: isSelected ? themeColor : '#f0f2f5' }}
                  className={`py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-3xs flex items-center justify-center ${
                    isSelected ? 'text-white shadow-xs scale-[1.02]' : 'text-gray-700 hover:bg-gray-200/70'
                  }`}
                >
                  {pana}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Points Input matching Screenshot 2 */}
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
            onClick={handleAddMoreTriplePanaBulk}
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

export default TriplePanaBulk;
