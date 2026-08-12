import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaHeadset,
  FaTelegramPlane,
  FaPaperPlane
} from 'react-icons/fa';
import { IoTimeOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

export const UserContactUs = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('methods'); // 'methods' or 'message'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    toast.success('Message sent to support team!');
    setMessage('');
    setSubject('');
  };

  return (
    <div className="w-full select-none pb-12 font-sans">
      {/* 1. TOP HEADER (Exact match with Screenshot 1) */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs shrink-0"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
            <FaHeadset size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              Contact Us
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">
              24/7 support available
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* 2. ORANGE 24/7 SUPPORT BANNER */}
        <div className="bg-[#f97316] text-white rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
            <FaHeadset size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">
              24/7 Support
            </h4>
            <p className="text-[11px] text-white/90 font-normal mt-0.5">
              We're here to help you anytime
            </p>
          </div>
        </div>

        {/* 3. TWO TABS CONTAINER */}
        <div className="bg-white rounded-2xl p-1 border border-gray-150 shadow-2xs flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('methods')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'methods'
                ? 'bg-[#f97316] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact Methods
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'message'
                ? 'bg-[#f97316] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Send Message
          </button>
        </div>

        {activeTab === 'methods' ? (
          <div className="space-y-3.5">
            {/* 4. TELEGRAM CARD */}
            <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                  <FaTelegramPlane size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    Telegram
                  </h4>
                  <a
                    href="https://t.me/tara777original"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-gray-500 hover:text-blue-600 font-medium break-all block mt-0.5"
                  >
                    https://t.me/tara777original
                  </a>
                </div>
              </div>

              {/* Chat on Telegram button */}
              <a
                href="https://t.me/tara777original"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                <FaTelegramPlane size={13} />
                <span>Chat on Telegram</span>
              </a>
            </div>

            {/* 5. BUSINESS HOURS CARD */}
            <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <IoTimeOutline size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">
                  Business Hours
                </h4>
                <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                  Mon - Sat: 9:00 AM - 8:00 PM
                </p>
              </div>
            </div>

            {/* 6. TELEGRAM QUICK WIDGET SQUARE */}
            <div className="pt-2">
              <a
                href="https://t.me/tara777original"
                target="_blank"
                rel="noreferrer"
                className="w-20 h-20 bg-white rounded-2xl border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-all gap-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                  <FaTelegramPlane size={16} />
                </div>
                <span className="text-[10px] font-bold text-gray-800">
                  Telegram
                </span>
              </a>
            </div>
          </div>
        ) : (
          /* Send Message Form */
          <form onSubmit={handleSendMessage} className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your issue or inquiry here..."
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#f97316] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-[0.99] text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <FaPaperPlane size={12} />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserContactUs;
