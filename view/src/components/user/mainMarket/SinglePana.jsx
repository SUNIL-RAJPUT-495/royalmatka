import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const SinglePana = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [pana, setPana] = useState('');
  const [points, setPoints] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const handleAddMorePana = () => {
    setErrorBanner('');
    const cleanedPana = pana.trim();
    if (!cleanedPana || cleanedPana.length !== 3) {
      setErrorBanner('Please enter both pana and points');
      toast.error('Please enter a valid 3-digit Pana!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      setErrorBanner('Please enter both pana and points');
      toast.error('Please enter valid Points!');
      return;
    }

    const newBid = {
      id: Date.now() + Math.random(),
      session,
      pana: cleanedPana,
      points: parseInt(points, 10)
    };

    setBidsList(prev => [...prev, newBid]);
    setPana('');
    setPoints('');
    setErrorBanner('');
    toast.success('Pana bid added successfully!');
  };

  return (
    <div className="space-y-3">
      
      {/* Red Error Banner matching Screenshot 2 */}
      {errorBanner && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBanner}
        </div>
      )}

      {/* TOP INPUT CARD (Exact Match with Screenshot) */}
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

        {/* Row 2: Single Digit (3 Digit Pana Input) */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Single Digit</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={3}
              placeholder="Enter 3 digit pan"
              value={pana}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                setPana(val);
                if (errorBanner) setErrorBanner('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-xs outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 3: Points Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Points</span>
          <div className="w-44">
            <input
              type="text"
              placeholder=""
              value={points}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPoints(val);
                if (errorBanner) setErrorBanner('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
            />
          </div>
        </div>

        {/* Row 4: + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMorePana}
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

export default SinglePana;
