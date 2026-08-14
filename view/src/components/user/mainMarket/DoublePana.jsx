import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const DOUBLE_PANA_MAP = {
  '1': ['100', '119', '155', '227', '335', '344', '399', '588', '669', '777'],
  '2': ['110', '200', '228', '255', '336', '444', '499', '660', '677', '788'],
  '3': ['111', '166', '229', '300', '337', '355', '445', '599', '779', '888'],
  '4': ['112', '144', '177', '220', '266', '338', '400', '446', '559', '889'],
  '5': ['113', '122', '155', '188', '233', '277', '339', '447', '500', '999'],
  '6': ['114', '222', '288', '330', '366', '448', '455', '556', '600', '990'],
  '7': ['115', '133', '223', '299', '344', '377', '449', '557', '665', '700'],
  '8': ['116', '144', '224', '233', '332', '388', '440', '558', '666', '800'],
  '9': ['117', '155', '225', '244', '333', '399', '441', '559', '667', '900'],
  '0': ['118', '166', '226', '255', '334', '355', '442', '550', '668', '000']
};

export const DoublePana = ({ 
  session, 
  setSession, 
  setBidsList, 
  themeColor,
  isOpenSessionOpen = true
}) => {
  const [pana, setPana] = useState('');
  const [points, setPoints] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const handleAddMoreDoublePana = () => {
    setErrorBanner('');
    const cleanPana = pana.trim().replace(/\D/g, '');

    if (!cleanPana || cleanPana.length !== 3) {
      const msg = 'Please enter a valid 3-digit Double Pana!';
      setErrorBanner(msg);
      toast.error(msg);
      return;
    }

    if (!points || parseInt(points, 10) <= 0) {
      const msg = 'Please enter valid points!';
      setErrorBanner(msg);
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
    setErrorBanner('');
    toast.success('Double Pana bid added to list! ➕');
  };

  return (
    <div className="space-y-3">
      
      {/* Red Error Banner */}
      {errorBanner && (
        <div className="bg-[#fee2e2] text-[#ef4444] border border-[#fca5a5] rounded-xl px-4 py-2.5 text-xs font-bold shadow-3xs animate-in fade-in duration-200">
          {errorBanner}
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

        {/* Row 2: Enter Pana Input */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Double Pana</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={3}
              placeholder="e.g. 100"
              value={pana}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                setPana(val);
                if (errorBanner) setErrorBanner('');
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
                if (errorBanner) setErrorBanner('');
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
            onClick={handleAddMoreDoublePana}
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

export default DoublePana;
