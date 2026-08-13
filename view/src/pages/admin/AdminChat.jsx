import React, { useState } from 'react';
import { MessageSquare, Search, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminChat = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');

  // Default mock chat threads list
  const [threads, setThreads] = useState([
    { id: 1, name: 'Pavan (Agent)', mobile: '8079003424', messages: [{ sender: 'user', text: 'Sir withdrawal confirm kar do pleae.' }] },
    { id: 2, name: 'Amit Kumar', mobile: '9988776655', messages: [] }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const match = threads.find(t => t.mobile.includes(searchTerm) || t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (match) {
      setActiveChat(match);
      toast.success(`Chat opened with ${match.name}`);
    } else {
      toast.error('No matching user thread found');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;

    const newMsg = { sender: 'admin', text: message.trim() };
    setThreads(prev => prev.map(t => {
      if (t.id === activeChat.id) {
        return { ...t, messages: [...t.messages, newMsg] };
      }
      return t;
    }));

    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMsg]
    }));
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        
        {/* Left Side: Chat Inbox Panel */}
        <div className="md:col-span-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
          {/* Teal Header */}
          <div className="bg-[#0f766e] text-white p-4 font-bold text-xs uppercase tracking-wider rounded-t-xl shrink-0">
            Chat Inbox
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="p-3 border-b border-gray-150 flex items-center gap-2 bg-gray-50/50">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2.5 text-gray-400">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Search user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg text-[10px] font-semibold outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="bg-[#14b8a6] hover:bg-[#0d9488] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Go
            </button>
          </form>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
            {threads.length === 0 ? (
              <div className="space-y-2 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-300">
                  <MessageSquare size={18} />
                </div>
                <span className="text-[10px] font-bold block">No threads found</span>
              </div>
            ) : (
              <div className="w-full space-y-2 self-start text-left">
                {threads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveChat(t)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-2.5 cursor-pointer ${
                      activeChat?.id === t.id 
                        ? 'border-teal-500 bg-teal-50/30' 
                        : 'border-gray-200 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">
                      <User size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{t.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{t.mobile}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Conversation Panel */}
        <div className="md:col-span-3 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
          
          {activeChat ? (
            /* Open Chat panel */
            <div className="flex flex-col flex-1 h-full">
              {/* Chat Header */}
              <div className="border-b border-gray-150 p-4 bg-gray-50/80 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-800 leading-none">{activeChat.name}</h3>
                  <span className="text-[9px] text-gray-400 font-bold mt-1 block">Active user thread ({activeChat.mobile})</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#fafafa]/50 min-h-[300px]">
                {activeChat.messages.length === 0 ? (
                  <div className="text-center py-20 text-[10px] text-gray-400 font-bold">No messages. Type below to start!</div>
                ) : (
                  activeChat.messages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-xl px-4 py-2 text-xs font-medium shadow-3xs leading-relaxed ${
                        msg.sender === 'admin'
                          ? 'bg-teal-600 text-white rounded-tr-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Send Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="bg-[#0f766e] hover:bg-[#0d9488] text-white p-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          ) : (
            /* Empty Default state matching Screenshot 4 */
            <div className="flex flex-col items-center justify-center flex-1 p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-3xs">
                <MessageSquare className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Select a conversation</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                  Left panel se user select karo
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
