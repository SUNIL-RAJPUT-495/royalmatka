import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  FaArrowLeft,
  FaHeadset,
  FaTelegramPlane,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { IoTimeOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';
import UserChatModal from '../../components/user/UserChatModal';

export const UserContactUs = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('methods'); // 'methods' or 'message'
  const [contacts, setContacts] = useState({
    whatsapp: '',
    telegram: '',
    phone1: '',
    phone2: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const res = await Axios({
          url: SummaryApi.getContact.url,
          method: SummaryApi.getContact.method
        });
        if (res.data?.success && res.data.contact) {
          setContacts(res.data.contact);
        }
      } catch (err) {
        console.warn('Could not fetch support contact info');
      } finally {
        setLoading(false);
      }
    };
    fetchContactData();
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    let userData = null;
    try {
      const savedUserStr = localStorage.getItem('user_data') || localStorage.getItem('user');
      if (savedUserStr) userData = JSON.parse(savedUserStr);
    } catch (err) {}

    const userId = userData?._id || userData?.id;

    if (!userId) {
      toast.error('Please log in to send support messages');
      return;
    }

    setSubmitting(true);
    try {
      const fullText = subject.trim() ? `[${subject.trim()}] ${message.trim()}` : message.trim();
      const res = await fetch(SummaryApi.sendUserChatMessage.url, {
        method: SummaryApi.sendUserChatMessage.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text: fullText,
          senderName: userData?.name || 'User'
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Message sent to live support chat!');
        setMessage('');
        setSubject('');
        setIsChatModalOpen(true); // Open live chat modal so user can view response
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error("Error sending support message:", err);
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for WhatsApp click link
  const getWhatsappUrl = (num) => {
    if (!num) return '#';
    const cleanNum = num.replace(/\D/g, '');
    return `https://wa.me/${cleanNum.startsWith('91') ? cleanNum : '91' + cleanNum}`;
  };

  // Helper for Telegram click link
  const getTelegramUrl = (tg) => {
    if (!tg) return '#';
    if (tg.startsWith('http://') || tg.startsWith('https://')) return tg;
    const cleanTg = tg.replace('@', '');
    return `https://t.me/${cleanTg}`;
  };

  return (
    <div className="w-full select-none pb-12 font-sans text-left">
      {/* 1. TOP HEADER */}
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

      <div className="px-4 space-y-3.5 max-w-lg mx-auto">
        {/* 2. ORANGE 24/7 SUPPORT BANNER */}
        <div className="bg-[#f97316] text-white rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <FaHeadset size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">
                24/7 Support Channel
              </h4>
              <p className="text-[10px] text-white/90 font-normal mt-0.5">
                We're here to help anytime.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChatModalOpen(true)}
            className="bg-white text-[#f97316] hover:bg-orange-50 active:scale-95 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            Open Live Chat
          </button>
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
            {/* WHATSAPP CARD */}
            {contacts.whatsapp && (
              <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FaWhatsapp size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      WhatsApp Support
                    </h4>
                    <span className="text-[11px] text-gray-500 font-semibold block mt-0.5 font-mono">
                      {contacts.whatsapp}
                    </span>
                  </div>
                </div>

                <a
                  href={getWhatsappUrl(contacts.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25d366] hover:bg-emerald-600 active:scale-[0.99] text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                  <FaWhatsapp size={15} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            )}

            {/* TELEGRAM CARD */}
            {contacts.telegram && (
              <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                    <FaTelegramPlane size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      Telegram Channel / Support
                    </h4>
                    <a
                      href={getTelegramUrl(contacts.telegram)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-gray-500 hover:text-blue-600 font-medium break-all block mt-0.5"
                    >
                      {contacts.telegram}
                    </a>
                  </div>
                </div>

                <a
                  href={getTelegramUrl(contacts.telegram)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                >
                  <FaTelegramPlane size={14} />
                  <span>Chat on Telegram</span>
                </a>
              </div>
            )}

            {/* PHONE NUMBERS CARD */}
            {(contacts.phone1 || contacts.phone2) && (
              <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FaPhoneAlt size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      Phone Helpline Numbers
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Call our official helpline directly
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {contacts.phone1 && (
                    <a
                      href={`tel:${contacts.phone1}`}
                      className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-800 transition-colors"
                    >
                      <span>📞 {contacts.phone1} (Primary)</span>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">Call Now →</span>
                    </a>
                  )}
                  {contacts.phone2 && (
                    <a
                      href={`tel:${contacts.phone2}`}
                      className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-800 transition-colors"
                    >
                      <span>📞 {contacts.phone2} (Secondary)</span>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase">Call Now →</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* EMAIL SUPPORT CARD */}
            {contacts.email && (
              <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    Support Email
                  </h4>
                  <a
                    href={`mailto:${contacts.email}`}
                    className="text-[11px] text-gray-600 hover:text-red-600 font-semibold mt-0.5 block"
                  >
                    ✉️ {contacts.email}
                  </a>
                </div>
              </div>
            )}

            {/* BUSINESS HOURS CARD */}
            <div className="bg-white rounded-3xl p-4.5 border border-gray-150 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <IoTimeOutline size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 leading-tight">
                  Business Hours
                </h4>
                <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                  Mon - Sun: 24 Hours Open (Always Active)
                </p>
              </div>
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
              disabled={submitting}
              className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs transition-all"
            >
              <FaPaperPlane size={12} />
              <span>{submitting ? 'Sending...' : 'Send Message to Live Support'}</span>
            </button>
          </form>
        )}
      </div>

      {/* LIVE SUPPORT CHAT MODAL */}
      <UserChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
    </div>
  );
};

export default UserContactUs;
