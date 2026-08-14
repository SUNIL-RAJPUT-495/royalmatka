import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const FullSangam = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [openPana, setOpenPana] = useState('');
  const [closePana, setClosePana] = useState('');
  const [points, setPoints] = useState('');
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  const handleAddMoreFullSangam = () => {
    setErrorBannerMsg('');
    const cleanOpen = openPana.trim().replace(/\D/g, '');
    const cleanClose = closePana.trim().replace(/\D/g, '');

    if (cleanOpen.length !== 3 || cleanClose.length !== 3 || !points || parseInt(points, 10) <= 0) {
      const msg = 'Please enter open pana (3 digits), close pana (3 digits), and valid points';
      setErrorBannerMsg(msg);
      toast.error(msg);
      return;
    }

    const newBid = {
      id: Date.now() + Math.random(),
      openPana: cleanOpen,
      closePana: cleanClose,
      points: parseInt(points, 10)
    };

    setBidsList(prev => [...prev, newBid]);
    setOpenPana('');
    setClosePana('');
    setPoints('');
    setErrorBannerMsg('');
    toast.success('Full Sangam bid added to list! ➕');
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
        
        {/* Row 1: Open Pana Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Open Pana</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={3}
              placeholder="123"
              value={openPana}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                setOpenPana(val);
                if (errorBannerMsg) setErrorBannerMsg('');
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 2: Close Pana Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Close Pana</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={3}
              placeholder="456"
              value={closePana}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                setClosePana(val);
                if (errorBannerMsg) setErrorBannerMsg('');
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
            onClick={handleAddMoreFullSangam}
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

export default FullSangam;
