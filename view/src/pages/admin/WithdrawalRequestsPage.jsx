import React, { useState, useEffect } from 'react';
import { 
  Banknote, AlertTriangle, Filter, Check, X, Loader2, RefreshCw 
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const WithdrawalRequestsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All Requests');
  const [showError, setShowError] = useState(false); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 

  // Custom Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState(null); // { id: string, status: string }

  const fetchWithdrawals = async () => {
    setLoading(true);
    setShowError(false);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getAllWithdrawals.url,
        method: SummaryApi.getAllWithdrawals.method
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Fetch Withdrawals Error:", error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleActionClick = (transactionId, newStatus) => {
    setPendingTx({ id: transactionId, status: newStatus });
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingTx) return;
    const { id, status } = pendingTx;
    setConfirmOpen(false);
    setActionLoading(id);
    
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.updateWithdrawalStatus.url,
        method: SummaryApi.updateWithdrawalStatus.method,
        data: {
          transactionId: id,
          status: status
        }
      });
      toast.success(response.data.message || `Withdrawal ${status} successfully!`);
      // Update local state
      setTransactions(prev => 
        prev.map(t => t._id === id ? { ...t, status: status } : t)
      );
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(error?.response?.data?.message || "Failed to update withdrawal status!");
    } finally {
      setActionLoading(null);
      setPendingTx(null);
    }
  };

  // Filtering Logic
  const filteredData = transactions.filter((item) => {
    if (activeFilter === 'All Requests') return true;
    return item.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-6 font-sans text-gray-800 text-left select-none">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-2xl border border-red-100 text-red-500 shadow-3xs">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
              Withdrawal Requests
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1.5 uppercase tracking-wider">
              Manage and process user withdrawal requests
            </p>
          </div>
        </div>

        <button 
          onClick={fetchWithdrawals}
          className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 2. Error Banner */}
        {showError && (
          <div className="bg-[#fef2f2] border border-red-200 rounded-2xl p-4 shadow-3xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-semibold">Failed to fetch withdraw requests. Please check connection.</span>
            </div>
            <button 
              onClick={fetchWithdrawals} 
              className="text-xs font-bold text-red-700 hover:underline px-2.5 py-1 bg-red-100/50 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 3. Filter Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">Filter Requests</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['All Requests', 'Approved', 'Rejected', 'Pending'].map((filterItem) => (
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
                <span>{filterItem}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Data View / Empty State */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[350px] flex flex-col">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-2" />
              <p className="text-xs font-semibold text-gray-500">Fetching secure requests...</p>
            </div>
          ) : filteredData.length === 0 ? (
            /* EMPTY STATE UI */
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center space-y-3">
              <div className="bg-gray-50 p-4 rounded-full border border-gray-150 shadow-inner text-gray-300">
                <Banknote className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">No Withdrawal Requests</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">
                  There are no withdrawal requests matching "{activeFilter}". 
                </p>
              </div>
            </div>
          ) : (
            /* DATA TABLE UI */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-gray-600 border-collapse">
                <thead className="bg-[#f8f9fc] border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Request ID</th>
                    <th className="px-5 py-4">User Info</th>
                    <th className="px-5 py-4">Method & Account</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredData.map((withdraw) => (
                    <tr key={withdraw._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-[#ef4444]">{withdraw.transactionId}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{withdraw.userId?.name || 'Unknown User'}</div>
                        <div className="text-[10px] text-gray-450 mt-0.5">{withdraw.userId?.mobile || 'No Mobile'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-[9px] text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded uppercase block w-fit mb-1">{withdraw.method}</span>
                        <span className="text-[11px] text-gray-600 font-mono font-medium">{withdraw.accountDetails}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-950 text-sm">₹{withdraw.amount.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-gray-450 font-semibold whitespace-nowrap">
                        {new Date(withdraw.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase shadow-3xs flex items-center gap-1 w-fit
                          ${withdraw.status === 'Pending' ? 'bg-yellow-500' : 
                            withdraw.status === 'Approved' ? 'bg-green-500' : 
                            'bg-red-500'}`}
                        >
                          {withdraw.status === 'Approved' && <Check className="w-3 h-3 stroke-[2.5]" />}
                          {withdraw.status === 'Rejected' && <X className="w-3 h-3 stroke-[2.5]" />}
                          <span>{withdraw.status}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {withdraw.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            {actionLoading === withdraw._id ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleActionClick(withdraw._id, 'Approved')}
                                  title="Approve"
                                  className="p-1.5 bg-green-50 hover:bg-green-500 hover:text-white text-green-600 rounded-xl transition-all border border-green-200 shadow-3xs cursor-pointer active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                                <button 
                                  onClick={() => handleActionClick(withdraw._id, 'Rejected')}
                                  title="Reject"
                                  className="p-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all border border-red-200 shadow-3xs cursor-pointer active:scale-95"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
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

      {/* Reusable custom warning/confirmation modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title={pendingTx?.status === 'Approved' ? 'Approve Withdrawal?' : 'Reject Withdrawal?'}
        message={
          pendingTx?.status === 'Approved' 
            ? 'Are you sure you want to approve this withdrawal request?' 
            : 'Are you sure you want to reject this withdrawal request?'
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

export default WithdrawalRequestsPage;
