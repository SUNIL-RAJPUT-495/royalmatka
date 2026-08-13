import React, { useState, useEffect } from 'react';
import { 
  Zap, Star, Clock, Trophy, Search, Plus, Edit3, Trash2, Eye, EyeOff, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const GameRatesAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Modal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  
  const [editOpen, setEditOpen] = useState(false);
  const [editRate, setEditRate] = useState(null); // { id, name, value, category }
  
  const [addOpen, setAddOpen] = useState(false);
  const [newRateCategory, setNewRateCategory] = useState('Main Pana');
  const [newRateName, setNewRateName] = useState('');
  const [newRateDesc, setNewRateDesc] = useState('');
  const [newRateValue, setNewRateValue] = useState('1 ka 10');

  // Hardcoded default fallback list matching the screenshots exactly
  const [rates, setRates] = useState([
    // Main Pana (Blue)
    { id: 1, name: 'Single ank', desc: 'Single digit betting', value: '1 ka 10', category: 'Main Pana', starred: false, active: true },
    { id: 2, name: 'Jodi', desc: 'Two digit combination', value: '1 ka 100', category: 'Main Pana', starred: true, active: true },
    { id: 3, name: 'Single Panna', desc: 'Three digit single panna', value: '1 ka 160', category: 'Main Pana', starred: false, active: true },
    { id: 4, name: 'Double Panna', desc: 'Three digit double panna', value: '1 ka 320', category: 'Main Pana', starred: false, active: true },
    { id: 5, name: 'Triple Panna', desc: 'Three digit triple panna', value: '1 ka 800', category: 'Main Pana', starred: false, active: true },
    { id: 6, name: 'Half Sangam', desc: 'Half sangam combination', value: '1 ka 1000', category: 'Main Pana', starred: false, active: true },
    { id: 7, name: 'Full Sangam', desc: 'Full sangam combination', value: '1 ka 10000', category: 'Main Pana', starred: false, active: true },

    // Starline (Purple)
    { id: 8, name: 'Single ank', desc: 'Single digit betting', value: '1 ka 10', category: 'Starline', starred: false, active: true },
    { id: 9, name: 'Single Panna', desc: 'Three digit single panna', value: '1 ka 160', category: 'Starline', starred: false, active: true },
    { id: 10, name: 'Double Panna', desc: 'Three digit double panna', value: '1 ka 320', category: 'Starline', starred: false, active: true },
    { id: 11, name: 'Triple Panna', desc: 'Three digit triple panna', value: '1 ka 800', category: 'Starline', starred: true, active: true },

    // Gali / Disawar (Green)
    { id: 12, name: 'Single ank', desc: 'Single digit betting', value: '1 ka 10', category: 'Gali / Disawar', starred: true, active: true },
    { id: 13, name: 'Jodi', desc: 'Two digit combination', value: '1 ka 100', category: 'Gali / Disawar', starred: false, active: true },

    // Jackpot (Orange)
    { id: 14, name: 'Jodi', desc: 'Two digit combination', value: '1 ka 100', category: 'Jackpot', starred: false, active: true },
  ]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getGameRates?.url,
        method: SummaryApi.getGameRates?.method || 'get'
      });
      if (res.data && Array.isArray(res.data.data)) {
        // Map backend rates into our formatted category structures if exists
        setRates(res.data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch rates from backend, keeping default UI data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleToggleActive = (id) => {
    setRates(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    toast.success('Rate status updated!');
  };

  const handleEditClick = (rate) => {
    setEditRate({ ...rate });
    setEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editRate.name.trim() || !editRate.value.trim()) {
      toast.error('Name and Rate Value cannot be empty');
      return;
    }
    setRates(prev => prev.map(r => r.id === editRate.id ? { ...editRate } : r));
    setEditOpen(false);
    setEditRate(null);
    toast.success('Rate updated successfully!');
  };

  const handleDeleteClick = (id) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteRate = () => {
    setRates(prev => prev.filter(r => r.id !== pendingDeleteId));
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
    toast.success('Rate deleted successfully');
  };

  const handleAddClick = (category) => {
    setNewRateCategory(category);
    setNewRateName('');
    setNewRateDesc('');
    setNewRateValue('1 ka 10');
    setAddOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!newRateName.trim() || !newRateValue.trim()) {
      toast.error('Please enter Name and Rate Value');
      return;
    }

    const newRate = {
      id: Date.now(),
      name: newRateName,
      desc: newRateDesc || `${newRateName} betting`,
      value: newRateValue,
      category: newRateCategory,
      starred: false,
      active: true
    };

    setRates(prev => [...prev, newRate]);
    setAddOpen(false);
    toast.success('New rate category created!');
  };

  // Grouped category properties matching screenshots
  const categoriesConfig = [
    { name: 'Main Pana', color: 'blue', themeBg: 'bg-[#3b82f6]', border: 'border-blue-100', icon: Zap, subtitle: 'Single Ank, Jodi, Panna, Sangam' },
    { name: 'Starline', color: 'purple', themeBg: 'bg-[#a855f7]', border: 'border-purple-100', icon: Star, subtitle: 'Single Ank, Panna' },
    { name: 'Gali / Disawar', color: 'green', themeBg: 'bg-[#10b981]', border: 'border-emerald-100', icon: Clock, subtitle: 'Jodi Digit, Jodi Bulk, Digit Based' },
    { name: 'Jackpot', color: 'orange', themeBg: 'bg-[#f97316]', border: 'border-orange-100', icon: Trophy, subtitle: 'Jodi Digit, Jodi Bulk, Digit Based' }
  ];

  // Filters search values
  const filteredRates = rates.filter(rate => 
    rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-5xl space-y-6">

        {/* 1. Header Card with Search on the Right */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Game Rates Management</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              {rates.length} total rates • {rates.filter(r => r.active).length} active
            </p>
          </div>

          {/* Search field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search across all categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
            />
          </div>
        </div>

        {/* 2. Metric Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriesConfig.map((cat) => {
            const IconComponent = cat.icon;
            const count = rates.filter(r => r.category === cat.name).length;
            
            let iconColorClass = 'text-blue-500 bg-blue-50 border-blue-100';
            if (cat.color === 'purple') iconColorClass = 'text-purple-500 bg-purple-50 border-purple-100';
            if (cat.color === 'green') iconColorClass = 'text-green-500 bg-emerald-50 border-emerald-100';
            if (cat.color === 'orange') iconColorClass = 'text-orange-500 bg-orange-50 border-orange-100';

            return (
              <div 
                key={cat.name} 
                className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-3xs flex items-center gap-4`}
              >
                <div className={`p-2.5 rounded-xl border ${iconColorClass}`}>
                  <IconComponent size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">{cat.name}</span>
                  <span className="text-xl font-bold text-gray-900 block mt-0.5">{count}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Category Sections List Grid */}
        <div className="space-y-6">
          {categoriesConfig.map((cat) => {
            const IconComponent = cat.icon;
            const catRates = filteredRates.filter(r => r.category === cat.name);
            
            // Styled color mapping for UI elements
            let rateBadgeClass = 'bg-blue-50 text-blue-700 border-blue-100';
            if (cat.color === 'purple') rateBadgeClass = 'bg-purple-50 text-purple-700 border-purple-100';
            if (cat.color === 'green') rateBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
            if (cat.color === 'orange') rateBadgeClass = 'bg-orange-50 text-orange-700 border-orange-100';

            return (
              <div key={cat.name} className="rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-3xs">
                
                {/* Section Header bar */}
                <div className={`${cat.themeBg} text-white p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl text-white">
                      <IconComponent size={16} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs uppercase tracking-wider">{cat.name}</h3>
                        <span className="bg-white/30 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {rates.filter(r => r.category === cat.name).length} rates
                        </span>
                      </div>
                      <p className="text-[10px] text-white/80 font-medium mt-0.5">{cat.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddClick(cat.name)}
                    className="border border-white/40 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    <span>+ Add Rate</span>
                  </button>
                </div>

                {/* Rows listing */}
                {catRates.length === 0 ? (
                  <div className="p-6 text-center text-xs font-semibold text-gray-400">
                    No matching rates in this category
                  </div>
                ) : (
                  <div className="divide-y divide-gray-150">
                    {catRates.map((rate) => (
                      <div 
                        key={rate.id} 
                        className={`p-4 flex items-center justify-between text-xs font-semibold hover:bg-gray-50/50 transition-colors ${!rate.active ? 'opacity-55' : ''}`}
                      >
                        {/* Left Side detail */}
                        <div className="flex items-center gap-3">
                          <div className="text-gray-300 flex flex-col gap-0.5">
                            <span className="text-[7px]">▲</span>
                            <span className="text-[7px]">▼</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-gray-900">{rate.name}</span>
                              {rate.starred && <span className="text-yellow-400 text-xs">⭐</span>}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">{rate.desc}</span>
                          </div>
                        </div>

                        {/* Right side controls */}
                        <div className="flex items-center gap-3">
                          {/* Rate Badge */}
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border uppercase tracking-wider ${rateBadgeClass}`}>
                            {rate.value}
                          </span>

                          {/* Eye / Visibility Status Toggle */}
                          <button
                            onClick={() => handleToggleActive(rate.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-90 ${
                              rate.active 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white' 
                                : 'bg-gray-50 text-gray-450 border-gray-200 hover:bg-gray-200'
                            }`}
                            title={rate.active ? "Deactivate Rate" : "Activate Rate"}
                          >
                            {rate.active ? <Eye size={12} /> : <EyeOff size={12} />}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(rate)}
                            className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer active:scale-90"
                            title="Edit Rate"
                          >
                            <Edit3 size={12} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(rate.id)}
                            className="p-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer active:scale-90"
                            title="Delete Rate"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Rate Entry?"
        message="Are you sure you want to delete this game rate entry configuration permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteRate}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />

      {/* Edit Rate Modal popup */}
      {editOpen && editRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-3xs">
          <div className="bg-white rounded-3xl p-6 w-96 border border-gray-200 shadow-lg text-left space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Edit Game Rate</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Rate Name</label>
                <input
                  type="text"
                  value={editRate.name}
                  onChange={(e) => setEditRate({ ...editRate, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={editRate.desc}
                  onChange={(e) => setEditRate({ ...editRate, desc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Rate Value</label>
                <input
                  type="text"
                  value={editRate.value}
                  onChange={(e) => setEditRate({ ...editRate, value: e.target.value })}
                  placeholder="e.g. 1 ka 10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditOpen(false);
                    setEditRate(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-105 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-3xs"
                >
                  Save Rates
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Rate Modal popup */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-3xs">
          <div className="bg-white rounded-3xl p-6 w-96 border border-gray-200 shadow-lg text-left space-y-4">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Add Game Rate - {newRateCategory}</h2>
            <form onSubmit={handleSaveAdd} className="space-y-4">
              
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Rate Name</label>
                <input
                  type="text"
                  placeholder="e.g. Single ank"
                  value={newRateName}
                  onChange={(e) => setNewRateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Single digit betting"
                  value={newRateDesc}
                  onChange={(e) => setNewRateDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Rate Value</label>
                <input
                  type="text"
                  placeholder="e.g. 1 ka 10"
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-105 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer shadow-3xs"
                >
                  Add Rate
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GameRatesAdmin;
