import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const TRIPLE_PANAS = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];

export const TriplePana = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [pana, setPana] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');
  const [successBannerMsg, setSuccessBannerMsg] = useState('');

  const handleAddMoreTriplePana = () => {
    setErrorBannerMsg('');
    setSuccessBannerMsg('');

    const cleanPana = pana.trim().replace(/\D/g, '');

    if (!cleanPana || cleanPana.length !== 3) {
      const msg = 'Please enter a valid 3-digit Triple Pana (e.g. 000, 111)!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    if (!TRIPLE_PANAS.includes(cleanPana)) {
      const msg = 'Invalid Triple Pana! Must be 000, 111, 222... 999';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    if (!points || parseInt(points, 10) <= 0) {
      const msg = 'Please enter valid points!';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const newBid = {
      id: Date.now() + Math.random(),
      session,
      pana: cleanPana,
      points: parseInt(points, 10)
    };

    setBidsList(prev => [...prev, newBid]);
    setPana('');
    setPoints('');
    setErrorBannerMsg('');
    setSuccessBannerMsg('Pana added successfully!');
    toast.success('Pana added successfully!');
  };

  return (
    <div className="space-y-3">
      
      {/* Green Success Banner */}
      {successBannerMsg && (
        <div className="bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {successBannerMsg}
        </div>
      )}

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

        {/* Row 2: Enter Pana Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Triple Pana</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={3}
              placeholder="e.g. 000"
              value={pana}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                setPana(val);
                if (errorBannerMsg) setErrorBannerMsg('');
                if (successBannerMsg) setSuccessBannerMsg('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
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
                if (successBannerMsg) setSuccessBannerMsg('');
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
            onClick={handleAddMoreTriplePana}
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

export default TriplePana;
