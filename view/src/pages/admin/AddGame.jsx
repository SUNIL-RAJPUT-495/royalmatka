import React, { useState, useEffect } from 'react';
import { 
  Settings, List, Plus, Trash2, Eye, Play, Square, Loader2 
} from 'lucide-react';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import { fetchGame } from '../../utils/api';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const AddGame = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '',       
    open_result_time: '', open_result_period: 'AM',   
    close_result_time: '', close_result_period: 'PM'          
  });
  
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Custom Modal States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);

  // --- FETCH GAMES LOGIC ---
  const loadAllGames = async () => {
    setLoading(true);
    try {
      const response = await fetchGame(); 
      if (response && response.data) {
        setGamesList(response.data); 
      } else if (Array.isArray(response)) {
        setGamesList(response);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
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

  const isValidTwelveHourTime = (timeValue) => /^(0[1-9]|1[0-2]):[0-5][0-9]$/.test(timeValue);

  const formatTimeTo12Hour = (time24) => {
    if (!time24) return "";
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours, 10);
    hours = hours % 12 || 12; 
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutes}`;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.open_result_time || !formData.close_result_time) {
      toast.error("Please fill Game Name and timing fields!");
      return;
    }
    if (
      !isValidTwelveHourTime(formData.open_result_time) ||
      !isValidTwelveHourTime(formData.close_result_time)
    ) {
      toast.error("Please enter valid time in HH:MM format (e.g. 04:10).");
      return;
    }

    const formattedOpenResultTime = `${formatTimeTo12Hour(formData.open_result_time)} ${formData.open_result_period}`;
    const formattedCloseResultTime = `${formatTimeTo12Hour(formData.close_result_time)} ${formData.close_result_period}`;

    try {
      const response = await AxiosAdmin({
        url: SummaryApi.addGame.url,
        method: SummaryApi.addGame.method,
        data: {
          market_name: formData.name, 
          name: formData.name,
          open_time: formattedOpenResultTime, 
          close_time: formattedCloseResultTime,
          open_result_time: formattedOpenResultTime,
          close_result_time: formattedCloseResultTime
        }
      });

      toast.success(response.data.message || "Main Market added successfully! 🎉");
      
      setFormData({ 
        name: '', 
        open_result_time: '', open_result_period: 'AM',
        close_result_time: '', close_result_period: 'PM'
      });
      
      loadAllGames(); 

    } catch (error) {
      console.error("Error adding game:", error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  // --- TOGGLE GAME STATUS LOGIC ---
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

  // --- DELETE MARKET LOGIC ---
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
      
      <div className="w-full max-w-4xl space-y-6">

        {/* 1. Header Banner & Add Card (Combined) */}
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* Header Banner */}
          <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-start gap-4">
            <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-3xs border border-blue-50">
              <Settings className="w-6 h-6 stroke-[2.2] animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Admin Game Manager</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Manage your Games/Markets and their timings
              </p>
            </div>
          </div>

          {/* Add Game form block */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Add New Game
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Game Name */}
              <div className="space-y-1 text-xs md:col-span-2">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Game Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. SITA MORNING"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs uppercase"
                />
              </div>

              {/* Opening Time */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                <div className="flex shadow-3xs border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 overflow-hidden">
                  <input
                    type="text"
                    id="open_result_time"
                    placeholder="HH:MM"
                    maxLength={5}
                    value={formData.open_result_time}
                    onChange={handleTimeInputChange}
                    onBlur={(e) => normalizeTimeOnBlur('open_result_time', e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    id="open_result_period"
                    value={formData.open_result_period}
                    onChange={handleChange}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Closing Time */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Closing Time</label>
                <div className="flex shadow-3xs border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 overflow-hidden">
                  <input
                    type="text"
                    id="close_result_time"
                    placeholder="HH:MM"
                    maxLength={5}
                    value={formData.close_result_time}
                    onChange={handleTimeInputChange}
                    onBlur={(e) => normalizeTimeOnBlur('close_result_time', e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    id="close_result_period"
                    value={formData.close_result_period}
                    onChange={handleChange}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Add Market</span>
                  <Plus size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Games List Section */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center gap-3">
            <List className="text-white w-5 h-5" />
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">All Active & Closed Games</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-gray-600 border-collapse">
              <thead className="bg-[#f8f9fc] border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Game Name</th>
                  <th className="px-5 py-4">Bid Times (Open - Close)</th>
                  <th className="px-5 py-4">Result Times (Open - Close)</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-400 font-bold">Loading markets...</td>
                  </tr>
                ) : gamesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-400 font-bold">No markets added yet.</td>
                  </tr>
                ) : (
                  gamesList.map((game) => {
                    const isClosed = game.is_closed ?? (game.status === 'Closed' || game.status === 'closed');
                    const marketName = game.market_name || game.name || 'UNNAMED MARKET';
                    const marketId = game._id || game.id;

                    return (
                      <tr key={marketId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-gray-900 uppercase">{marketName}</td>
                        
                        {/* Bid Times */}
                        <td className="px-5 py-4 font-semibold text-gray-500">
                          <div className="text-emerald-600">O: {game.open_time}</div>
                          <div className="text-red-500 mt-0.5">C: {game.close_time}</div>
                        </td>

                        {/* Result Times */}
                        <td className="px-5 py-4 font-semibold text-gray-500">
                          <div className="text-blue-600">O: {game.open_result_time || game.open_time || 'N/A'}</div>
                          <div className="text-purple-600 mt-0.5">C: {game.close_result_time || game.close_time || 'N/A'}</div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold text-white uppercase shadow-3xs ${
                            !isClosed ? 'bg-emerald-500' : 'bg-red-500'
                          }`}>
                            {!isClosed ? 'Active' : 'Closed'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center space-x-2">
                          <button 
                            onClick={() => handleToggleStatus(marketId, isClosed)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all shadow-3xs cursor-pointer active:scale-95 ${
                              !isClosed 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            {!isClosed ? 'Stop Betting' : 'Start Betting'}
                          </button>
                          
                          <button 
                            onClick={() => triggerDeleteMarket(marketId)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-100 rounded-lg text-[10px] font-bold transition-all shadow-3xs cursor-pointer active:scale-95"
                          >
                            Delete
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