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
import { SinglePana } from '../../components/user/mainMarket/SinglePana';
import { SinglePanaBulk } from '../../components/user/mainMarket/SinglePanaBulk';
import { DoublePana } from '../../components/user/mainMarket/DoublePana';
import { DoublePanaBulk } from '../../components/user/mainMarket/DoublePanaBulk';
import { TriplePana } from '../../components/user/mainMarket/TriplePana';
import { TriplePanaBulk } from '../../components/user/mainMarket/TriplePanaBulk';
import { SPMotor } from '../../components/user/mainMarket/SPMotor';
import { DPMotor } from '../../components/user/mainMarket/DPMotor';
import { OddEven } from '../../components/user/mainMarket/OddEven';
import { TwoDigitPanel } from '../../components/user/mainMarket/TwoDigitPanel';
import { SpDpTp } from '../../components/user/mainMarket/SpDpTp';
import { HalfSangam } from '../../components/user/mainMarket/HalfSangam';
import { DigitBased } from '../../components/user/mainMarket/DigitBased';
import { RedBrackets } from '../../components/user/mainMarket/RedBrackets';
import { FullSangam } from '../../components/user/mainMarket/FullSangam';

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
  const [bidsList, setBidsList] = useState([]);
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
      case 'single-pana-bulk': return 'Single Pana';
      case 'double-pana': return 'Double Patti';
      case 'double-pana-bulk': return 'Double Patti Bulk';
      case 'triple-pana': return 'Triple Pana';
      case 'triple-pana-bulk': return 'Triple Pana';
      case 'sp-motor': return 'SP Motor';
      case 'dp-motor': return 'DP Motor';
      case 'odd-even': return 'Odd / Even';
      case 'two-digit-panel': return 'Two Digit';
      case 'sp-dp-tp': return 'SP / DP / TP';
      case 'half-sangam': return 'Half Sang';
      case 'full-sangam': return 'Full Sang';
      case 'digit-based': return 'Digit Based';
      case 'red-brackets': return 'Red Brackets';
      default: return 'Single Ank';
    }
  };

  // Fetch Real User Wallet Balance on Mount & Profile Sync
  useEffect(() => {
    const fetchUserBalance = async () => {
      // 1. Try local storage user data first
      try {
        const localUserStr = localStorage.getItem("user_data") || localStorage.getItem("user");
        if (localUserStr) {
          const parsed = JSON.parse(localUserStr);
          const val = parsed.balance !== undefined ? parsed.balance : (parsed.walletBalance !== undefined ? parsed.walletBalance : null);
          if (val !== null && !isNaN(val)) {
            setWalletBalance(Number(val));
          }
        }
      } catch (e) {}

      // 2. Fetch live profile balance from API
      try {
        const response = await Axios({
          url: SummaryApi.getUserProfile?.url || '/api/user/profile',
          method: SummaryApi.getUserProfile?.method || 'get'
        });
        const profileData = response?.data?.data || response?.data;
        if (profileData) {
          const liveBal = profileData.balance !== undefined ? profileData.balance : (profileData.wallet_balance !== undefined ? profileData.wallet_balance : profileData.walletBalance);
          if (liveBal !== undefined && liveBal !== null && !isNaN(liveBal)) {
            setWalletBalance(Number(liveBal));
          }
        }
      } catch (err) {
        console.warn('Using cached wallet balance for UserBetPage');
      }
    };
    fetchUserBalance();
  }, []);

  // Handle Add More Bid (Single Digit)
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
      toast.error(`Insufficient wallet balance! Available: ₹${walletBalance.toFixed(1)}`);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.success('Bids submitted successfully! 🎉');
      setWalletBalance(prev => Math.max(0, prev - totalPointsSum));
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
      
      {/* 1. TOP NAVBAR HEADER MATCHING SCREENSHOT WITH TALLER HEIGHT */}
      <div 
        style={{ backgroundColor: themeColor }}
        className="px-4 py-3.5 h-14 flex items-center justify-between text-white shadow-sm sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-white"
          >
            <FaArrowLeft size={14} />
          </button>
          <h1 className="text-xs sm:text-sm font-bold tracking-wide">
            {decodeURIComponent(marketName).toUpperCase()} — {getModeTitle(gameMode)}
          </h1>
        </div>

        {/* WALLET BADGE WITH REAL USER BALANCE */}
        <div className="bg-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <IoWalletOutline size={14} className="text-gray-700" />
          <span className="text-xs font-extrabold text-gray-800 font-mono">
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

        {gameMode === 'single-pana' && (
          <SinglePana
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'single-pana-bulk' && (
          <SinglePanaBulk
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'double-pana' && (
          <DoublePana
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'double-pana-bulk' && (
          <DoublePanaBulk
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'triple-pana' && (
          <TriplePana
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'triple-pana-bulk' && (
          <TriplePanaBulk
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'sp-motor' && (
          <SPMotor
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'dp-motor' && (
          <DPMotor
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'odd-even' && (
          <OddEven
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'two-digit-panel' && (
          <TwoDigitPanel
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'sp-dp-tp' && (
          <SpDpTp
            session={session}
            setSession={setSession}
            setBidsList={setBidsList}
            themeColor={themeColor}
            isOpenSessionOpen={sessionStatus.isOpenSessionOpen}
          />
        )}

        {gameMode === 'half-sangam' && (
          <HalfSangam
            setBidsList={setBidsList}
            themeColor={themeColor}
          />
        )}

        {gameMode === 'full-sangam' && (
          <FullSangam
            setBidsList={setBidsList}
            themeColor={themeColor}
          />
        )}

        {gameMode === 'digit-based' && (
          <DigitBased
            setBidsList={setBidsList}
            themeColor={themeColor}
          />
        )}

        {gameMode === 'red-brackets' && (
          <RedBrackets
            setBidsList={setBidsList}
            themeColor={themeColor}
          />
        )}

        {/* 3. BIDS TABLE CARD */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-3xs overflow-hidden">
          {/* Header Row */}
          {(gameMode === 'jodi-digit' || gameMode === 'jodi-bulk' || gameMode === 'single-pana-bulk' || gameMode === 'digit-based' || gameMode === 'red-brackets') ? (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/3 text-center">{gameMode === 'single-pana-bulk' ? 'SINGLE PANA' : 'JODI'}</span>
              <span className="w-1/3 text-center">POINTS</span>
              <span className="w-1/3 text-center">ACTION</span>
            </div>
          ) : gameMode === 'half-sangam' ? (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/4 text-center">DIGIT</span>
              <span className="w-1/4 text-center">PANA</span>
              <span className="w-1/4 text-center">POINTS</span>
              <span className="w-1/4 text-center">ACTION</span>
            </div>
          ) : gameMode === 'full-sangam' ? (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/4 text-center">OPEN PANA</span>
              <span className="w-1/4 text-center">CLOSE PANA</span>
              <span className="w-1/4 text-center">POINTS</span>
              <span className="w-1/4 text-center">ACTION</span>
            </div>
          ) : (gameMode === 'odd-even' || gameMode === 'two-digit-panel' || gameMode === 'sp-dp-tp') ? (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-3 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/5 text-center">SESSION</span>
              <span className="w-1/5 text-center">PANA/DIGIT</span>
              <span className="w-1/5 text-center">POINTS</span>
              <span className="w-1/5 text-center">TYPE</span>
              <span className="w-1/5 text-center">ACTION</span>
            </div>
          ) : (
            <div className="bg-[#f8f9fc] border-b border-gray-200/80 px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-1/4 text-center">SESSION</span>
              <span className="w-1/4 text-center">{gameMode.includes('pana') ? 'PANA' : 'DIGIT'}</span>
              <span className="w-1/4 text-center">POINTS</span>
              <span className="w-1/4 text-center">ACTION</span>
            </div>
          )}

          {/* Table Data Rows (Max 7-8 bids visible, scrollbar hidden) */}
          <div className="divide-y divide-gray-100 max-h-[285px] overflow-y-auto [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {bidsList.length === 0 ? (
              <div className="p-4 text-center text-xs font-medium text-gray-400">
                No bids added yet. Enter digit & points above!
              </div>
            ) : (
              bidsList.map((bid) => (
                <div 
                  key={bid.id} 
                  className="px-3 py-2 flex items-center justify-between text-xs font-bold text-gray-800 hover:bg-gray-50/50 transition-colors"
                >
                  {(gameMode === 'jodi-digit' || gameMode === 'jodi-bulk' || gameMode === 'single-pana-bulk' || gameMode === 'digit-based' || gameMode === 'red-brackets') ? (
                    <>
                      <span className="w-1/3 text-center font-extrabold text-gray-900 text-sm">{bid.pana || bid.jodi}</span>
                      <span className="w-1/3 text-center font-extrabold text-gray-900 text-sm">₹{bid.points}</span>
                    </>
                  ) : gameMode === 'half-sangam' ? (
                    <>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.digit}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.pana}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.points}</span>
                    </>
                  ) : gameMode === 'full-sangam' ? (
                    <>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.openPana}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.closePana}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.points}</span>
                    </>
                  ) : (gameMode === 'odd-even' || gameMode === 'two-digit-panel' || gameMode === 'sp-dp-tp') ? (
                    <>
                      <span className="w-1/5 text-center text-gray-700 font-semibold">{bid.session}</span>
                      <span className="w-1/5 text-center font-extrabold text-gray-900 text-sm">{bid.pana || bid.digit}</span>
                      <span className="w-1/5 text-center font-extrabold text-gray-900 text-sm">{bid.points}</span>
                      <span className="w-1/5 flex justify-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-3xs ${
                          bid.type === 'Double' || bid.type === 'DP' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : bid.type === 'TP' 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {bid.type}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-1/4 text-center text-gray-700 font-semibold">{bid.session}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.pana || bid.digit}</span>
                      <span className="w-1/4 text-center font-extrabold text-gray-900 text-sm">{bid.points}</span>
                    </>
                  )}
                  <span className={(gameMode === 'jodi-digit' || gameMode === 'jodi-bulk' || gameMode === 'single-pana-bulk' || gameMode === 'digit-based' || gameMode === 'red-brackets') ? "w-1/3 flex justify-center" : (gameMode === 'odd-even' || gameMode === 'two-digit-panel' || gameMode === 'sp-dp-tp') ? "w-1/5 flex justify-center" : "w-1/4 flex justify-center"}>
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
