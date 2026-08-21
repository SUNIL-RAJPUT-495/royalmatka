import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Send, User, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Sparkles, Clock, Phone, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import SummaryApi from '../../common/SummerAPI';

export const AdminChat = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick template reply chips for quick admin responses
  const quickReplies = [
    "Hello! How can I help you today?",
    "Your withdrawal is under process and will be credited soon.",
    "Your deposit has been verified and added to your wallet.",
    "Please send a screenshot of the transaction details.",
    "Thank you for contacting SanwariyaBoss Support!"
  ];

  // Fetch threads list from API
  const fetchThreads = async (showToast = false) => {
    try {
      const res = await fetch(SummaryApi.getChatThreads.url);
      const data = await res.json();
      if (data.success) {
        setThreads(data.threads || []);
        if (showToast) toast.success("Chat threads updated");
      }
    } catch (err) {
      console.error("Failed to fetch chat threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Fetch messages for active thread
  const fetchMessages = async (userId) => {
    if (!userId) return;
    try {
      const res = await fetch(`${SummaryApi.getAdminChatMessages.url}/${userId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.user) {
          setActiveChat(prev => (prev && prev.id === userId ? { ...prev, ...data.user } : prev));
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Initial load + periodic polling for real-time live updates
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => {
      fetchThreads();
      if (activeChat?.id) {
        fetchMessages(activeChat.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChat?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select user thread
  const handleSelectThread = (thread) => {
    setActiveChat(thread);
    setLoadingMessages(true);
    fetchMessages(thread.id);
  };

  // Search filter
  const filteredThreads = threads.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.mobile?.includes(searchTerm)
  );

  // Send message from Admin
  const handleSendMessage = async (textToSend) => {
    const content = textToSend || message;
    if (!content.trim() || !activeChat) return;

    setSending(true);
    try {
      const res = await fetch(SummaryApi.sendAdminChatMessage.url, {
        method: SummaryApi.sendAdminChatMessage.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeChat.id,
          text: content.trim()
        })
      });
      const data = await res.json();

      if (data.success) {
        setMessage('');
        fetchMessages(activeChat.id);
        fetchThreads();
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Send error:", err);
      toast.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

  // Clear Chat History
  const handleClearChat = async () => {
    if (!activeChat) return;
    if (!window.confirm(`Are you sure you want to clear chat history with ${activeChat.name}?`)) return;

    try {
      const res = await fetch(`${SummaryApi.clearUserChat.url}/${activeChat.id}`, {
        method: SummaryApi.clearUserChat.method
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Chat history cleared");
        setMessages([]);
        fetchThreads();
      } else {
        toast.error(data.message || "Failed to clear chat");
      }
    } catch (err) {
      console.error("Clear chat error:", err);
      toast.error("Error clearing chat");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 md:p-6 font-sans text-gray-800 text-left select-none">
      
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto mb-4 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-2xl p-4 md:p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
            <MessageSquare size={22} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-wide flex items-center gap-2">
              Live Customer Support Chat
              <span className="text-[10px] bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold uppercase">
                Realtime Active
              </span>
            </h1>
            <p className="text-xs text-teal-100 font-medium">
              Manage live user inquiries, support tickets, and direct user responses in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchThreads(true)}
          className="bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={loadingThreads ? "animate-spin" : ""} />
          Refresh List
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        
        {/* Left Side: Chat Inbox Panel */}
        <div className="md:col-span-1 flex flex-col bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden min-h-[550px] max-h-[700px]">
          
          {/* Panel Header */}
          <div className="bg-slate-900 text-white p-3.5 font-bold text-xs uppercase tracking-wider rounded-t-2xl flex items-center justify-between shrink-0 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <MessageSquare size={14} className="text-teal-400" />
              Chat Inbox ({threads.length})
            </span>
            {threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0) > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0)} NEW
              </span>
            )}
          </div>

          {/* Search form */}
          <div className="p-3 border-b border-gray-100 bg-slate-50/50 shrink-0">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Search size={13} />
              </span>
              <input
                type="text"
                placeholder="Search name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loadingThreads && threads.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-400 font-medium">
                Loading user chats...
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="py-16 text-center text-gray-400 space-y-2">
                <MessageSquare size={24} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold">No chat threads found</p>
                <p className="text-[10px] text-gray-400">Users who register will appear here.</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = activeChat?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectThread(t)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer relative ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 shadow-2xs'
                        : t.unreadCount > 0
                        ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
                        : 'border-gray-100 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    {/* User Avatar Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                      isSelected 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : t.unreadCount > 0 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {t.name ? t.name.charAt(0).toUpperCase() : <User size={15} />}
                    </div>

                    {/* Thread Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-teal-900' : 'text-gray-800'}`}>
                          {t.name}
                        </p>
                        <span className="text-[9px] text-gray-400 shrink-0 font-medium">
                          {formatTime(t.lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Phone size={9} />
                        {t.mobile}
                      </p>

                      <p className="text-[11px] text-gray-500 font-normal truncate mt-1">
                        {t.lastMessage ? (
                          <span>
                            {t.lastMessageSender === 'admin' && <span className="font-semibold text-teal-600">You: </span>}
                            {t.lastMessage}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic">No messages yet</span>
                        )}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {t.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                        {t.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Conversation Panel */}
        <div className="md:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden min-h-[550px] max-h-[700px]">
          
          {activeChat ? (
            /* Open Chat Conversation */
            <div className="flex flex-col flex-1 h-full min-h-[550px]">
              
              {/* Chat Header */}
              <div className="border-b border-gray-150 p-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-black text-sm">
                    {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : <User size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      {activeChat.name}
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        activeChat.status === 'Blocked' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {activeChat.status || 'Active'}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-300 font-medium mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone size={10} className="text-teal-400" />
                        {activeChat.mobile}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet size={10} className="text-emerald-400" />
                        Balance: <strong className="text-emerald-300 font-bold">₹{activeChat.balance ?? 0}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearChat}
                    title="Clear Chat History"
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 font-bold active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Clear Chat</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 min-h-[320px]">
                {loadingMessages ? (
                  <div className="py-20 text-center text-xs text-gray-400 font-medium">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-xs font-bold text-gray-700">No message history yet</p>
                    <p className="text-[11px] text-gray-400">Send a message below or click a quick reply chip to start!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] md:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                            isAdmin
                              ? 'bg-teal-700 text-white rounded-tr-none font-medium'
                              : 'bg-white border border-gray-200/90 text-gray-800 rounded-tl-none font-medium'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <div className={`text-[9px] font-semibold mt-1 flex items-center justify-end gap-1 ${
                            isAdmin ? 'text-teal-200' : 'text-gray-400'
                          }`}>
                            <span>{formatTime(msg.createdAt)}</span>
                            {isAdmin && <CheckCircle2 size={10} className="text-teal-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="p-2 bg-slate-100 border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                <span className="text-[10px] font-bold text-gray-500 uppercase px-2 shrink-0 flex items-center gap-1">
                  <Sparkles size={11} className="text-teal-600" />
                  Quick:
                </span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(reply)}
                    className="bg-white hover:bg-teal-50 border border-gray-300/80 hover:border-teal-400 text-gray-700 hover:text-teal-800 text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-3xs"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white shrink-0"
              >
                <input
                  type="text"
                  placeholder={`Reply to ${activeChat.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300/80 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-600 focus:bg-white transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center shrink-0 gap-1.5"
                >
                  <Send size={13} />
                  <span className="text-xs hidden sm:inline">Send</span>
                </button>
              </form>

            </div>
          ) : (
            /* Empty Default State when no user selected */
            <div className="flex flex-col items-center justify-center flex-1 p-10 text-center space-y-4 min-h-[550px]">
              <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shadow-3xs border border-teal-100 animate-pulse">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800">Select a Conversation</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 max-w-xs mx-auto">
                  Left inbox panel se kisi bhi user ki chat select karein unke live messages dekhne aur reply dene ke liye.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminChat;
