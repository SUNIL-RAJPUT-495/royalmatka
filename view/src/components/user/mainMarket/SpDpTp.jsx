import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { SINGLE_PANA_MAP } from './SinglePanaBulk';
import { DOUBLE_PANA_MAP } from './DoublePanaBulk';

export const TRIPLE_PANA_MAP = {
  '1': ['111'], '2': ['222'], '3': ['333'], '4': ['444'], '5': ['555'],
  '6': ['666'], '7': ['777'], '8': ['888'], '9': ['999'], '0': ['000']
};

export const SpDpTp = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [selectedPanaTypes, setSelectedPanaTypes] = useState(['SP', 'DP']); // ['SP', 'DP', 'TP']
  const [digit, setDigit] = useState('');
  const [points, setPoints] = useState('');

  // Toggle Pana Type (SP, DP, TP)
  const togglePanaType = (type) => {
    setSelectedPanaTypes(prev => 
      prev.includes(type)
        ? prev.length > 1 ? prev.filter(t => t !== type) : prev // keep at least one
        : [...prev, type]
    );
  };

  // Generate Panas based on selected Pana Types & Entered Digit
  const generatePanas = () => {
    const cleanDigit = digit.trim();
    if (!cleanDigit || !/^[0-9]$/.test(cleanDigit)) {
      return { panasWithTypes: [], subtext: '' };
    }

    const panasWithTypes = [];
    if (selectedPanaTypes.includes('SP')) {
      const spList = SINGLE_PANA_MAP[cleanDigit] || [];
      spList.forEach(p => panasWithTypes.push({ pana: p, type: 'SP' }));
    }
    if (selectedPanaTypes.includes('DP')) {
      const dpList = DOUBLE_PANA_MAP[cleanDigit] || [];
      dpList.forEach(p => panasWithTypes.push({ pana: p, type: 'DP' }));
    }
    if (selectedPanaTypes.includes('TP')) {
      const tpList = TRIPLE_PANA_MAP[cleanDigit] || [];
      tpList.forEach(p => panasWithTypes.push({ pana: p, type: 'TP' }));
    }

    const subtext = `Digit: ${cleanDigit} — ${panasWithTypes.length} panas found`;
    return { panasWithTypes, subtext };
  };

  const { panasWithTypes, subtext } = generatePanas();

  const handleAddMoreSpDpTp = () => {
    if (!digit || !/^[0-9]$/.test(digit)) {
      toast.error('Please enter a valid single digit (0-9)!');
      return;
    }
    if (panasWithTypes.length === 0) {
      toast.error('Please select at least one Pana Type (SP, DP, TP)!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const pointsNum = parseInt(points, 10);
    const newBids = panasWithTypes.map(item => ({
      id: Date.now() + Math.random(),
      session,
      pana: item.pana,
      type: item.type,
      points: pointsNum
    }));

    setBidsList(prev => [...prev, ...newBids]);
    setDigit('');
    setPoints('');
    toast.success(`${newBids.length} SP/DP/TP bids added to list! ➕`);
  };

  return (
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

      {/* Row 2: Pana Type Multi-Toggle [ SP ] [ DP ] [ TP ] matching Screenshot 2 & 5 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Pana Type</span>
        <div className="bg-[#f0f2f5] rounded-lg p-0.5 flex items-center w-52 gap-0.5">
          {['SP', 'DP', 'TP'].map((type) => {
            const isSelected = selectedPanaTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => togglePanaType(type)}
                style={{ backgroundColor: isSelected ? themeColor : 'transparent' }}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold text-center transition-all cursor-pointer ${
                  isSelected ? 'text-white shadow-3xs' : 'text-gray-600 font-semibold'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Digit (0-9) Input */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Digit (0–9)</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={1}
              placeholder="e.g. 5"
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                setDigit(val);
              }}
              style={{ borderColor: themeColor }}
              className="w-full h-9 px-3 border-2 rounded-xl text-center font-bold text-xs outline-none bg-white focus:ring-0 shadow-3xs text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Dynamic Subtext underneath input box matching Screenshot 5 */}
        {subtext && (
          <div className="text-[10px] font-medium text-gray-400 text-right mt-1.5 px-0.5">
            {subtext}
          </div>
        )}
      </div>

      {/* Row 4: Points Input */}
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

      {/* Row 5: + Add More Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleAddMoreSpDpTp}
          style={{ backgroundColor: themeColor }}
          className="px-8 py-2.5 text-white font-bold text-xs rounded-xl shadow-3xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          + Add More
        </button>
      </div>

    </div>
  );
};

export default SpDpTp;
