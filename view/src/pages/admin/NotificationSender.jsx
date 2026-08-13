import React, { useState } from 'react';
import { 
  Bell, Plus, RefreshCw, X, Send, Eye, Calendar, Trash2, Edit3, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const NotificationSender = () => {
  // Navigation / Panel State
  const [createPanelOpen, setCreatePanelOpen] = useState(false);
  
  // Form input states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [editModeId, setEditModeId] = useState(null);

  // List of active sent notifications matching Screenshot 3
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'MADHUR DAY', content: '499-27-124', date: '13 Aug 2026, 02:47 pm', reads: 0, isGlobal: true },
    { id: 2, title: 'TIME BAZAR', content: '688-27-278', date: '13 Aug 2026, 02:25 pm', reads: 0, isGlobal: true },
    { id: 3, title: 'SITA DAY', content: '289------', date: '13 Aug 2026, 02:24 pm', reads: 0, isGlobal: true }
  ]);

  const [loading, setLoading] = useState(false);

  // Delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Notifications list synced');
    }, 600);
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notificationTitle.trim() || !messageContent.trim()) {
      toast.error('Please enter notification title and content');
      return;
    }

    if (editModeId) {
      // Edit Mode
      setNotifications(prev => prev.map(item => {
        if (item.id === editModeId) {
          return {
            ...item,
            title: notificationTitle.trim().toUpperCase(),
            content: messageContent.trim(),
            isGlobal: sendToAll
          };
        }
        return item;
      }));
      toast.success('Notification updated successfully!');
      setEditModeId(null);
    } else {
      // Create Mode
      const now = new Date();
      const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
      const formattedDate = now.toLocaleDateString('en-GB', options).replace(/,/g, '');

      const newNotif = {
        id: Date.now(),
        title: notificationTitle.trim().toUpperCase(),
        content: messageContent.trim(),
        date: formattedDate,
        reads: 0,
        isGlobal: sendToAll
      };

      setNotifications(prev => [newNotif, ...prev]);
      toast.success('Notification sent successfully!');
    }

    // Reset Form
    setNotificationTitle('');
    setMessageContent('');
    setSendToAll(true);
    setCreatePanelOpen(false);
  };

  const handleEditClick = (notif) => {
    setNotificationTitle(notif.title);
    setMessageContent(notif.content);
    setSendToAll(notif.isGlobal);
    setEditModeId(notif.id);
    setCreatePanelOpen(true);
  };

  const handleDeleteClick = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setNotifications(prev => prev.filter(item => item.id !== targetDeleteId));
    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
    toast.success('Notification deleted');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-5xl space-y-6">

        {/* 1. Header Card */}
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-[#eff6ff] text-blue-600 border border-blue-50 p-2.5 rounded-xl">
              <Bell className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">Notification Management</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Send and manage user notifications
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditModeId(null);
              setNotificationTitle('');
              setMessageContent('');
              setSendToAll(true);
              setCreatePanelOpen(true);
            }}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-center"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>New Notification</span>
          </button>
        </div>

        {/* 2. Main content panels (Grid containing Form and list side-by-side or stacked) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* A. Create Notification Panel */}
          {createPanelOpen && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 md:col-span-1 relative">
              <button 
                onClick={() => setCreatePanelOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                {editModeId ? 'Edit Notification' : 'Create Notification'}
              </h2>

              <form onSubmit={handleSendNotification} className="space-y-4">
                {/* Title */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Important Update!"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                    required
                  />
                </div>

                {/* Message Content */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Message Content</label>
                  <textarea
                    placeholder="Type your notification message here..."
                    rows={4}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs resize-none"
                    required
                  />
                </div>

                {/* Send Global checkbox */}
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => setSendToAll(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-350 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Send to all users (Global Notification)</span>
                </label>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={12} />
                    <span>{editModeId ? 'Save Changes' : 'Send Notification'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* B. All Sent Notifications List */}
          <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${
            createPanelOpen ? 'md:col-span-2' : 'md:col-span-3'
          }`}>
            <div className="bg-white p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">All Notifications</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Manage your sent notifications</p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                <span className="text-xs text-gray-400 font-bold">Syncing sent notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              /* Dotted border empty state matching Screenshot 1 */
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
                <div className="border border-dashed border-gray-300 rounded-xl p-10 max-w-sm w-full flex flex-col items-center justify-center space-y-3">
                  <div className="text-gray-300">
                    <Bell size={32} className="stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">No notifications sent yet</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">
                      Create your first notification to get started.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Notifications List matching Screenshot 3 */
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-5 flex justify-between items-start gap-4 hover:bg-gray-50/40 transition-colors">
                    <div className="space-y-1.5 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs uppercase tracking-wide">{notif.title}</span>
                        {notif.isGlobal && (
                          <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-0.5">
                            <span>👥</span>
                            <span>Global</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-xs font-medium font-mono">{notif.content}</p>
                      
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{notif.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={11} />
                          <span>{notif.reads} reads</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditClick(notif)}
                        className="p-2 text-blue-550 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Edit Notification"
                      >
                        <Edit3 size={13} className="stroke-[2.2]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(notif.id)}
                        className="p-2 text-red-500 hover:bg-red-550 hover:text-white border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                        title="Delete Notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Confirmation delete modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Notification?"
        message="Are you sure you want to delete this notification record permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

    </div>
  );
};

export default NotificationSender;
