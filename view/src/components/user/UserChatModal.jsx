import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose, IoSend, IoPersonCircle, IoArrowBack, IoCheckmarkDone } from 'react-icons/io5';
import { FaHeadset } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SummaryApi from '../../common/SummerAPI';

export const UserChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('user_data') || localStorage.getItem('user');
      if (savedUserStr) {
        setUserData(JSON.parse(savedUserStr));
      }
    } catch (err) {
      console.error("Failed to parse user data:", err);
    }
  }, []);

  const userId = userData?._id || userData?.id;

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${SummaryApi.getUserChatMessages.url}?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("User fetch chat error:", err);
    }
  };

  // Lock background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (!userId) {
      toast.error("Please login to send support messages");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(SummaryApi.sendUserChatMessage.url, {
        method: SummaryApi.sendUserChatMessage.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text: messageText.trim(),
          senderName: userData?.name || 'User'
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessageText('');
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Send user chat error:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const modalUI = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-[#efeae2] sm:bg-black/60 sm:p-4 backdrop-blur-xs select-none">
      <div className="bg-[#efeae2] w-full h-full sm:h-[620px] sm:max-w-md sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-gray-200 animate-in fade-in duration-200">
        
        {/* WhatsApp Style Top Bar */}
        <div className="bg-[#075e54] p-3 text-white flex items-center justify-between shadow-md shrink-0 border-b border-[#065047]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer -ml-1"
              title="Back"
            >
              <IoArrowBack size={20} />
            </button>

            <div className="relative w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 font-bold">
              <FaHeadset size={16} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#075e54]" />
            </div>

            <div>
              <h3 className="font-bold text-xs sm:text-sm leading-tight text-white flex items-center gap-1.5">
                Royal Matka Support
              </h3>
              <p className="text-[10px] text-emerald-200 font-medium leading-none mt-0.5">
                online • 24/7 Live Agent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center text-white/80 transition-all cursor-pointer"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* WhatsApp Style Chat Wallpaper & Messages */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#efeae2] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          {!userId ? (
            <div className="text-center py-20 text-gray-600 text-xs font-semibold space-y-2">
              <IoPersonCircle size={40} className="mx-auto text-gray-400" />
              <p>Please log in to chat with customer support.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
              <div className="bg-[#fff2c6] text-[#765d14] border border-[#ffe48c] px-3.5 py-1.5 rounded-xl text-[10px] font-bold shadow-2xs max-w-xs">
                🔒 Messages are end-to-end encrypted with Royal Support.
              </div>
              <p className="text-xs font-bold text-gray-700 mt-4">How can we help you today?</p>
              <p className="text-[10px] text-gray-500">Type your query below to start live conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg._id || idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-3xs relative ${
                      isUser
                        ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none border border-[#b7ebae]'
                        : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words font-medium">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] font-bold text-gray-400">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isUser && <IoCheckmarkDone size={13} className="text-sky-600" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp Style Footer Input */}
        <form onSubmit={handleSend} className="p-2.5 bg-[#f0f2f5] border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={userId ? "Type a message..." : "Log in to chat"}
            disabled={!userId || sending}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#075e54] shadow-3xs transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!userId || sending || !messageText.trim()}
            className="w-10 h-10 rounded-full bg-[#008069] hover:bg-[#075e54] active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-md"
          >
            <IoSend size={15} />
          </button>
        </form>

      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalUI, document.body)
    : null;
};

export default UserChatModal;
