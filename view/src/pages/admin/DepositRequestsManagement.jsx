import React, { useState, useEffect } from 'react'; 
import { 
  ArrowDownToLine, Banknote, AlertTriangle, Search, RefreshCw, 
  Filter, Loader2, Check, X, Inbox, CheckCircle2, XCircle
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from "../../utils/axiosAdmin";
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const DepositRequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Deposits');
  const [showError, setShowError] = useState(false); 
  const [testEmptyState, setTestEmptyState] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [processingId, setProcessingId] = useState(null); // Button loader state

  // State to hold actual API data
  const [depositRequests, setDepositRequests] = useState([]);

  // Custom Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState(null); // { id: string, status: string }

  const fetchDepositRequests = async () => {
    setLoading(true);
    setShowError(false);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.allTransactions.url,
        method: SummaryApi.allTransactions.method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}` 
        }
      });
      
      setDepositRequests(response.data.transactions || []); 
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositRequests();
  }, []);

  const handleUpdateStatusClick = (id, newStatus) => {
    setPendingTx({ id, status: newStatus });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingTx) return;
    const { id, status } = pendingTx;
    setConfirmOpen(false);
    setProcessingId(id);

    try {
      const response = await AxiosAdmin({
        url: SummaryApi.updateStatusAdmin.url,
        method: SummaryApi.updateStatusAdmin.method,
        data: {
          transactionId: id,
          status: status
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.data || response.status === 200) {
        setDepositRequests(prev => prev.map(req => 
          (req._id === id || req.id === id) ? { ...req, status: status } : req
        ));
        toast.success(`Deposit ${status} successfully!`);
      }
    } catch (error) {
      console.error(`Error updating status:`, error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
      setPendingTx(null);
    }
  };

  // Filtering Logic
  const filteredData = testEmptyState ? [] : depositRequests.filter((item) => {
    const matchesSearch = 
      (item?.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'All Deposits' || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-6 font-sans text-gray-800 text-left select-none">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 text-emerald-500 shadow-3xs">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
              Deposit Requests Management
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1.5 uppercase tracking-wider">
              View, approve, and manage user deposit requests
            </p>
          </div>
        </div>

        <button 
          onClick={fetchDepositRequests}
          className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 2. Info Banner */}
        <div className="bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-4.5 shadow-3xs flex items-start gap-3">
          <Banknote className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-800 font-semibold leading-relaxed">
            <span className="font-bold block">Deposit Requests Only</span>
            <span className="text-[11px] text-emerald-700/90 block mt-0.5">This page displays only deposit requests from users. Manage and process these deposits to update user balances.</span>
          </div>
        </div>

        {/* 3. Error Banner */}
        {showError && (
          <div className="bg-[#fef2f2] border border-red-200 rounded-2xl p-4 shadow-3xs flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold">Failed to load deposit requests. Please try again.</span>
          </div>
        )}

        {/* 4. Search & Filter Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">Search & Filter Deposits</span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or UTR..." 
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-emerald-500 shadow-3xs text-xs font-semibold"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {['All Deposits', 'Pending', 'Approved', 'Rejected'].map((filterItem) => (
              <button 
                key={filterItem}
                onClick={() => setActiveFilter(filterItem)}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs active:scale-95 ${
                  activeFilter === filterItem 
                    ? filterItem === 'Approved' ? 'bg-green-500 text-white' 
                    : filterItem === 'Rejected' ? 'bg-red-500 text-white' 
                    : filterItem === 'Pending' ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-250 hover:bg-gray-50'
                }`}
              >
                {filterItem === 'Approved' && <Check className="w-3 h-3 stroke-[2.5]" />}
                {filterItem === 'Rejected' && <X className="w-3 h-3 stroke-[2.5]" />}
                {filterItem === 'Pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{filterItem}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Data View / Empty State */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[350px] flex flex-col">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-2" />
                <p className="text-xs font-semibold text-gray-500">Loading requests...</p>
             </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center space-y-3">
              <div className="bg-gray-50 p-4 rounded-full border border-gray-150 shadow-inner text-gray-300">
                <Inbox className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">No Deposit Requests Found</h3>
                <p className="text-xs text-gray-450 font-semibold mt-1">
                  There are no deposit requests matching your current filter or search criteria.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-gray-600 border-collapse">
                <thead className="bg-[#f8f9fc] border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">User Details</th>
                    <th className="px-5 py-4">UTR Number</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredData.map((deposit) => (
                    <tr key={deposit._id || deposit.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{deposit.userId?.name || 'N/A'}</div>
                        <div className="text-[10px] text-gray-450 mt-0.5">{deposit.userId?.email || 'N/A'}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-gray-800 font-bold text-[11px] select-all">
                        {deposit.utrNumber || deposit.accountDetails || deposit.transactionId || 'N/A'}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-950 text-sm">₹{(deposit.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-gray-450 font-semibold whitespace-nowrap">
                        {new Date(deposit.createdAt || deposit.date).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase shadow-3xs flex items-center gap-1 w-fit
                          ${deposit.status === 'Pending' ? 'bg-yellow-500' : 
                            deposit.status === 'Approved' ? 'bg-green-500' : 
                            'bg-red-500'}`}
                        >
                          {deposit.status === 'Pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                          {deposit.status === 'Approved' && <Check className="w-3 h-3 stroke-[2.5]" />}
                          {deposit.status === 'Rejected' && <X className="w-3 h-3 stroke-[2.5]" />}
                          <span>{deposit.status || 'Unknown'}</span>
                        </span>
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="px-5 py-4">
                        {deposit.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            {processingId === (deposit._id || deposit.id) ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatusClick(deposit._id || deposit.id, 'Approved')}
                                  className="p-1.5 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-xl transition-all border border-green-200 shadow-3xs cursor-pointer active:scale-95"
                                  title="Approve Deposit"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatusClick(deposit._id || deposit.id, 'Rejected')}
                                  className="p-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all border border-red-200 shadow-3xs cursor-pointer active:scale-95"
                                  title="Reject Deposit"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-[10px] text-center font-bold uppercase tracking-wider">Processed</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>

      </div>

      {/* Confirmation warning modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title={pendingTx?.status === 'Approved' ? 'Approve Deposit?' : 'Reject Deposit?'}
        message={
          pendingTx?.status === 'Approved' 
            ? 'Are you sure you want to approve this deposit request?' 
            : 'Are you sure you want to reject this deposit request?'
        }
        confirmText={pendingTx?.status === 'Approved' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingTx(null);
        }}
      />

    </div>
  );
};

export default DepositRequestsManagement;