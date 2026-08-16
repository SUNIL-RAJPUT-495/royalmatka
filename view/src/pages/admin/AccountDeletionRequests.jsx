import React, { useState, useEffect } from 'react';
import { FaUserTimes, FaTrashAlt, FaCheckCircle, FaTimesCircle, FaClock, FaPhoneAlt, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const AccountDeletionRequests = () => {
  // Tabs: 'Pending' | 'Approved' | 'Rejected' | 'All'
  const [activeTab, setActiveTab] = useState('Pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        url: SummaryApi.getAccountDeletionRequests.url,
        method: SummaryApi.getAccountDeletionRequests.method
      });
      if (res?.data?.success) {
        setRequests(res.data.requests || []);
      } else {
        toast.error('Failed to load account deletion requests');
      }
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId, mobile) => {
    if (!window.confirm(`Are you sure you want to approve deletion for user ${mobile}? This will PERMANENTLY delete the user from database.`)) {
      return;
    }
    try {
      setActionId(requestId);
      const res = await Axios({
        url: SummaryApi.approveAccountDeletionRequest.url,
        method: SummaryApi.approveAccountDeletionRequest.method,
        data: { requestId }
      });
      if (res?.data?.success) {
        toast.success(res.data.message || 'Account deletion approved & user deleted from DB!');
        fetchRequests();
      } else {
        toast.error(res?.data?.message || 'Failed to approve deletion request.');
      }
    } catch (error) {
      console.error('Error approving deletion request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId, mobile) => {
    if (!window.confirm(`Are you sure you want to reject the deletion request for ${mobile}?`)) {
      return;
    }
    try {
      setActionId(requestId);
      const res = await Axios({
        url: SummaryApi.rejectAccountDeletionRequest.url,
        method: SummaryApi.rejectAccountDeletionRequest.method,
        data: { requestId }
      });
      if (res?.data?.success) {
        toast.success(res.data.message || 'Deletion request rejected!');
        fetchRequests();
      } else {
        toast.error(res?.data?.message || 'Failed to reject request.');
      }
    } catch (error) {
      console.error('Error rejecting deletion request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteRecord = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request record?')) {
      return;
    }
    try {
      setActionId(requestId);
      const res = await Axios({
        url: `${SummaryApi.deleteAccountDeletionRequest.url}/${requestId}`,
        method: SummaryApi.deleteAccountDeletionRequest.method
      });
      if (res?.data?.success) {
        toast.success(res.data.message || 'Request record deleted!');
        fetchRequests();
      } else {
        toast.error(res?.data?.message || 'Failed to delete request record.');
      }
    } catch (error) {
      console.error('Error deleting request record:', error);
      toast.error(error.response?.data?.message || 'Failed to delete request record');
    } finally {
      setActionId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'All') return true;
    return req.status === activeTab;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800 text-left">
      
      {/* 1. Page Title Header Area */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 border-b border-gray-200 pb-5">
        <div className="text-red-500 p-2.5 rounded-2xl shadow-3xs border border-red-100 bg-red-50">
          <FaUserTimes size={26} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
            Account Deletion Requests
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Users ki delete requests. <span className="font-bold text-gray-800">Approve</span> karne par account + related data permanently delete ho jata hai.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 2. Custom Filter Pills */}
        <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
          {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => {
            const isActive = activeTab === tab;
            let activeClass = 'bg-[#15803d] text-white shadow-xs';
            if (tab === 'Approved') activeClass = 'bg-blue-600 text-white shadow-xs';
            if (tab === 'Rejected') activeClass = 'bg-red-650 text-white shadow-xs';
            if (tab === 'All') activeClass = 'bg-gray-800 text-white shadow-xs';

            const count = requests.filter(r => tab === 'All' ? true : r.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isActive 
                    ? activeClass + ' border-transparent' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Content card list */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center min-h-[180px]">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-semibold text-gray-400">Loading requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-gray-150 shadow-2xs flex flex-col items-center justify-center text-center min-h-[180px]">
            <span className="text-xs font-semibold text-gray-400">
              Koi request nahi.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const isProcessing = actionId === req._id;
              const dateStr = req.requestedAt ? new Date(req.requestedAt).toLocaleString('en-IN') : 'N/A';

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs flex flex-col space-y-3 transition-all hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span>{req.name || 'User'}</span>
                        <span className="text-xs font-semibold text-gray-500 font-mono">
                          (ID: {req.userId || req.user || 'N/A'})
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <FaPhoneAlt size={10} className="text-gray-400" />
                          {req.mobile}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-gray-500">
                          <FaCalendarAlt size={10} className="text-gray-400" />
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {req.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          <FaClock size={10} /> Pending
                        </span>
                      )}
                      {req.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <FaCheckCircle size={10} /> Approved
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                          <FaTimesCircle size={10} /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reason Box */}
                  {req.reason && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs text-gray-600 font-medium">
                      <span className="font-bold text-gray-700">Reason: </span>
                      {req.reason}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-gray-100">
                    {req.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(req._id, req.mobile)}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <FaCheckCircle size={11} />
                          <span>{isProcessing ? 'Processing...' : 'Approve & Delete User'}</span>
                        </button>
                        <button
                          onClick={() => handleReject(req._id, req.mobile)}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <FaTimesCircle size={11} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDeleteRecord(req._id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      title="Delete Record"
                    >
                      <FaTrashAlt size={11} />
                      <span>Remove Record</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

export default AccountDeletionRequests;
