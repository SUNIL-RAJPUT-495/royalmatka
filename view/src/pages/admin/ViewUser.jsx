import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';

// Reusable Table Component (Exact matching structure)
const DataTable = ({ title, columns, data = [], emptyMessage = "No data available in table", tabs }) => {
  return (
    <div className="bg-white rounded shadow-[0_0_5px_rgba(0,0,0,0.05)] p-5 mt-6 border border-gray-100">
      <h3 className="text-[17px] font-bold text-[#4b4b4b] mb-4">{title}</h3>
      
      {tabs && (
        <div className="border-b-2 border-blue-600 mb-5 text-center relative">
          <span className="text-blue-600 font-medium pb-2 inline-block px-4 text-sm">{tabs}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-sm text-[#6e6b7b]">
          <span>Show</span>
          <select className="mx-2 border border-[#d8d6de] rounded px-2 py-1.5 outline-none focus:border-blue-400">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>entries</span>
        </div>
        <div className="flex items-center text-sm text-[#6e6b7b]">
          <span className="mr-2">Search:</span>
          <input type="text" className="border border-[#d8d6de] rounded px-3 py-1.5 outline-none focus:border-blue-400 w-48" />
        </div>
      </div>

      <div className="overflow-x-auto border-t border-l border-r border-[#ebe9f1] rounded-t-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#f3f2f7] border-b border-[#ebe9f1]">
              {columns.map((col, idx) => (
                <th key={idx} className="p-3 text-[13px] font-semibold text-[#6e6b7b] whitespace-nowrap uppercase tracking-wider">
                  <div className="flex items-center justify-between">
                    {col}
                    <div className="flex flex-col ml-2 text-[10px] text-gray-400 cursor-pointer">
                      <span>↑</span>
                      <span className="-mt-1">↓</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-[#6e6b7b] text-sm border-b border-[#ebe9f1] bg-[#fafbfc]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[#ebe9f1] hover:bg-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-3 text-sm text-[#6e6b7b]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-[#6e6b7b]">
        <div>
          Showing {data.length > 0 ? 1 : 0} to {data.length} of {data.length} entries
        </div>
        <div className="flex rounded overflow-hidden">
          <button className="px-3 py-1.5 border border-[#d8d6de] bg-[#f3f2f7] text-[#b9b9c3] rounded-l cursor-not-allowed">Previous</button>
          {data.length > 0 && <button className="px-3 py-1.5 border-y border-r border-blue-600 bg-[#4b46e5] text-white">1</button>}
          <button className={`px-3 py-1.5 border border-[#d8d6de] border-l-0 rounded-r ${data.length > 0 ? 'bg-white text-[#6e6b7b]' : 'bg-white text-[#b9b9c3] cursor-not-allowed'}`}>Next</button>
        </div>
      </div>
    </div>
  );
};

// Main Component Function
export const ViewUser = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await AxiosAdmin({ 
        url: `${SummaryApi.getAdminViewUser.url}/${id}`, 
        method: SummaryApi.getAdminViewUser.method 
      });
      if(res.data.success) {
         setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleManualTransaction = async (type) => {
    if (!amount || Number(amount) <= 0) {
      return toast.error("Please enter a valid amount");
    }
    
    setIsSubmitting(true);
    const apiCall = type === 'deposit' ? SummaryApi.adminAddFund : SummaryApi.adminDeductFund;
    
    try {
      const res = await AxiosAdmin({
        url: apiCall.url,
        method: apiCall.method,
        data: { userId: id, amount, remark }
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setShowAddModal(false);
        setShowWithdrawModal(false);
        setAmount('');
        setRemark('');
        fetchUser(); // reload the user data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to process ${type}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 font-semibold">Loading User Details...</div>;
  if (!data || !data.user) return <div className="p-6 text-center text-red-500 font-semibold">User Not Found</div>;

  const { user, deposits, withdrawals, bids, transactions } = data;
  const winnings = bids.filter(b => b.status === 'Winner');

  // Formatting functions
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

  const depositsData = deposits.map((d, i) => [
    i + 1, 
    `₹${d.amount}`, 
    d.transactionId, 
    formatDate(d.createdAt), 
    <span key={`dep-${d._id}`} className={`px-2 py-1 rounded text-xs ${d.status === 'Approved' ? 'bg-green-100 text-green-700' : d.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
  ]);

  const withdrawalsData = withdrawals.map((w, i) => [
    i + 1, 
    `₹${w.amount}`, 
    w.transactionId, 
    formatDate(w.createdAt), 
    <span key={`wd-${w._id}`} className={`px-2 py-1 rounded text-xs ${w.status === 'Approved' ? 'bg-green-100 text-green-700' : w.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.status}</span>,
    w.accountDetails || 'N/A'
  ]);

  const bidsData = bids.map((b, i) => [
    i + 1, 
    b.market_id?.name || 'N/A', 
    b.game_type, 
    b.number, 
    `₹${b.amount}`, 
    formatDate(b.createdAt)
  ]);

  const winningsData = winnings.map((w, i) => [
    i + 1, 
    formatDate(w.updatedAt), 
    user.name, 
    user.mobile, 
    w.market_id?.name || 'N/A', 
    w.number, 
    w.game_type, 
    `₹${w.amount * (w.game_type === 'Single' ? 9 : w.game_type === 'Jodi' ? 90 : 10)}` // rough multiplier fallback
  ]);

  const transactionsData = transactions.map((t, i) => [
    i + 1, 
    t.transactionId, 
    `₹${t.amount}`, 
    <span key={`tx-${t._id}`} className={`text-white px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${t.type === 'Deposit' ? 'bg-[#28c76f]' : 'bg-[#ff6b6b]'}`}>{t.type}</span>, 
    formatDate(t.createdAt), 
    t.status
  ]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#4b4b4b] uppercase">USER DETAILS</h1>
        <div className="text-sm text-[#6e6b7b]">
          User Management <span className="mx-2">/</span> User Details
        </div>
      </div>

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Profile Card */}
        <div className="w-full lg:w-[320px] bg-white rounded shadow-[0_0_5px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col shrink-0">
          <div className="bg-[#dbe4ff] p-5 pb-16 relative flex justify-between rounded-t">
            <div>
              <h2 className="text-[22px] font-semibold text-[#5a8dee] mb-1">{user.name}</h2>
              <div className="flex items-center text-[#5a8dee] text-[15px]">
                {user.mobile}
                <span className="ml-2 text-xs border border-[#5a8dee] rounded px-1 py-0.5">📱</span>
                <span className="ml-1 text-xs border border-[#5a8dee] rounded px-1 py-0.5">💬</span>
              </div>
            </div>
            <div className="text-right text-sm font-medium text-[#4b4b4b] flex flex-col gap-2">
              <div className="flex items-center justify-end">
                Active: <span className={`text-white px-2.5 py-0.5 rounded-full text-xs ml-2 ${user.status === 'Active' ? 'bg-[#28c76f]' : 'bg-gray-400'}`}>{user.status === 'Active' ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-end">
                Banned: <span className={`text-white px-2.5 py-0.5 rounded-full text-xs ml-2 ${user.status === 'Blocked' ? 'bg-[#ff6b6b]' : 'bg-gray-400'}`}>{user.status === 'Blocked' ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          
          <div className="px-5 pb-5 relative bg-white rounded-b">
            {/* Avatar overlapping */}
            <div className="absolute -top-12 left-5 w-[90px] h-[90px] bg-[#fce35b] rounded-full border-[5px] border-white flex items-center justify-center overflow-hidden shadow-sm">
               <svg viewBox="0 0 100 100" className="w-full h-full pt-4">
                  <circle cx="50" cy="40" r="22" fill="#ffe4c4" />
                  <path d="M25 100 Q 50 60 75 100" fill="#28c76f" />
                  <path d="M35 55 L65 55 L60 45 L40 45 Z" fill="#ffffff" /> 
               </svg>
            </div>

            <div className="pt-16 mt-2 border-t border-gray-100">
              <p className="text-[#6e6b7b] text-[15px] mb-1 mt-3">Available Balance</p>
              <p className="text-[22px] font-bold text-[#4b4b4b] mb-6">₹{(user.wallet?.realBalance || 0) + (user.wallet?.bonusBalance || 0)}</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex-1 bg-[#28c76f] hover:bg-[#23af61] text-white font-medium py-2 rounded text-[15px] transition-colors shadow-sm cursor-pointer"
                >
                  Add Fund
                </button>
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 bg-[#ff6b6b] hover:bg-[#e85a5a] text-white font-medium py-2 rounded text-[15px] transition-colors shadow-sm cursor-pointer"
                >
                  Withdraw Fund
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="flex-1 bg-white rounded shadow-[0_0_5px_rgba(0,0,0,0.05)] border border-gray-100 p-6">
          <h3 className="text-[16px] font-bold text-[#4b4b4b] mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">{user.name}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Security Pin</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">N/A</span>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mobile</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b] flex items-center">
                {user.mobile}
                <span className="ml-2 text-[10px] text-blue-500 border border-blue-200 bg-blue-50 rounded px-1">📱</span>
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">********</span>
            </div>
          </div>

          <h3 className="text-[16px] font-bold text-[#4b4b4b] mb-4 border-b border-gray-100 pb-2">Payment Information</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bank Name</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">{user.paymentInfo?.bankName || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">A/c Holder Name</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">{user.paymentInfo?.accountHolderName || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">A/c Number</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">{user.paymentInfo?.accountNumber || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">IFSC Code</span>
              <span className="text-[13px] font-semibold text-[#4b4b4b]">{user.paymentInfo?.ifscCode || 'N/A'}</span>
            </div>
            <div className="bg-purple-50 p-3 rounded border border-purple-100">
              <span className="block text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-1">PhonePe UPI</span>
              <span className="text-[13px] font-semibold text-purple-900">{user.paymentInfo?.phonePeUpiId || 'N/A'}</span>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-100">
              <span className="block text-[11px] font-bold text-green-600 uppercase tracking-wider mb-1">Google Pay UPI</span>
              <span className="text-[13px] font-semibold text-green-900">{user.paymentInfo?.googlePayUpiId || 'N/A'}</span>
            </div>
            <div className="bg-sky-50 p-3 rounded border border-sky-100">
              <span className="block text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-1">Paytm No.</span>
              <span className="text-[13px] font-semibold text-sky-900">{user.paymentInfo?.paytmNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <DataTable 
        title="Add Fund Request List" 
        columns={["#", "Request Amount", "Request No.", "Date", "Status"]}
        data={depositsData}
        emptyMessage="No deposit requests found"
      />

      <DataTable 
        title="Withdraw Fund Request List" 
        columns={["#", "Request Amount", "Request No.", "Request Date", "Status", "Account details"]}
        data={withdrawalsData}
        emptyMessage="No withdrawal requests found"
      />

      <DataTable 
        title="Bid History" 
        columns={["#", "Game Name", "Game Type", "Digits", "Points", "Date"]}
        data={bidsData}
        emptyMessage="No bids found"
      />

      <DataTable 
        title="Winning History List" 
        columns={["Id", "Tx Date", "Member Name", "Member Number", "Market Name", "Bet Number", "Game Name", "Amount"]}
        data={winningsData}
        emptyMessage="No winnings found"
      />

      {/* Wallet Transaction History Table (With Data) */}
      <DataTable 
        title="Wallet Transaction History" 
        tabs="All"
        columns={["#", "Tx Req. No.", "Amount", "Transaction Type", "Date", "Status"]}
        data={transactionsData}
        emptyMessage="No transactions found"
      />

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[#4b4b4b]">Add Fund to Wallet</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
              <input 
                type="text" 
                value={remark} 
                onChange={(e) => setRemark(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
                placeholder="e.g. Added via Admin Panel"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowAddModal(false); setAmount(''); setRemark(''); }} 
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleManualTransaction('deposit')} 
                className="px-4 py-2 text-white bg-[#28c76f] rounded hover:bg-[#23af61] flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Add Fund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded p-6 w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[#4b4b4b]">Withdraw Fund from Wallet</h2>
            <div className="mb-4">
              <p className="text-sm border border-red-200 bg-red-50 text-red-600 px-3 py-2 rounded mb-3">
                Max Available: ₹{user.wallet?.realBalance || 0}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
                placeholder="Enter amount"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
              <input 
                type="text" 
                value={remark} 
                onChange={(e) => setRemark(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" 
                placeholder="e.g. Deducted by Admin"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowWithdrawModal(false); setAmount(''); setRemark(''); }} 
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleManualTransaction('withdraw')} 
                className="px-4 py-2 text-white bg-[#ff6b6b] rounded hover:bg-[#e85a5a] flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Withdraw Fund'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};