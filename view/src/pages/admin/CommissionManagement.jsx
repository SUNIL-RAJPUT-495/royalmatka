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
  const [commissions, setCommissions] = useState([
    { id: 1, name: 'Default Withdraw Fee', code: 'WITHDRAW_FEE', type: 'Flat Amount', amount: 10, minWithdrawal: 100, maxFee: null, description: 'Standard flat transaction fee applied to all withdrawals.' },
    { id: 2, name: 'VIP Agent Commission', code: 'VIP_COMMISSION', type: 'Percentage', amount: 5, minWithdrawal: 500, maxFee: 50, description: 'Special reward commission rate for high volume agent referrals.' }
  ]);

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
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-2xl space-y-6">

        {/* 1. Header Card */}
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-start gap-4">
            <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-3xs border border-blue-50">
              <Percent className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Commission & Fees</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Manage commission rules and transaction fees applied across the system
              </p>
            </div>
          </div>

          {/* Create Commission Form */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Create New Commission Rule
            </h2>

            <form onSubmit={handleCreateCommission} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Commission Name */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Commission Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard Withdraw Fee"
                    value={commName}
                    onChange={(e) => setCommName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                  />
                </div>

                {/* Unique Code */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Unique Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WITHDRAW_FEE"
                    value={uniqueCode}
                    onChange={(e) => setUniqueCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs uppercase"
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Charge Type</label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 cursor-pointer outline-none appearance-none shadow-3xs"
                    >
                      <option value="Flat Amount">Flat Amount (₹)</option>
                      <option value="Percentage">Percentage (%)</option>
                    </select>
                    <span className="absolute right-4 top-3 text-[10px] text-gray-400 pointer-events-none">▼</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">
                    {type === 'Percentage' ? 'Rate (%)' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                  />
                </div>

                {/* Min Withdrawal */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Min Threshold</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={minWithdrawal}
                    onChange={(e) => setMinWithdrawal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                  />
                </div>

                {/* Max Fee */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Max Fee Capping (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Explain rule details..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs resize-none"
                />
              </div>

              {/* Action button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>Create Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. Existing Rules List Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
            Existing Commission & Fee Rules
          </h2>

          {commissions.length === 0 ? (
            <div className="bg-white rounded-xl p-10 border border-gray-200 shadow-3xs text-center text-xs text-gray-400 font-semibold">
              No commission rules created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((comm) => (
                <div 
                  key={comm.id} 
                  className="bg-white rounded-xl border border-gray-200 p-5 flex justify-between items-center gap-4 hover:border-blue-200 transition-colors shadow-3xs"
                >
                  <div className="space-y-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs uppercase tracking-wide">{comm.name}</span>
                      <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        {comm.code}
                      </span>
                    </div>
                    <p className="text-gray-450 text-[11px] font-semibold leading-relaxed truncate max-w-md">{comm.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-bold mt-2">
                      <span>Rate: <span className="text-blue-600 font-black">{comm.type === 'Percentage' ? `${comm.amount}%` : `₹${comm.amount}`}</span></span>
                      {comm.minWithdrawal && <span>Min Threshold: ₹{comm.minWithdrawal}</span>}
                      {comm.maxFee && <span>Max Capping: ₹{comm.maxFee}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCommission(comm.id)}
                    className="p-2 bg-red-50 hover:bg-red-500 hover:text-white border border-red-155 text-red-500 rounded-lg transition-all cursor-pointer shrink-0 active:scale-95"
                    title="Delete Rule"
                  >
                    <Trash2 size={13} />
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
