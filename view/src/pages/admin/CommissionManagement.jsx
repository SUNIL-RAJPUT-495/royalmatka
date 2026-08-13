import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Percent, DollarSign, Plus, Trash2 } from 'lucide-react';

export const CommissionManagement = () => {
  const [commName, setCommName] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const [type, setType] = useState('Flat Amount'); // Flat Amount or Percentage
  const [amount, setAmount] = useState('');
  const [minWithdrawal, setMinWithdrawal] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [description, setDescription] = useState('');

  // List of existing commissions
  const [commissions, setCommissions] = useState([]);

  const handleCreateCommission = (e) => {
    e.preventDefault();
    if (!commName.trim() || !uniqueCode.trim() || !amount) {
      toast.error('Please fill in Name, Unique Code and Amount');
      return;
    }

    const newComm = {
      id: Date.now(),
      name: commName.trim(),
      code: uniqueCode.trim().toUpperCase(),
      type,
      amount: Number(amount),
      minWithdrawal: minWithdrawal ? Number(minWithdrawal) : null,
      maxFee: maxFee ? Number(maxFee) : null,
      description: description.trim() || 'No description provided'
    };

    setCommissions(prev => [...prev, newComm]);
    toast.success('Commission rule created successfully!');
    
    // Reset form
    setCommName('');
    setUniqueCode('');
    setAmount('');
    setMinWithdrawal('');
    setMaxFee('');
    setDescription('');
  };

  const handleDeleteCommission = (id) => {
    setCommissions(prev => prev.filter(c => c.id !== id));
    toast.success('Commission rule removed');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans text-gray-800 text-left select-none">
      
      {/* 1. Page Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          Commission & Fees Management
        </h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* 2. Create Commission Form Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 tracking-wide border-b border-gray-100 pb-2">
            Create New Commission
          </h2>

          <form onSubmit={handleCreateCommission} className="space-y-3.5">
            {/* Commission Name */}
            <div>
              <input
                type="text"
                placeholder="Commission Name"
                value={commName}
                onChange={(e) => setCommName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 shadow-3xs"
              />
            </div>

            {/* Unique Code */}
            <div>
              <input
                type="text"
                placeholder="Unique Code (WITHDRAW_FEE)"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 shadow-3xs"
              />
            </div>

            {/* Flat Amount / Percentage Selector */}
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer outline-none appearance-none shadow-3xs"
              >
                <option value="Flat Amount">Flat Amount</option>
                <option value="Percentage">Percentage</option>
              </select>
              <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
            </div>

            {/* Amount */}
            <div>
              <input
                type="number"
                placeholder={type === 'Percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 shadow-3xs"
              />
            </div>

            {/* Min Withdrawal Amount */}
            <div>
              <input
                type="number"
                placeholder="Min Withdrawal Amount"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 shadow-3xs"
              />
            </div>

            {/* Max Fee */}
            <div>
              <input
                type="number"
                placeholder="Max Fee (optional)"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 shadow-3xs"
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                placeholder="Description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-purple-500 shadow-3xs resize-none"
              />
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <Plus size={14} className="stroke-[2.5]" />
                <span>Create Commission</span>
              </button>
            </div>
          </form>
        </div>

        {/* 3. Existing Commissions List Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 tracking-wide border-b border-gray-100 pb-2">
            Existing Commissions
          </h2>

          {commissions.length === 0 ? (
            <div className="text-xs text-gray-400 font-semibold py-2">
              No commissions created yet
            </div>
          ) : (
            <div className="space-y-3">
              {commissions.map((comm) => (
                <div 
                  key={comm.id} 
                  className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex justify-between items-center gap-4 hover:border-indigo-100 transition-colors"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{comm.name}</span>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {comm.code}
                      </span>
                    </div>
                    <p className="text-gray-450 font-semibold leading-relaxed">{comm.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-bold mt-2">
                      <span>Rate: <span className="text-indigo-650">{comm.type === 'Percentage' ? `${comm.amount}%` : `₹${comm.amount}`}</span></span>
                      {comm.minWithdrawal && <span>Min W/D: ₹{comm.minWithdrawal}</span>}
                      {comm.maxFee && <span>Max Fee: ₹{comm.maxFee}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCommission(comm.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Delete Rule"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CommissionManagement;
