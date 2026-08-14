import React, { useState, useEffect } from 'react'; 
import { 
  ArrowDownToLine, Banknote, AlertTriangle, Search, RefreshCw, 
  Loader2, Check, X, Inbox, CheckCircle2, XCircle, QrCode, Zap, CreditCard, Eye, Copy, Smartphone, ShieldCheck
} from 'lucide-react';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from "../../utils/axiosAdmin";
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const DepositRequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Deposits');
  const [showError, setShowError] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [processingId, setProcessingId] = useState(null); 

  // State to hold actual API data
  const [depositRequests, setDepositRequests] = useState([]);

  // Selected Deposit for Details Modal
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  // Custom Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTx, setPendingTx] = useState(null);

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
        if (selectedDeposit && (selectedDeposit._id === id || selectedDeposit.id === id)) {
          setSelectedDeposit(prev => ({ ...prev, status: status }));
        }
      }
    } catch (error) {
      console.error(`Error updating status:`, error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setProcessingId(null);
      setPendingTx(null);
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Helper to resolve Payment Source Details
  const getSourceDetails = (item) => {
    const m = (item?.method || '').toLowerCase();
    const paymentSource = item?.paymentSource || '';

    if (m.includes('imb') || m.includes('auto') || m.includes('gateway') || paymentSource.includes('Auto')) {
      return {
        label: 'Auto Gateway (IMB)',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <Zap className="w-3 h-3 text-emerald-600" />
      };
    }
    if (m.includes('payfromupi') || paymentSource.includes('PayFromUPI')) {
      return {
        label: 'PayFromUPI Gateway',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <CreditCard className="w-3 h-3 text-purple-600" />
      };
    }
    return {
      label: 'Manual QR / UTR',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <QrCode className="w-3 h-3 text-amber-600" />
    };
  };

  // Filtering Logic
  const filteredData = depositRequests.filter((item) => {
    const userName = item?.userId?.name || '';
    const userEmail = item?.userId?.email || '';
    const userMobile = item?.userId?.mobile || '';
    const utr = item?.utrNumber || item?.accountDetails || item?.transactionId || '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = 
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      userMobile.toLowerCase().includes(searchLower) ||
      utr.toLowerCase().includes(searchLower);

    let matchesFilter = true;
    if (activeFilter === 'Pending' || activeFilter === 'Approved' || activeFilter === 'Rejected') {
      matchesFilter = item.status === activeFilter;
    } else if (activeFilter === 'Manual QR') {
      matchesFilter = getSourceDetails(item).label.includes('Manual');
    } else if (activeFilter === 'Auto Gateway') {
      matchesFilter = getSourceDetails(item).label.includes('Auto') || getSourceDetails(item).label.includes('PayFromUPI');
    }

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
              View payment source (Manual QR / Gateway), UTR details, and approve deposits
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
            <span className="font-bold block">Payment Source & Gateway Verification</span>
            <span className="text-[11px] text-emerald-700/90 block mt-0.5">
              Each deposit shows exact source details: <b>Manual QR Code Deposit</b> or <b>Auto Gateway (IMB / UPI)</b>. Verify UTR number before approving manual deposits.
            </span>
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
            <span className="font-bold text-gray-800 text-xs uppercase tracking-wide">Search & Filter Payments</span>
            <span className="text-xs text-gray-400 font-semibold">Showing {filteredData.length} Requests</span>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by User Name, Mobile, Email, UTR, or TxID..." 
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:border-emerald-500 shadow-3xs text-xs font-semibold"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {['All Deposits', 'Manual QR', 'Auto Gateway', 'Pending', 'Approved', 'Rejected'].map((filterItem) => (
              <button 
                key={filterItem}
                onClick={() => setActiveFilter(filterItem)}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs active:scale-95 ${
                  activeFilter === filterItem 
                    ? filterItem === 'Approved' ? 'bg-green-600 text-white' 
                    : filterItem === 'Rejected' ? 'bg-red-600 text-white' 
                    : filterItem === 'Pending' ? 'bg-yellow-500 text-white' 
                    : filterItem === 'Manual QR' ? 'bg-amber-600 text-white'
                    : filterItem === 'Auto Gateway' ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-250 hover:bg-gray-50'
                }`}
              >
                {filterItem === 'Approved' && <Check className="w-3 h-3 stroke-[2.5]" />}
                {filterItem === 'Rejected' && <X className="w-3 h-3 stroke-[2.5]" />}
                {filterItem === 'Pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                {filterItem === 'Manual QR' && <QrCode className="w-3 h-3" />}
                {filterItem === 'Auto Gateway' && <Zap className="w-3 h-3" />}
                <span>{filterItem}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Data View Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[350px] flex flex-col">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-2" />
                <p className="text-xs font-semibold text-gray-500">Loading deposit requests...</p>
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
                    <th className="px-5 py-4">Payment Source</th>
                    <th className="px-5 py-4">UTR / TxID</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Date & Time</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {filteredData.map((deposit) => {
                    const sourceInfo = getSourceDetails(deposit);
                    const utrVal = deposit.utrNumber || deposit.accountDetails || deposit.transactionId || 'N/A';

                    return (
                      <tr key={deposit._id || deposit.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* User Details */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">
                            {deposit.userId?.name || (typeof deposit.userId === 'object' ? deposit.userId?.mobile : '') || deposit.username || 'User'}
                          </div>
                          <div className="text-[10px] text-gray-450 mt-0.5">
                            {deposit.userId?.mobile ? `📞 ${deposit.userId.mobile}` : deposit.userId?.email || deposit.mobile || 'N/A'}
                          </div>
                        </td>

                        {/* Payment Source */}
                        <td className="px-5 py-4">
                          <div className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 w-fit ${sourceInfo.badgeClass}`}>
                            {sourceInfo.icon}
                            <span>{sourceInfo.label}</span>
                          </div>
                        </td>

                        {/* UTR / TxID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-gray-800 font-bold text-[11px] select-all">
                              {utrVal}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(utrVal, 'UTR Number')}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                              title="Copy UTR"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 font-bold text-emerald-600 text-sm">
                          ₹{(deposit.amount || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-450 font-semibold whitespace-nowrap text-[11px]">
                          {new Date(deposit.createdAt || deposit.date).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>

                        {/* Status */}
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
                          <div className="flex items-center justify-center gap-2">
                            {/* View Full Details Button */}
                            <button
                              onClick={() => setSelectedDeposit(deposit)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-200 shadow-3xs cursor-pointer active:scale-95"
                              title="View Full Payment Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {deposit.status === 'Pending' && (
                              <>
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 6. FULL PAYMENT DETAILS MODAL */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Full Payment Details</h3>
              </div>
              <button 
                onClick={() => setSelectedDeposit(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-gray-700">
              {/* User Details */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">User Info</span>
                <div className="text-sm font-bold text-gray-900">{selectedDeposit.userId?.name || 'N/A'}</div>
                <div className="text-xs text-gray-500">📞 Mobile: {selectedDeposit.userId?.mobile || 'N/A'}</div>
                <div className="text-xs text-gray-500">✉️ Email: {selectedDeposit.userId?.email || 'N/A'}</div>
                {selectedDeposit.userId?.wallet && (
                  <div className="text-xs font-bold text-emerald-600 mt-1">
                    💰 Current Wallet Balance: ₹{(selectedDeposit.userId.wallet.withdrowalable || 0).toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Amount</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block">
                    ₹{(selectedDeposit.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Payment Source</span>
                  <div className="mt-1">
                    {(() => {
                      const s = getSourceDetails(selectedDeposit);
                      return (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${s.badgeClass}`}>
                          {s.icon} {s.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* UTR & Transaction ID */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">UTR Number</span>
                  <div className="flex items-center justify-between font-mono font-bold text-sm text-gray-900 mt-0.5">
                    <span>{selectedDeposit.utrNumber || selectedDeposit.accountDetails || 'N/A'}</span>
                    {(selectedDeposit.utrNumber || selectedDeposit.accountDetails) && (
                      <button
                        onClick={() => copyToClipboard(selectedDeposit.utrNumber || selectedDeposit.accountDetails, 'UTR')}
                        className="text-emerald-600 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">System Transaction ID</span>
                  <span className="font-mono text-xs text-gray-600 font-bold block mt-0.5">{selectedDeposit.transactionId || selectedDeposit._id}</span>
                </div>
              </div>

              {/* Status & Date */}
              <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Date & Time</span>
                  <span className="text-xs text-gray-800 font-semibold block mt-0.5">
                    {new Date(selectedDeposit.createdAt || selectedDeposit.date).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase shadow-3xs flex items-center gap-1 ${
                    selectedDeposit.status === 'Pending' ? 'bg-yellow-500' :
                    selectedDeposit.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {selectedDeposit.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {selectedDeposit.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatusClick(selectedDeposit._id || selectedDeposit.id, 'Approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-2xl transition-all shadow-3xs cursor-pointer"
                  >
                    Approve Deposit
                  </button>
                  <button
                    onClick={() => handleUpdateStatusClick(selectedDeposit._id || selectedDeposit.id, 'Rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-2xl transition-all shadow-3xs cursor-pointer"
                  >
                    Reject Deposit
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedDeposit(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-2xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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