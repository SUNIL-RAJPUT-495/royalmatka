import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaShareAlt,
  FaCopy,
  FaCheckCircle,
  FaWhatsapp,
  FaTelegramPlane,
  FaGift,
  FaUsers,
  FaCoins,
  FaStepForward
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const UserShare = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const context = useOutletContext() || {};

  const localUserStr = localStorage.getItem('user_data');
  let localUser = null;
  try {
    if (localUserStr) localUser = JSON.parse(localUserStr);
  } catch (e) {}

  const user = (context.user && context.user.role !== 'Admin')
    ? context.user
    : (localUser && localUser.role !== 'Admin' ? localUser : (context.user || localUser || {}));

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Bonus settings from backend
  const [bonusRules, setBonusRules] = useState({
    referralBonus: 100,
    referredBonus: 50,
    maxReferrals: 10,
    isPercentage: false
  });

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await Axios({
          url: SummaryApi.getTransactionSettings.url,
          method: SummaryApi.getTransactionSettings.method
        });
        if (res.data?.data) {
          setBonusRules({
            referralBonus: res.data.data.referralBonus || 100,
            referredBonus: res.data.data.referredBonus || 50,
            maxReferrals: res.data.data.maxReferrals || 10,
            isPercentage: res.data.data.isPercentage || false
          });
        }
      } catch (err) {
        console.warn('Using default referral bonus rules');
      }
    };
    fetchRules();
  }, []);

  // Compute Referral Code & Link
  const myReferralCode = user.referralCode || (user.mobile ? `RM${user.mobile.slice(-6)}` : 'ROYAL777');
  const shareDomain = window.location.origin;
  const shareUrl = `${shareDomain}/register?ref=${myReferralCode}`;
  
  const shareMessage = `Play Online Matka & Casino Games on Royal Matka! 🎲\nUse my Referral Code: *${myReferralCode}* to get ₹${bonusRules.referredBonus} welcome bonus!\nDownload & Register now: ${shareUrl}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myReferralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Royal Matka',
          text: shareMessage,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Join Royal Matka with code ${myReferralCode}!`)}`;

  return (
    <div className="w-full select-none pb-12 font-sans bg-[#f8f9fa] min-h-screen text-left">
      {/* 1. TOP HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div className="flex items-center gap-2">
            <FaGift size={18} className="text-yellow-300" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Refer & Earn
            </h2>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 max-w-lg mx-auto">

        {/* 2. REWARD BANNER CARD */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="bg-white/20 border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <HiOutlineSparkles className="text-yellow-200" size={12} />
              <span>Earn Free Bonus</span>
            </span>

            <h3 className="text-lg font-black leading-tight tracking-tight">
              Invite Friends & Get {bonusRules.isPercentage ? `${bonusRules.referralBonus}%` : `₹${bonusRules.referralBonus}`} Reward!
            </h3>

            <p className="text-xs text-white/90 font-medium leading-relaxed">
              Share your referral code. When your friend registers, they get <span className="font-bold">₹{bonusRules.referredBonus}</span> and you get <span className="font-bold">{bonusRules.isPercentage ? `${bonusRules.referralBonus}%` : `₹${bonusRules.referralBonus}`}</span> credited to your wallet!
            </p>
          </div>

          <div className="absolute right-[-10px] bottom-[-10px] opacity-15 text-white pointer-events-none">
            <FaGift size={140} />
          </div>
        </div>

        {/* 3. YOUR REFERRAL CODE BOX */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Your Unique Referral Code
          </span>

          {/* CODE HIGHLIGHT BOX */}
          <div className="flex items-center justify-between bg-orange-50/60 border-2 border-dashed border-orange-300 rounded-2xl p-3.5">
            <div className="font-black text-xl tracking-wider text-gray-900 font-mono">
              {myReferralCode}
            </div>

            <button
              onClick={handleCopyCode}
              className="bg-[#f97316] hover:bg-orange-600 active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <FaCheckCircle size={12} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy size={12} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* SHARE LINK BOX */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-600 font-semibold outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="bg-gray-800 hover:bg-gray-900 active:scale-95 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {copiedLink ? <FaCheckCircle size={12} /> : <FaCopy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* 4. INSTANT SOCIAL SHARE BUTTONS */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Share Directly via Social Media
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* WHATSAPP */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25d366] hover:bg-emerald-600 active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
            >
              <FaWhatsapp size={16} />
              <span>WhatsApp</span>
            </a>

            {/* TELEGRAM */}
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
            >
              <FaTelegramPlane size={15} />
              <span>Telegram</span>
            </a>
          </div>

          {/* MORE OPTIONS SHARE */}
          <button
            onClick={handleNativeShare}
            className="w-full bg-gray-100 hover:bg-gray-200 active:scale-[0.99] text-gray-800 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs border border-gray-200"
          >
            <FaShareAlt size={13} />
            <span>More Share Options</span>
          </button>
        </div>

        {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2.5">
            How Refer & Earn Works
          </h4>

          <div className="space-y-3.5 text-xs text-gray-700">
            {/* STEP 1 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#f97316] font-extrabold flex items-center justify-center shrink-0 border border-orange-100 shadow-3xs">
                1
              </div>
              <div>
                <h5 className="font-bold text-gray-900 leading-tight">Send Invitation</h5>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Share your referral link or code with your friends on WhatsApp & Telegram.
                </p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#f97316] font-extrabold flex items-center justify-center shrink-0 border border-orange-100 shadow-3xs">
                2
              </div>
              <div>
                <h5 className="font-bold text-gray-900 leading-tight">Friend Registers</h5>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Your friend enters your code while creating their new account.
                </p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#f97316] font-extrabold flex items-center justify-center shrink-0 border border-orange-100 shadow-3xs">
                3
              </div>
              <div>
                <h5 className="font-bold text-gray-900 leading-tight">Get Rewarded</h5>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Bonus is instantly credited into your wallet balance for playing games!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. REFERRAL RULES NOTICE */}
        <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-4 text-[11px] text-gray-600 font-medium leading-relaxed">
          <span className="font-bold text-orange-600 block mb-0.5">📌 Note:</span>
          Max referral limit per user is <span className="font-bold text-gray-800">{bonusRules.maxReferrals} friends</span>. Duplicate account creations on the same IP or device are strictly prohibited.
        </div>

      </div>
    </div>
  );
};

export default UserShare;
