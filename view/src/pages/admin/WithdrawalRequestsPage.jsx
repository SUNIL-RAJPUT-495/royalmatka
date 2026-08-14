import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Banknote, AlertTriangle, Filter, Check, X, Loader2, RefreshCw, Eye, Copy, ExternalLink 
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const WithdrawalRequestsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Requests');
  const [showError, setShowError] = useState(false); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Pagination & Search State (10 items per page)
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Copy helper function
  const handleCopyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label || 'Details'} copied to clipboard! 📋`);
  };

  // Helper to parse individual payment fields (Account No, IFSC, Holder Name, UPI)
  const parsePaymentFields = (withdraw) => {
    if (!withdraw) return [];

    const rawStr = withdraw.accountDetails || '';
    const user = withdraw.userId || {};
    const bank = user.bankAccounts?.[0] || user.paymentInfo || {};
    const upiObj = user.upiIds?.[0];

    const fields = [];

    // 1. Account Number
    let accNo = bank.accountNumber;
    if (!accNo && rawStr) {
      const match = rawStr.match(/(?:A\/C|Acc|Account|A\/c|Number)[\s:]*([A-Za-z0-9]+)/i);
      if (match) accNo = match[1];
    }
    if (accNo) fields.push({ label: 'Account Number', value: accNo });

    // 2. IFSC Code
    let ifsc = bank.ifscCode;
    if (!ifsc && rawStr) {
      const match = rawStr.match(/(?:IFSC)[\s:]*([A-Za-z0-9]+)/i);
      if (match) ifsc = match[1];
    }
    if (ifsc) fields.push({ label: 'IFSC Code', value: ifsc });

    // 3. Account Holder Name
    let holderName = bank.accountHolderName || user.name;
    if (!holderName && rawStr) {
      const match = rawStr.match(/(?:Holder|Name)[\s:]*([A-Za-z\s]+?)(?:\||$)/i);
      if (match) holderName = match[1].trim();
    }
    if (holderName) fields.push({ label: 'Account Holder Name', value: holderName });

    // 4. Bank Name
    let bankName = bank.bankName;
    if (bankName) fields.push({ label: 'Bank Name', value: bankName });

    // 5. UPI / PhonePe ID
    let upiId = upiObj?.upiId || user.paymentInfo?.phonePeUpiId || user.paymentInfo?.googlePayUpiId;
    if (!upiId && rawStr) {
      const match = rawStr.match(/(?:UPI|PhonePe|GPay|GooglePay)[\s:]*([A-Za-z0-9@.-]+)/i);
      if (match) upiId = match[1];
    }
    if (upiId) fields.push({ label: 'UPI / PhonePe ID', value: upiId });

    // 6. Paytm Number
    let paytmNo = user.paymentInfo?.paytmNumber;
    if (paytmNo && paytmNo !== accNo) fields.push({ label: 'Paytm Number', value: paytmNo });

    // Fallback: If no parsed fields match, output the raw string
    if (fields.length === 0 && rawStr) {
      fields.push({ label: 'Account Details', value: rawStr });
    }

    return fields;
  };

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

  // Advanced Search & Status Filter
  const filteredData = transactions.filter((item) => {
    const matchesFilter = activeFilter === 'All Requests' || item.status === activeFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesFilter;

    const name = (item.userId?.name || '').toLowerCase();
    const mobile = (item.userId?.mobile || '').toLowerCase();
    const txId = (item.transactionId || '').toLowerCase();
    const method = (item.method || '').toLowerCase();
    const details = (item.accountDetails || '').toLowerCase();

    const matchesSearch = name.includes(term) || mobile.includes(term) || txId.includes(term) || method.includes(term) || details.includes(term);
    return matchesFilter && matchesSearch;
  });

  // 10 Items per page Pagination Math
  const totalEntries = filteredData.length;
  const indexOfLastRow = currentPage * entriesPerPage;
  const indexOfFirstRow = indexOfLastRow - entriesPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));

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

        {/* 3. Filter & Search Controls Card */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-xs text-gray-600 font-semibold">
              <span>Show</span>
              <select 
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mx-2 border border-gray-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 bg-white font-semibold cursor-pointer text-xs shadow-2xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center text-xs text-gray-600 relative w-full sm:w-56">
              <input 
                type="text" 
                placeholder="Search Name, Tx ID, Mobile..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-xl pl-3 pr-3 py-1.5 outline-none focus:border-blue-500 text-xs font-semibold shadow-2xs"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['All Requests', 'Approved', 'Rejected', 'Pending'].map((filterItem) => (
              <button 
                key={filterItem}
                onClick={() => {
                  setActiveFilter(filterItem);
                  setCurrentPage(1);
                }}
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[350px] flex flex-col justify-between">
          
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
            <div>
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
                    {currentRows.map((withdraw) => (
                      <tr key={withdraw._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-red-500 max-w-[100px] leading-tight font-mono text-[11px]">
                          <div className="flex flex-col">
                            <span>{withdraw.transactionId ? withdraw.transactionId.slice(0, Math.ceil(withdraw.transactionId.length / 2)) : ''}</span>
                            <span>{withdraw.transactionId ? withdraw.transactionId.slice(Math.ceil(withdraw.transactionId.length / 2)) : ''}</span>
                          </div>
                        </td>
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
                          <div className="flex items-center justify-center gap-2">
                            {/* View User Account Details Button */}
                            <button
                              onClick={() => setSelectedWithdrawal(withdraw)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 text-[10px] font-bold uppercase shadow-3xs"
                              title="View Account Details & Copy"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>

                            {withdraw.status === 'Pending' ? (
                              actionLoading === withdraw._id ? (
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
                              )
                            ) : (
                              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Processed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 10-Item Pagination Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-3 text-xs text-gray-600 font-semibold bg-gray-50/50">
                <div>
                  Showing {totalEntries > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, totalEntries)} of {totalEntries} entries
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-3xs cursor-pointer"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-3xs cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
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

      {/* 5. Withdrawal Account Details Modal Popup */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-150 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-150 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span>💳</span> Withdrawal Account Details
                </h2>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  Request ID: <span className="font-mono text-red-500 font-bold">{selectedWithdrawal.transactionId}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* User Summary Top Bar */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[9px] block">User</span>
                  <span className="font-extrabold text-gray-900">{selectedWithdrawal.userId?.name || 'User'}</span>
                  <span className="font-mono text-gray-600 text-[11px] block">{selectedWithdrawal.userId?.mobile || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-bold uppercase text-[9px] block">Amount</span>
                  <span className="text-base font-black text-gray-950">₹{selectedWithdrawal.amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* SINGLE COMPACT BOX FOR ALL PAYMENT & ACCOUNT DETAILS */}
              <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-3.5 divide-y divide-amber-200/60">
                <div className="flex justify-between items-center pb-2.5">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Method</span>
                  <span className="px-2.5 py-0.5 bg-amber-200/80 text-amber-900 text-[10px] font-extrabold rounded-full uppercase">
                    {selectedWithdrawal.method || 'Bank Transfer'}
                  </span>
                </div>

                {parsePaymentFields(selectedWithdrawal).map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</span>
                      <span className="font-extrabold font-mono text-gray-900">{field.value}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText(field.value, field.label)}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-3xs"
                    >
                      <Copy className="w-3 h-3 text-amber-700" />
                      <span>Copy</span>
                    </button>
                  </div>
                ))}

                {selectedWithdrawal.userId?.mobile && (
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</span>
                      <span className="font-extrabold font-mono text-gray-900">{selectedWithdrawal.userId.mobile}</span>
                    </div>
                    <button
                      onClick={() => handleCopyText(selectedWithdrawal.userId.mobile, 'Mobile Number')}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-3xs"
                    >
                      <Copy className="w-3 h-3 text-amber-700" />
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center gap-3 pt-4 mt-4 border-t border-gray-150">
              {selectedWithdrawal.userId?._id || (typeof selectedWithdrawal.userId === 'string' ? selectedWithdrawal.userId : null) ? (
                <button
                  onClick={() => {
                    const uid = selectedWithdrawal.userId?._id || selectedWithdrawal.userId;
                    setSelectedWithdrawal(null);
                    navigate(`/systum/view-user/${uid}`);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Profile</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WithdrawalRequestsPage;
