import React, { useState } from 'react';
import toast from 'react-hot-toast';

export const SINGLE_PANA_MAP = {
  '1': ['128', '137', '146', '236', '245', '290', '380', '470', '489', '560', '579', '678'],
  '2': ['129', '138', '147', '156', '237', '246', '345', '390', '480', '570', '589', '679'],
  '3': ['120', '139', '148', '157', '238', '247', '256', '346', '490', '580', '670', '689'],
  '4': ['130', '149', '158', '167', '239', '248', '257', '347', '356', '590', '680', '789'],
  '5': ['140', '159', '168', '230', '249', '258', '267', '348', '357', '456', '690', '780'],
  '6': ['123', '150', '169', '178', '240', '259', '268', '349', '358', '367', '457', '790'],
  '7': ['124', '160', '179', '232', '250', '269', '278', '340', '359', '368', '458', '467'],
  '8': ['125', '134', '170', '189', '233', '260', '279', '350', '369', '378', '459', '468'],
  '9': ['126', '135', '180', '234', '270', '289', '360', '379', '450', '469', '478', '568'],
  '0': ['127', '136', '145', '190', '235', '280', '370', '389', '460', '479', '569', '578']
};

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

  const handleAddMoreSinglePana = () => {
    setErrorBanner('');
    const cleanPana = pana.trim().replace(/\D/g, '');

    if (!cleanPana || cleanPana.length !== 3) {
      const msg = 'Please enter a valid 3-digit Single Pana!';
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
    toast.success('Single Pana bid added to list! ➕');
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
          <span className="text-xs font-medium text-gray-500">Pana</span>
          <div className="w-44">
            <input
              type="text"
              maxLength={3}
              placeholder="e.g. 128"
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
            onClick={handleAddMoreSinglePana}
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

export default SinglePana;
