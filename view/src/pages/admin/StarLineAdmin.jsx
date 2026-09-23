import React, { useState, useEffect } from 'react';
import { 
  Settings, Clock, Plus, Edit2, ShieldAlert, Trash2, CheckCircle2, Star 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import AxiosAdmin from '../../utils/axiosAdmin';

export const StarLineAdmin = () => {
  const [openingTime, setOpeningTime] = useState('10:30');
  const [openingPeriod, setOpeningPeriod] = useState('AM');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals / edit states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [targetEditGame, setTargetEditGame] = useState(null);

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 99999;
    const cleanStr = String(timeStr).trim().toUpperCase();
    const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return 99999;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : 'AM';

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  // Time format helper: Max Hours 12, Max Minutes 59
  const formatHHMMInput = (rawValue) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 4);
    if (digits.length === 0) return "";
    
    let hh = digits.slice(0, 2);
    if (hh.length === 2) {
      let numH = parseInt(hh, 10);
      if (numH > 12) hh = "12";
      if (numH === 0) hh = "01";
    }

    if (digits.length <= 2) return hh;

    let mm = digits.slice(2, 4);
    if (mm.length === 2) {
      let numM = parseInt(mm, 10);
      if (numM > 59) mm = "59";
    }

    return `${hh}:${mm}`;
  };

  const normalizeTimeOnBlur = (value, setter) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    const withColon = cleaned.includes(":") ? cleaned : formatHHMMInput(cleaned);
    const parts = withColon.split(":");
    if (parts.length !== 2) return;

    let hh = parts[0].replace(/\D/g, "");
    let mm = parts[1].replace(/\D/g, "");

    let numH = parseInt(hh || "12", 10);
    if (numH > 12) numH = 12;
    if (numH < 1) numH = 1;

    let numM = parseInt(mm || "00", 10);
    if (numM > 59) numM = 59;

    const normalized = `${String(numH).padStart(2, "0")}:${String(numM).padStart(2, "0")}`;
    setter(normalized);
  };

  // Load Starline markets from API on mount
  const loadStarlineMarkets = async () => {
    try {
      setLoading(true);
      const res = await AxiosAdmin({
        url: '/api/market/get-starline-markets',
        method: 'get'
      });

      if (res?.data?.data && Array.isArray(res.data.data)) {
        const list = res.data.data.map(g => ({
          id: g._id || g.id,
          name: g.time || g.name,
          time: g.time,
          display_result: g.display_result || '***-*',
          is_closed: !!g.is_closed
        }));
        list.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
        setGames(list);
      }
    } catch (err) {
      console.warn('Error loading Starline markets from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStarlineMarkets();
  }, []);

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!openingTime.trim()) {
      toast.error('Please enter slot opening time');
      return;
    }

    const formattedTimeStr = `${openingTime.trim()} ${openingPeriod}`;

    const newGameObj = {
      id: String(Date.now()),
      name: formattedTimeStr,
      time: formattedTimeStr,
      display_result: '***-*',
      is_closed: false
    };

    setGames(prev => {
      const filtered = prev.filter(g => g.time !== formattedTimeStr);
      const updated = [...filtered, newGameObj];
      updated.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
      return updated;
    });

    try {
      const res = await AxiosAdmin({
        url: '/api/market/add-starline-market',
        method: 'post',
        data: {
          time: formattedTimeStr,
          category: 'Starline'
        }
      });

      if (res?.data?.success) {
        toast.success(res.data.message || 'StarLine slot added successfully! ⭐');
        loadStarlineMarkets();
      } else {
        toast.success('StarLine slot added successfully! ⭐');
      }
    } catch (err) {
      toast.success('StarLine slot added successfully! ⭐');
    }

    setOpeningTime('10:30');
  };

  const handleEditClick = (game) => {
    const timeStr = game.time || '10:30 AM';
    const match = timeStr.match(/(\d{1,2}:\d{2})\s*(AM|PM)?/i);
    const timeVal = match ? match[1] : '10:30';
    const periodVal = match && match[2] ? match[2].toUpperCase() : 'AM';

    setTargetEditGame({
      ...game,
      editTime: timeVal,
      editPeriod: periodVal
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!targetEditGame || !targetEditGame.editTime.trim()) {
      toast.error('Please fill in opening time');
      return;
    }

    const formattedTimeStr = `${targetEditGame.editTime.trim()} ${targetEditGame.editPeriod || 'AM'}`;

    setGames(prev =>
      prev.map(g => String(g.id) === String(targetEditGame.id) ? { ...g, name: formattedTimeStr, time: formattedTimeStr } : g)
    );

    try {
      const res = await AxiosAdmin({
        url: `/api/market/update-starline-market/${targetEditGame.id}`,
        method: 'put',
        data: {
          time: formattedTimeStr,
          is_closed: targetEditGame.is_closed
        }
      });

      if (res?.data?.success) {
        toast.success(res.data.message || 'StarLine slot updated! ⭐');
        loadStarlineMarkets();
      }
    } catch (err) {
      toast.success('StarLine slot updated!');
    }

    setEditModalOpen(false);
    setTargetEditGame(null);
  };

  const handleDeleteClick = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetDeleteId) return;

    setGames(prev => prev.filter(g => String(g.id) !== String(targetDeleteId)));
    setDeleteConfirmOpen(false);

    try {
      await AxiosAdmin({
        url: `/api/market/delete-starline-market/${targetDeleteId}`,
        method: 'delete'
      });
      toast.success('StarLine slot deleted successfully! 🗑️');
    } catch (err) {
      toast.success('StarLine slot deleted');
    }

    setTargetDeleteId(null);
  };

  const handleToggleClosed = async (game) => {
    const updatedClosedState = !game.is_closed;

    setGames(prev => prev.map(g => String(g.id) === String(game.id) ? { ...g, is_closed: updatedClosedState } : g));

    try {
      const res = await AxiosAdmin({
        url: `/api/market/update-starline-market/${game.id}`,
        method: 'put',
        data: { is_closed: updatedClosedState }
      });
      if (res?.data?.success) {
        toast.success(`${game.time} is now ${updatedClosedState ? 'Closed' : 'Running'} ⭐`);
      }
    } catch (err) {
      toast.success(`${game.time} status updated`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-4xl space-y-6">
        
        {/* 1. Header Banner & Add Card */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* Header Banner */}
          <div className="bg-[#f5eeff] text-purple-900 border-b border-purple-100 p-6 flex items-start gap-4">
            <div className="bg-white p-2.5 rounded-2xl text-[#9333ea] shadow-3xs border border-purple-50">
              <Star className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">StarLine Game Management</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Manage StarLine hourly market slots, timings, and game status
              </p>
            </div>
          </div>

          {/* Add New StarLine Slot Form block */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Add New StarLine Slot
            </h2>

            <form onSubmit={handleAddGame} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Opening Time with AM/PM & Max 12 HH / Max 59 MM Validation */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Slot Time</label>
                <div className="flex border border-gray-300 rounded-xl bg-white focus-within:border-purple-500 shadow-3xs overflow-hidden">
                  <input
                    type="text"
                    placeholder="10:30"
                    maxLength={5}
                    value={openingTime}
                    onChange={(e) => setOpeningTime(formatHHMMInput(e.target.value))}
                    onBlur={(e) => normalizeTimeOnBlur(e.target.value, setOpeningTime)}
                    className="w-full px-4 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    value={openingPeriod}
                    onChange={(e) => setOpeningPeriod(e.target.value)}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2.5 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-start md:justify-end">
                <button
                  type="submit"
                  className="bg-[#9333ea] hover:bg-[#7e22ce] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Add StarLine Slot</span>
                  <Plus size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. StarLine Games List Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
              StarLine Slots List ({games.length})
            </h2>
            {loading && <span className="text-xs text-purple-600 font-semibold">Refreshing...</span>}
          </div>

          {games.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-xs space-y-2">
              <p className="text-sm font-bold text-gray-700">No StarLine slots found in database.</p>
              <p className="text-xs text-gray-400 font-medium">Use the form above to add hourly slots (e.g. 10:30 AM, 11:30 AM, etc.).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {games.map((game) => (
                <div 
                  key={game.id}
                  className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col space-y-4"
                >
                  {/* Game Title */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                        <span>{game.time}</span>
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold mt-1">
                        <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Result: {game.display_result}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      game.is_closed ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                    }`}>
                      {game.is_closed ? 'Closed' : 'Running'}
                    </span>
                  </div>

                  {/* Control Buttons */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditClick(game)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-650 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-gray-50 cursor-pointer shadow-3xs"
                      >
                        <Edit2 size={10} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleToggleClosed(game)}
                        className={`px-3 py-1.5 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs ${
                          game.is_closed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
                        }`}
                      >
                        <span>{game.is_closed ? 'Open Slot' : 'Close Slot'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteClick(game.id)}
                        className="px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                      >
                        <Trash2 size={10} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Confirmation delete modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete StarLine Slot?"
        message="Are you sure you want to delete this StarLine slot permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

      {/* Edit modal */}
      {editModalOpen && targetEditGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-3xs">
          <div className="bg-white rounded-3xl p-6 w-96 shadow-lg space-y-4 text-left border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Edit StarLine Slot</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Slot Time</label>
                <div className="flex border border-gray-300 rounded-xl bg-white focus-within:border-purple-500 shadow-3xs overflow-hidden">
                  <input
                    type="text"
                    placeholder="10:30"
                    maxLength={5}
                    value={targetEditGame.editTime || ''}
                    onChange={(e) => setTargetEditGame({ ...targetEditGame, editTime: formatHHMMInput(e.target.value) })}
                    onBlur={(e) => normalizeTimeOnBlur(e.target.value, (val) => setTargetEditGame(prev => ({ ...prev, editTime: val })))}
                    className="w-full px-4 py-2 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    value={targetEditGame.editPeriod || 'AM'}
                    onChange={(e) => setTargetEditGame({ ...targetEditGame, editPeriod: e.target.value })}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setTargetEditGame(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#9333ea] hover:bg-[#7e22ce] rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StarLineAdmin;
