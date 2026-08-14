import React, { useState, useEffect } from 'react';
import { 
  Settings, List, Plus, Trash2, Edit3, X, Check, Clock, Calendar, RefreshCw
} from 'lucide-react';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AddGame = () => {
  // --- ADD FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',       
    open_time: '', open_period: 'PM',
    close_time: '', close_period: 'PM',
    off_days: []
  });
  
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMarketData, setEditMarketData] = useState(null);

  // Delete Confirm Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // --- FETCH GAMES LOGIC ---
  const loadAllGames = async () => {
    setLoading(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.getGame.url,
        method: SummaryApi.getGame.method
      });
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setGamesList(response.data.data); 
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load markets list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllGames();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const currentDays = prev.off_days || [];
      const updated = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      return { ...prev, off_days: updated };
    });
  };

  const formatHHMMInput = (rawValue) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const handleTimeInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: formatHHMMInput(value)
    }));
  };

  const normalizeTimeOnBlur = (id, value) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    const withColon = cleaned.includes(":") ? cleaned : formatHHMMInput(cleaned);
    const parts = withColon.split(":");
    if (parts.length !== 2) return;

    const hh = parts[0].replace(/\D/g, "");
    const mm = parts[1].replace(/\D/g, "");
    if (!hh || !mm) return;

    const normalized = `${hh.padStart(2, "0").slice(0, 2)}:${mm.padStart(2, "0").slice(0, 2)}`;
    setFormData((prev) => ({ ...prev, [id]: normalized }));
  };

  const isValidTwelveHourTime = (timeValue) => !timeValue || /^(0[1-9]|1[0-2]):[0-5][0-9]$/.test(timeValue);

  const formatTimeTo12Hour = (time24) => {
    if (!time24) return "";
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours, 10);
    hours = hours % 12 || 12; 
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutes}`;
  };

  // ADD MARKET SUBMIT
  const handleSubmit = async () => {
    if (!formData.name || !formData.open_time || !formData.close_time) {
      toast.error("Please enter Market Name, Open Time and Close Time!");
      return;
    }
    if (
      !isValidTwelveHourTime(formData.open_time) ||
      !isValidTwelveHourTime(formData.close_time)
    ) {
      toast.error("Please enter valid time in HH:MM format (e.g. 04:30).");
      return;
    }

    const formattedOpenTime = `${formatTimeTo12Hour(formData.open_time)} ${formData.open_period}`;
    const formattedCloseTime = `${formatTimeTo12Hour(formData.close_time)} ${formData.close_period}`;

    try {
      const response = await AxiosAdmin({
        url: SummaryApi.addGame.url,
        method: SummaryApi.addGame.method,
        data: {
          market_name: formData.name, 
          name: formData.name,
          open_time: formattedOpenTime, 
          close_time: formattedCloseTime,
          open_result_time: formattedOpenTime,
          close_result_time: formattedCloseTime,
          off_days: formData.off_days
        }
      });

      toast.success(response.data.message || "Main Market added successfully! 🎉");
      
      setFormData({ 
        name: '', 
        open_time: '', open_period: 'PM',
        close_time: '', close_period: 'PM',
        off_days: []
      });
      
      loadAllGames(); 

    } catch (error) {
      console.error("Error adding game:", error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  // EDIT MARKET OPEN
  const openEditModal = (game) => {
    setEditMarketData({
      id: game._id || game.id,
      name: game.market_name || game.name || '',
      open_time: game.open_time || '',
      close_time: game.close_time || '',
      off_days: Array.isArray(game.off_days) ? game.off_days : []
    });
    setEditModalOpen(true);
  };

  // EDIT MARKET SUBMIT
  const handleEditSubmit = async () => {
    if (!editMarketData.name || !editMarketData.open_time || !editMarketData.close_time) {
      toast.error("Please fill Name, Open Time & Close Time!");
      return;
    }
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.updateMarket?.url || '/api/market/update-market',
        method: SummaryApi.updateMarket?.method || 'post',
        data: {
          id: editMarketData.id,
          marketId: editMarketData.id,
          market_name: editMarketData.name,
          name: editMarketData.name,
          open_time: editMarketData.open_time,
          close_time: editMarketData.close_time,
          open_result_time: editMarketData.open_time,
          close_result_time: editMarketData.close_time,
          off_days: editMarketData.off_days
        }
      });
      toast.success(response.data.message || "Market updated successfully! ✏️");
      setEditModalOpen(false);
      setEditMarketData(null);
      loadAllGames();
    } catch (error) {
      console.error("Error updating market:", error);
      toast.error("Failed to update market.");
    }
  };

  // TOGGLE MARKET STATUS
  const handleToggleStatus = async (gameId, currentIsClosed) => {
    const targetClosedState = !currentIsClosed;
    try {
      await AxiosAdmin({
        url: SummaryApi.updateGameStatus.url, 
        method: SummaryApi.updateGameStatus.method,
        data: { gameId: gameId, is_closed: targetClosedState }
      });
      setGamesList(prevGames => 
        prevGames.map(game => 
          (game._id === gameId || game.id === gameId) ? { ...game, is_closed: targetClosedState, status: targetClosedState ? 'Closed' : 'Active' } : game
        )
      );
      toast.success(`Market status updated!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update market status.");
    }
  };

  // DELETE MARKET LOGIC
  const triggerDeleteMarket = (gameId) => {
    setTargetDeleteId(gameId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMarket = async () => {
    try {
      const response = await AxiosAdmin({
        url: `${SummaryApi.deleteMarket.url}?id=${targetDeleteId}`,
        method: SummaryApi.deleteMarket.method,
        data: { marketId: targetDeleteId, id: targetDeleteId } 
      });

      toast.success(response.data.message || "Market deleted successfully!");
      setGamesList(prevGames => prevGames.filter(game => (game._id !== targetDeleteId && game.id !== targetDeleteId)));
    } catch (error) {
      console.error("Error deleting market:", error);
      toast.error(error?.response?.data?.message || "Failed to delete market.");
    } finally {
      setDeleteConfirmOpen(false);
      setTargetDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-5xl space-y-6">

        {/* 1. Header Banner & Add Card */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* Header Banner */}
          <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-3xs border border-blue-50">
                <Settings className="w-6 h-6 stroke-[2.2] animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Main Markets Manager</h1>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  Set Open Time (First 3-Digit Result) & Close Time (Last 3-Digit Result)
                </p>
              </div>
            </div>
            <button
              onClick={loadAllGames}
              className="p-2.5 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Refresh Markets List"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Add Game Form Block */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} className="text-blue-600" />
              <span>Add New Main Market</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Game Name */}
              <div className="space-y-1 text-xs md:col-span-2">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Market Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. KALYAN, MILAN DAY, TIME BAZAR"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs uppercase"
                />
              </div>

              {/* Open Time (First 3-digit result time) */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">
                  Open Time <span className="text-emerald-600 font-semibold">(Open 3-Digit Result)</span>
                </label>
                <div className="flex shadow-3xs border border-gray-300 rounded-xl bg-white focus-within:border-blue-500 overflow-hidden">
                  <input
                    type="text"
                    id="open_time"
                    placeholder="04:30"
                    maxLength={5}
                    value={formData.open_time}
                    onChange={handleTimeInputChange}
                    onBlur={(e) => normalizeTimeOnBlur('open_time', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    id="open_period"
                    value={formData.open_period}
                    onChange={handleChange}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Close Time (Last 3-digit result time) */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">
                  Close Time <span className="text-red-500 font-semibold">(Close 3-Digit Result)</span>
                </label>
                <div className="flex shadow-3xs border border-gray-300 rounded-xl bg-white focus-within:border-blue-500 overflow-hidden">
                  <input
                    type="text"
                    id="close_time"
                    placeholder="06:30"
                    maxLength={5}
                    value={formData.close_time}
                    onChange={handleTimeInputChange}
                    onBlur={(e) => normalizeTimeOnBlur('close_time', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    id="close_period"
                    value={formData.close_period}
                    onChange={handleChange}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Off Days Selection */}
              <div className="space-y-1.5 text-xs md:col-span-2 pt-1">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Market Off Days (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = (formData.off_days || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-500 text-white border-red-500 shadow-2xs'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit button */}
              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} className="stroke-[2.5]" />
                  <span>Add Main Market</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Games List Section */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <div className="bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <List className="text-blue-400 w-5 h-5" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">All Main Markets</h3>
            </div>
            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30">
              Total: {gamesList.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-600 border-collapse">
              <thead className="bg-[#f8f9fc] border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Market Name</th>
                  <th className="px-5 py-4">Open Time (First 3-Digit Result)</th>
                  <th className="px-5 py-4">Close Time (Last 3-Digit Result)</th>
                  <th className="px-5 py-4">Off Days</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-400 font-bold">Loading markets list...</td>
                  </tr>
                ) : gamesList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-400 font-bold">No markets added yet.</td>
                  </tr>
                ) : (
                  gamesList.map((game) => {
                    const isClosed = game.is_closed ?? (game.status === 'Closed' || game.status === 'closed');
                    const marketName = game.market_name || game.name || 'UNNAMED MARKET';
                    const marketId = game._id || game.id;
                    const offDaysList = Array.isArray(game.off_days) && game.off_days.length > 0 ? game.off_days.join(', ') : 'None';

                    return (
                      <tr key={marketId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-extrabold text-gray-900 uppercase">
                          {marketName}
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5 font-normal">
                            Live Result: <span className="font-bold text-orange-600">{game.display_result || '***-**-***'}</span>
                          </div>
                        </td>
                        
                        {/* Open Time */}
                        <td className="px-5 py-4 font-bold text-emerald-600">
                          {game.open_time}
                        </td>

                        {/* Close Time */}
                        <td className="px-5 py-4 font-bold text-red-500">
                          {game.close_time}
                        </td>

                        {/* Off Days */}
                        <td className="px-5 py-4 text-xs font-medium text-gray-500">
                          <span className={offDaysList !== 'None' ? 'text-red-500 font-bold' : 'text-gray-400'}>
                            {offDaysList}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-3xs ${
                            !isClosed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {!isClosed ? 'Active' : 'Closed'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center space-x-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(game)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 rounded-xl text-[10px] font-bold transition-all shadow-3xs cursor-pointer active:scale-95 inline-flex items-center gap-1"
                            title="Edit Market Details"
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>

                          {/* Toggle Status button */}
                          <button 
                            onClick={() => handleToggleStatus(marketId, isClosed)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all shadow-3xs cursor-pointer active:scale-95 ${
                              !isClosed 
                                ? 'bg-amber-500 hover:bg-amber-600' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {!isClosed ? 'Stop' : 'Start'}
                          </button>
                          
                          {/* Delete button */}
                          <button 
                            onClick={() => triggerDeleteMarket(marketId)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-200 rounded-xl text-[10px] font-bold transition-all shadow-3xs cursor-pointer active:scale-95 inline-flex items-center gap-1"
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* EDIT MARKET MODAL */}
      {editModalOpen && editMarketData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="text-blue-600" size={18} />
                <span>Edit Market Timings</span>
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Market Name</label>
                <input
                  type="text"
                  value={editMarketData.name}
                  onChange={(e) => setEditMarketData({ ...editMarketData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl font-bold uppercase outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Open Time (First 3-Digit)</label>
                  <input
                    type="text"
                    value={editMarketData.open_time}
                    onChange={(e) => setEditMarketData({ ...editMarketData, open_time: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl font-semibold outline-none focus:border-blue-500 text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1">Close Time (Last 3-Digit)</label>
                  <input
                    type="text"
                    value={editMarketData.close_time}
                    onChange={(e) => setEditMarketData({ ...editMarketData, close_time: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl font-semibold outline-none focus:border-blue-500 text-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-500 uppercase tracking-wider mb-1.5">Off Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = (editMarketData.off_days || []).includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          const current = editMarketData.off_days || [];
                          const updated = current.includes(day)
                            ? current.filter((d) => d !== day)
                            : [...current, day];
                          setEditMarketData({ ...editMarketData, off_days: updated });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          isSelected ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                <Check size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation delete modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Market Config?"
        message="Are you sure you want to delete this game market configurator permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMarket}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

    </div>
  );
};

export default AddGame;