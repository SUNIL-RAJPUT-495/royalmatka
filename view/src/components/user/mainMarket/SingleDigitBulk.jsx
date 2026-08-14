import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const SingleDigitBulk = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [selectedDigits, setSelectedDigits] = useState([]); // Array of selected digits, e.g. ['0', '1', '3', '4']
  const [points, setPoints] = useState('');

  // Toggle digit selection (0-9)
  const toggleDigit = (digit) => {
    setSelectedDigits(prev => 
      prev.includes(digit) ? prev.filter(d => d !== digit) : [...prev, digit]
    );
  };

  // Add bulk bids for all selected digits
  const handleAddMoreBulk = () => {
    if (selectedDigits.length === 0) {
      toast.error('Please select at least one digit (0-9)!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const newBids = selectedDigits.map(digit => ({
      id: Date.now() + Math.random(),
      session,
      digit,
      points: parseInt(points, 10)
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setSelectedDigits([]);
    setPoints('');
    toast.success(`${newBids.length} Bulk bids added to list! ➕`);
  };

  const digitsList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-3xs space-y-4">
      
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

      {/* Row 2: Select Digits (0–9) Grid */}
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
                className={`h-10 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-3xs flex items-center justify-center ${
                  isSelected ? 'text-white shadow-xs scale-[1.02]' : 'text-gray-700 hover:bg-gray-200/70'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Points Input */}
      <div className="flex items-center justify-between pt-1">
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
            className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-sm outline-none bg-white focus:ring-0 shadow-3xs text-gray-800"
          />
        </div>
      </div>

      {/* Row 4: + Add More Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleAddMoreBulk}
          style={{ backgroundColor: themeColor }}
          className="px-6 py-2 text-white font-bold text-xs rounded-xl shadow-3xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          + Add More
        </button>
      </div>

    </div>
  );
};

export default SingleDigitBulk;
