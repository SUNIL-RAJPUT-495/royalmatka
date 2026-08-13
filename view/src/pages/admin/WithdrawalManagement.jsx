import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const WithdrawalManagement = () => {
  // Add new record form state
  const [userName, setUserName] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI'); // UPI, PhonePe, Google Pay, Paytm
  const [upiId, setUpiId] = useState('');
  const [status, setStatus] = useState('Success'); // Success, Pending, Failed
  const [note, setNote] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [methodFilter, setMethodFilter] = useState('All Methods');

  // Transaction list state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load records (Mock or from API if supported)
  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Try to fetch real withdrawal transactions if API is ready
      const res = await AxiosAdmin({
        url: SummaryApi.getAllWithdrawals.url,
        method: SummaryApi.getAllWithdrawals.method
      });
      if (res.data.success && Array.isArray(res.data.data)) {
        setRecords(res.data.data);
      }
    } catch (error) {
      console.warn("Failed to load real withdrawals, showing local fake records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!userName.trim() || !amount) {
      toast.error('Please enter User Name and Amount');
      return;
    }

    const newRecord = {
      id: Date.now(),
      userName: userName.trim(),
      amount: Number(amount),
      method,
      upiId: upiId.trim() || 'N/A',
      status,
      note: note.trim() || 'N/A',
      createdAt: new Date().toISOString()
    };

    setRecords(prev => [newRecord, ...prev]);
    toast.success('Withdrawal record created successfully!');
    
    // Clear form inputs
    setUserName('');
    setAmount('');
    setUpiId('');
    setNote('');
  };

  const handleDeleteRecord = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    toast.success('Record deleted');
  };

  // Filtered records list
  const filteredRecords = records.filter((rec) => {
    // Search query
    const name = rec.userName || rec.userId?.name || '';
    const amt = String(rec.amount || '');
    const upi = rec.upiId || rec.accountDetails || '';
    const matchSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amt.includes(searchQuery) ||
      upi.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchStatus = statusFilter === 'All Status' || rec.status === statusFilter;
    
    // Method filter
    const matchMethod = methodFilter === 'All Methods' || rec.method === methodFilter;

    return matchSearch && matchStatus && matchMethod;
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans text-gray-800 text-left select-none">
      
      {/* 1. Page Header */}
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Withdrawal Management
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">
          Manage fake transaction records
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* 2. Add New Record Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 tracking-wide">
            Add New Record
          </h2>

          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* User Name */}
              <div>
                <input
                  type="text"
                  placeholder="User Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              {/* Amount */}
              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              {/* UPI/Method Selector */}
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer outline-none appearance-none shadow-3xs"
                >
                  <option value="UPI">UPI</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="Paytm">Paytm</option>
                </select>
                <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* UPI ID */}
              <div>
                <input
                  type="text"
                  placeholder="UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              {/* Status Selector */}
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer outline-none appearance-none shadow-3xs"
                >
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
                <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
              </div>

              {/* Note (optional) */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>
            </div>

            {/* Create Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              Create Withdrawal Record
            </button>
          </form>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder="Search name, amount or UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
            />
            <Search className="absolute left-3.5 top-2.5 text-gray-400 w-3.5 h-3.5" />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-fit">
            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-36 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer outline-none appearance-none"
              >
                <option value="All Status">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              <span className="absolute right-4 top-2.5 text-[9px] text-gray-400 pointer-events-none">▼</span>
            </div>

            {/* Method filter */}
            <div className="relative">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-36 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer outline-none appearance-none"
              >
                <option value="All Methods">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Google Pay">Google Pay</option>
                <option value="Paytm">Paytm</option>
              </select>
              <span className="absolute right-4 top-2.5 text-[9px] text-gray-400 pointer-events-none">▼</span>
            </div>
          </div>
        </div>

        {/* 4. Results List / Empty state */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-3xs min-h-[120px] flex flex-col justify-center">
          {filteredRecords.length === 0 ? (
            <span className="text-xs font-semibold text-gray-400 text-center">
              No records found
            </span>
          ) : (
            <div className="overflow-x-auto border border-[#ebe9f1] rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[700px] text-xs font-semibold text-gray-600">
                <thead>
                  <tr className="bg-[#f3f2f7] border-b border-[#ebe9f1] text-[10px] font-bold text-[#6e6b7b] uppercase tracking-wider">
                    <th className="p-3 pl-4">User</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">UPI ID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Note</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe9f1]">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 pl-4 font-bold text-gray-900">{rec.userName}</td>
                      <td className="p-3 font-bold text-gray-900">₹{rec.amount}</td>
                      <td className="p-3">{rec.method}</td>
                      <td className="p-3 text-gray-450">{rec.upiId}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase ${
                          rec.status === 'Success' ? 'bg-green-500' : rec.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400 italic">{rec.note}</td>
                      <td className="p-3 text-right pr-4">
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default WithdrawalManagement;
