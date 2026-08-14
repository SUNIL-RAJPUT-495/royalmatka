import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft } from 'react-icons/fa';
import { IoWalletOutline } from 'react-icons/io5';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';

import { fetchGame } from '../../utils/api';
import { getMarketSessionStatus } from '../../utils/marketTiming';

// Modular Main Market Components
import { SingleDigit } from '../../components/user/mainMarket/SingleDigit';
import { SingleDigitBulk } from '../../components/user/mainMarket/SingleDigitBulk';
import { JodiDigit } from '../../components/user/mainMarket/JodiDigit';
import { JodiBulk } from '../../components/user/mainMarket/JodiBulk';

export const UserBetPage = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { marketName = 'MILAN DAY', gameMode = 'single-digit' } = useParams();
  const decodedMarketName = decodeURIComponent(marketName).toUpperCase();

  // Theme Accent Color (#f97316 orange matching screenshot)
  const themeColor = currentTheme?.headerBgColor || currentTheme?.playBtnBg || '#f97316';

  // State
  const [walletBalance, setWalletBalance] = useState(114.0);
  const [session, setSession] = useState('Open'); // 'Open' | 'Close'
  const [digit, setDigit] = useState('');
  const [points, setPoints] = useState('');
  const [bidsList, setBidsList] = useState(() => {
    if (gameMode === 'jodi-digit' || gameMode === 'jodi-bulk') {
      return [
        { id: 1, jodi: '10', points: 10 },
        { id: 2, jodi: '45', points: 10 }
      ];
    }
    return [
      { id: 1, session: 'Close', digit: '1', points: 10 },
      { id: 2, session: 'Open', digit: '7', points: 10 }
    ];
  });
  const [submitting, setSubmitting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState({
    isOpenSessionOpen: true,
    isCloseSessionOpen: true,
    isMarketClosed: false
  });

  // Fetch Market Timing & Session Status
  useEffect(() => {
    const loadMarketInfo = async () => {
      try {
        const gamesList = await fetchGame();
        if (Array.isArray(gamesList)) {
          const match = gamesList.find(
            (g) => (g.market_name || g.name || '').toUpperCase() === decodedMarketName
          );
          if (match) {
            const status = getMarketSessionStatus(match);
            setSessionStatus(status);
            if (!status.isOpenSessionOpen && status.isCloseSessionOpen) {
              setSession('Close'); // Auto switch session to Close if Open result time passed
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching market timing in bet page:', err);
      }
    };
    loadMarketInfo();
  }, [decodedMarketName]);

  // Map mode ID to title string
  const getModeTitle = (mode) => {
    switch (mode) {
      case 'single-digit': return 'Single Ank';
      case 'single-digit-bulk': return 'Single Digit Bulk';
      case 'jodi-digit': return 'Jodi';
      case 'jodi-bulk': return 'Jodi';
      case 'single-pana': return 'Single Pana';
      case 'double-pana': return 'Double Pana';
      case 'triple-pana': return 'Triple Pana';
      case 'sp-motor': return 'SP Motor';
      case 'dp-motor': return 'DP Motor';
      default: return 'Single Ank';
    }
  };

  // Fetch Wallet Balance
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const response = await Axios({
          url: SummaryApi.userProfile?.url || '/api/user/profile',
          method: 'get'
        });
        if (response?.data?.data?.wallet_balance !== undefined) {
          setWalletBalance(response.data.data.wallet_balance);
        } else if (response?.data?.wallet_balance !== undefined) {
          setWalletBalance(response.data.wallet_balance);
        }
      } catch (err) {
        console.warn('Using cached wallet balance');
      }
    };
    fetchUserBalance();
  }, []);

  // Handle Add More Bid
  const handleAddMore = () => {
    if (!digit.trim()) {
      toast.error('Please enter Single Digit!');
      return;
    }
    if (!points || parseInt(points, 10) <= 0) {
      toast.error('Please enter valid Points!');
      return;
    }

    const newBid = {
      id: Date.now(),
      session,
      digit: digit.trim(),
      points: parseInt(points, 10)
    };

    setBidsList(prev => [...prev, newBid]);
    setDigit('');
    setPoints('');
    toast.success('Bid added to list!');
  };

  // Remove Bid from list
  const handleRemoveBid = (id) => {
    setBidsList(prev => prev.filter(b => b.id !== id));
  };

  // Calculated totals
  const totalBidsCount = bidsList.length;
  const totalPointsSum = bidsList.reduce((acc, curr) => acc + (curr.points || 0), 0);

  // Submit All Bids
  const handleSubmitBids = async () => {
    if (bidsList.length === 0) {
      toast.error('Please add at least one bid to submit!');
      return;
    }

    if (totalPointsSum > walletBalance) {
      toast.error('Insufficient wallet balance! Please add funds.');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.success('Bids submitted successfully! 🎉');
      setWalletBalance(prev => prev - totalPointsSum);
      setBidsList([]);
    } catch (error) {
      console.error('Error submitting bids:', error);
      toast.error('Failed to submit bids.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] font-sans pb-24 select-none max-w-md mx-auto relative">
      
      {/* 1. TOP NAVBAR HEADER MATCHING SCREENSHOT */}
      <div 
        style={{ backgroundColor: themeColor }}
        className="px-4 py-3 flex items-center justify-between text-white shadow-3xs sticky top-0 z-20"
      >
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate(-1)}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-white"
          >
            <FaArrowLeft size={13} />
          </button>
          <h1 className="text-xs font-bold tracking-wide">
            {decodeURIComponent(marketName).toUpperCase()} — {getModeTitle(gameMode)}
          </h1>
        </div>

        {/* WALLET BADGE MATCHING SCREENSHOT */}
        <div className="bg-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-3xs">
          <IoWalletOutline size={13} className="text-gray-700" />
          <span className="text-[11px] font-bold text-gray-800 font-mono">
            {walletBalance.toFixed(1)}
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="p-3.5 space-y-3.5">

        {/* 2. DYNAMIC MAIN MARKET MODULAR COMPONENT BASED ON GAME MODE */}
        {gameMode === 'single-digit' && (
          <SingleDigit
            session={session}
            setSession={setSession}
            digit={digit}
            setDigit={setDigit}
            points={points}
            setPoints={setPoints}
            handleAddMore={handleAddMore}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'single-digit-bulk' && (
          <SingleDigitBulk
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'jodi-digit' && (
          <JodiDigit
            setBidsList={setBidsList}
            themeColor={themeColor}
          />
        )}

        {gameMode === 'jodi-bulk' && (
          <JodiBulk
            setBidsList={setBidsList}
            themeColor={themeColor}
          />
        )}

        {/* 3. BIDS TABLE CARD */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-3xs overflow-hidden">
          {/* Header Row */}
          {(gameMode === 'jodi-digit' || gameMode === 'jodi-bulk') ? (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/3 text-center">JODI</span>
              <span className="w-1/3 text-center">POINTS</span>
              <span className="w-1/3 text-center">ACTION</span>
            </div>
          ) : (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/4 text-center">SESSION</span>
              <span className="w-1/4 text-center">DIGIT</span>
              <span className="w-1/4 text-center">POINTS</span>
              <span className="w-1/4 text-center">ACTION</span>
            </div>
          )}

          {/* Table Data Rows */}
          <div className="divide-y divide-gray-100">
            {bidsList.length === 0 ? (
              <div className="p-4 text-center text-xs font-medium text-gray-400">
                No bids added yet. Enter digit & points above!
              </div>
            ) : (
              bidsList.map((bid) => (
                <div 
                  key={bid.id} 
                  className="px-4 py-2 flex items-center justify-between text-xs font-bold text-gray-800 hover:bg-gray-50/50 transition-colors"
                >
                  {(gameMode === 'jodi-digit' || gameMode === 'jodi-bulk') ? (
                    <>
                      <span className="w-1/3 text-center font-extrabold text-gray-900 text-sm">{bid.jodi}</span>
                      <span className="w-1/3 text-center font-extrabold text-gray-900 text-sm">{bid.points}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1/4 text-center text-gray-700 font-semibold">{bid.session}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.digit}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.points}</span>
                    </>
                  )}
                  <span className={(gameMode === 'jodi-digit' || gameMode === 'jodi-bulk') ? "w-1/3 flex justify-center" : "w-1/4 flex justify-center"}>
                    <button
                      type="button"
                      onClick={() => handleRemoveBid(bid.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-light p-0.5 cursor-pointer transition-colors"
                      title="Remove Bid"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. FIXED BOTTOM BAR (FOOTER) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200/80 px-5 py-3 flex items-center justify-between shadow-2xl z-30">
        
        {/* Left Stats */}
        <div className="flex items-center gap-5">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">BIDS</div>
            <div className="text-lg font-black text-gray-900 leading-tight">{totalBidsCount}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">POINTS</div>
            <div className="text-lg font-black text-gray-900 leading-tight">{totalPointsSum}</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmitBids}
          disabled={submitting}
          style={{ backgroundColor: themeColor }}
          className="px-7 py-2.5 text-white font-bold text-xs rounded-full shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>

      </div>

    </div>
  );
};

export default UserBetPage;
