import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoSend, IoChatbubbleEllipses, IoPersonCircle } from 'react-icons/io5';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] h-[550px] border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
              <IoChatbubbleEllipses size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                Live Support Chat
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-teal-100 font-medium">
                Ask any question or get help with deposit/withdrawal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/70">
          {!userId ? (
            <div className="text-center py-16 text-gray-500 text-xs font-semibold space-y-2">
              <IoPersonCircle size={36} className="mx-auto text-gray-300" />
              <p>Please log in to chat with customer support.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <IoChatbubbleEllipses size={32} className="mx-auto text-teal-500/50" />
              <p className="text-xs font-bold text-gray-700">How can we help you today?</p>
              <p className="text-[10px] text-gray-400">Type your message below to start chatting with support.</p>
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
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-3xs leading-relaxed ${
                      isUser
                        ? 'bg-teal-700 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <span className={`text-[8px] font-semibold block text-right mt-1 ${
                      isUser ? 'text-teal-200' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-150 bg-white flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={userId ? "Type a message..." : "Log in to chat"}
            disabled={!userId || sending}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-600 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!userId || sending || !messageText.trim()}
            className="w-10 h-10 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-sm"
          >
            <IoSend size={15} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default UserChatModal;
