import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const JodiBulk = ({ 
  setBidsList, 
  themeColor 
}) => {
  const [typedJodi, setTypedJodi] = useState('');
  const [selectedJodis, setSelectedJodis] = useState([]); // e.g. ['48', '59', '10']
  const [points, setPoints] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Handle typing in 2-digit Jodi box
  const handleJodiInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setErrorBanner('');

    if (val.length === 2) {
      if (selectedJodis.includes(val)) {
        setErrorBanner(`Jodi ${val} already added!`);
        setTypedJodi('');
        toast.error(`Jodi ${val} already added!`);
      } else {
        setSelectedJodis(prev => [...prev, val]);
        setTypedJodi('');
      }
    } else {
      setTypedJodi(val);
    }
  };

  // Remove a Jodi tag
  const removeJodiTag = (jodiToRemove) => {
    setSelectedJodis(prev => prev.filter(j => j !== jodiToRemove));
  };

  // Handle Add More Bulk to main table
  const handleAddMoreBulkJodi = () => {
    if (selectedJodis.length === 0) {
      toast.error('Please enter at least one 2-digit Jodi!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const newBids = selectedJodis.map(jodi => ({
      id: Date.now() + Math.random(),
      jodi,
      points: parseInt(points, 10)
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setSelectedJodis([]);
    setPoints('');
    setErrorBanner('');
    toast.success(`${newBids.length} Jodi bids added to list! ➕`);
  };

  return (
    <div className="space-y-3">
      
      {/* Red Error Banner matching Screenshot 1 */}
      {errorBanner && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBanner}
        </div>
      )}

      {/* TOP INPUT CARD (Tight Spacing Matching Screenshot) */}
      <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-2.5">
        
        {/* Row 1: Enter Jodi (00-99) */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Enter Jodi (00-99)</span>
          <div className="w-40">
            <input
              type="text"
              maxLength={2}
              placeholder="Type 2 digits"
              value={typedJodi}
              onChange={handleJodiInputChange}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-xs outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Row 2: Selected Jodis (count) with Orange Tag Pills */}
        {selectedJodis.length > 0 && (
          <div className="space-y-1.5 py-0.5">
            <label className="block text-xs font-medium text-gray-700">
              Selected Jodis ({selectedJodis.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {selectedJodis.map((j) => (
                <div
                  key={j}
                  style={{ backgroundColor: themeColor }}
                  className="px-3 py-0.5 text-white font-bold text-xs rounded-full flex items-center gap-1 shadow-3xs"
                >
                  <span>{j}</span>
                  <button
                    type="button"
                    onClick={() => removeJodiTag(j)}
                    className="hover:text-red-200 cursor-pointer ml-0.5 text-xs"
                    title="Remove Tag"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Row 3: Points Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Points</span>
          <div className="w-40">
            <input
              type="text"
              placeholder=""
              value={points}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPoints(val);
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
            />
          </div>
        </div>

        {/* Row 4: + Add More Button */}
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={handleAddMoreBulkJodi}
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

export default JodiBulk;
