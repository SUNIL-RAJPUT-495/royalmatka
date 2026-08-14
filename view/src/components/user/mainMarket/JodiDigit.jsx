import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const JodiDigit = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [jodi, setJodi] = useState('');
  const [points, setPoints] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const handleAddMoreJodi = () => {
    const cleanedJodi = jodi.trim();
    if (!cleanedJodi || cleanedJodi.length !== 2) {
      toast.error('Please enter a 2-digit Jodi (00 - 99)!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const newBid = {
      id: Date.now() + Math.random(),
      jodi: cleanedJodi,
      points: parseInt(points, 10)
    };

    setBidsList(prev => [...prev, newBid]);
    setJodi('');
    setPoints('');
    setShowSuccessBanner(true);
    setTimeout(() => setShowSuccessBanner(false), 3000);
    toast.success('Jodi added successfully!');
  };

  return (
    <div className="space-y-3">
      
      {/* Green Banner Notification (Matching Screenshot) */}
      {showSuccessBanner && (
        <div className="bg-[#e6f9ed] text-[#16a34a] border border-[#bbf7d0] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          Jodi added successfully!
        </div>
      )}

      {/* TOP INPUT CARD (Exact Match with Screenshot) */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-4">
        
        {/* Row 1: Select Jodi Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Select Jodi</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={2}
              placeholder="00"
              value={jodi}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setJodi(val);
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 2: Points Input */}
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

        {/* Row 3: Taller + Add More Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddMoreJodi}
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

export default JodiDigit;
