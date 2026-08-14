import React, { useState, useEffect } from 'react';
import { 
  Settings, Clock, Plus, Edit2, Calendar, ShieldAlert, Trash2, CheckCircle2, Play, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import { fetchGame } from '../../utils/api';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const AdminPanel = () => {
  // Add new mechanic form states
  const [mechanicName, setMechanicName] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [openingPeriod, setOpeningPeriod] = useState('AM');
  const [closingTime, setClosingTime] = useState('');
  const [closingPeriod, setClosingPeriod] = useState('PM');

  const formatHHMMInput = (rawValue) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 4);
    if (digits.length === 0) return "";
    
    // Validate Hours (max 12, min 01 if 2 digits entered)
    let hh = digits.slice(0, 2);
    if (hh.length === 2) {
      let numH = parseInt(hh, 10);
      if (numH > 12) hh = "12";
      if (numH === 0) hh = "01";
    }

    if (digits.length <= 2) return hh;

    // Validate Minutes (max 59)
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

  // Mechanics / Markets list state (From MongoDB)
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal control states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [targetEditMech, setTargetEditMech] = useState(null);

  // Add Specific Holiday modal states
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [targetHolidayMechId, setTargetHolidayMechId] = useState(null);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayReason, setHolidayReason] = useState('');

  // Weekly Holiday Schedule modal states
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);
  const [targetWeeklyMechId, setTargetWeeklyMechId] = useState(null);
  const [selectedDays, setSelectedDays] = useState({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false
  });

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 99999;
    const cleanStr = String(timeStr).trim().toUpperCase();
    const match = cleanStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!match) return 99999;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] || 'AM';

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  // --- FETCH MARKETS FROM MONGO DB ---
  const loadAllGames = async () => {
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getGame.url,
        method: SummaryApi.getGame.method
      });
      let dataList = res?.data?.data || res?.data;
      if (!Array.isArray(dataList)) {
        dataList = await fetchGame();
      }
      if (Array.isArray(dataList)) {
        const sorted = [...dataList].sort((a, b) => parseTimeToMinutes(a.open_time) - parseTimeToMinutes(b.open_time));
        setMechanics(sorted.map(m => ({
          id: m._id || m.id,
          name: m.market_name || m.name || 'UNNAMED MARKET',
          open: m.open_time || '10:00 AM',
          close: m.close_time || '11:00 AM',
          weekly: Array.isArray(m.off_days) && m.off_days.length > 0 ? m.off_days.map(d => `Every ${d}`).join(', ') : '',
          isHoliday: m.is_closed ?? false,
          holidayDetails: m.is_closed ? { date: 'Active', reason: 'Stopped' } : null,
          raw: m
        })));
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error);
      toast.error('Failed to load markets from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllGames();
  }, []);

  const handleAddMechanic = async (e) => {
    e.preventDefault();
    if (!mechanicName.trim() || !openingTime || !closingTime) {
      toast.error('Please fill name, opening time, and closing time');
      return;
    }

    const fullOpenTime = `${openingTime} ${openingPeriod}`;
    const fullCloseTime = `${closingTime} ${closingPeriod}`;

    try {
      const response = await AxiosAdmin({
        url: SummaryApi.addGame.url,
        method: SummaryApi.addGame.method,
        data: {
          market_name: mechanicName.trim().toUpperCase(),
          name: mechanicName.trim().toUpperCase(),
          open_time: fullOpenTime,
          close_time: fullCloseTime
        }
      });
      toast.success(response.data.message || 'Market added to database! 🎉');
      setMechanicName('');
      setOpeningTime('');
      setClosingTime('');
      loadAllGames();
    } catch (error) {
      console.error('Error adding market:', error);
      toast.error(error?.response?.data?.message || 'Failed to add market.');
    }
  };

  const handleEditClick = (mech) => {
    setTargetEditMech({ ...mech });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!targetEditMech.name.trim() || !targetEditMech.open || !targetEditMech.close) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await AxiosAdmin({
        url: SummaryApi.updateMarket?.url || '/api/market/update-market',
        method: SummaryApi.updateMarket?.method || 'post',
        data: {
          id: targetEditMech.id,
          marketId: targetEditMech.id,
          market_name: targetEditMech.name.trim().toUpperCase(),
          name: targetEditMech.name.trim().toUpperCase(),
          open_time: targetEditMech.open,
          close_time: targetEditMech.close
        }
      });
      toast.success('Market updated in database! ✏️');
      setEditModalOpen(false);
      setTargetEditMech(null);
      loadAllGames();
    } catch (error) {
      console.error('Error updating market:', error);
      toast.error('Failed to update market.');
    }
  };

  const handleDeleteClick = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await AxiosAdmin({
        url: `${SummaryApi.deleteMarket.url}?id=${targetDeleteId}`,
        method: SummaryApi.deleteMarket.method,
        data: { marketId: targetDeleteId, id: targetDeleteId }
      });
      toast.success('Market deleted from database! 🗑️');
      setMechanics(prev => prev.filter(m => m.id !== targetDeleteId));
    } catch (error) {
      console.error('Error deleting market:', error);
      toast.error('Failed to delete market.');
    } finally {
      setDeleteConfirmOpen(false);
      setTargetDeleteId(null);
    }
  };

  // HOLIDAY MANAGEMENT
  const openHolidayModal = (mechId) => {
    setTargetHolidayMechId(mechId);
    setHolidayDate('');
    setHolidayReason('');
    setHolidayModalOpen(true);
  };

  const saveHoliday = async (e) => {
    e.preventDefault();
    if (!holidayDate) {
      toast.error('Please select holiday date');
      return;
    }
    try {
      await AxiosAdmin({
        url: SummaryApi.updateGameStatus.url,
        method: SummaryApi.updateGameStatus.method,
        data: { gameId: targetHolidayMechId, is_closed: true }
      });
      toast.success('Holiday applied successfully!');
      setHolidayModalOpen(false);
      setTargetHolidayMechId(null);
      loadAllGames();
    } catch (error) {
      toast.error('Failed to apply holiday.');
    }
  };

  const toggleHolidayState = async (mechId, currentState) => {
    const targetState = !currentState;
    try {
      await AxiosAdmin({
        url: SummaryApi.updateGameStatus.url,
        method: SummaryApi.updateGameStatus.method,
        data: { gameId: mechId, is_closed: targetState }
      });
      toast.success(targetState ? 'Holiday Mode activated' : 'Holiday Mode deactivated');
      loadAllGames();
    } catch (error) {
      toast.error('Failed to toggle status.');
    }
  };

  // WEEKLY HOLIDAYS MANAGEMENT
  const openWeeklyModal = (mech) => {
    setTargetWeeklyMechId(mech.id);
    const initialDays = {
      Sunday: false,
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false
    };
    if (mech.weekly) {
      mech.weekly.split(', ').forEach(day => {
        const cleanDay = day.replace('Every ', '');
        if (initialDays.hasOwnProperty(cleanDay)) {
          initialDays[cleanDay] = true;
        }
      });
    }
    setSelectedDays(initialDays);
    setWeeklyModalOpen(true);
  };

  const handleWeeklyDayChange = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const saveWeeklySchedule = async (e) => {
    e.preventDefault();
    const chosen = Object.keys(selectedDays).filter(d => selectedDays[d]);

    try {
      await AxiosAdmin({
        url: SummaryApi.updateMarket?.url || '/api/market/update-market',
        method: SummaryApi.updateMarket?.method || 'post',
        data: {
          id: targetWeeklyMechId,
          marketId: targetWeeklyMechId,
          off_days: chosen
        }
      });
      toast.success('Weekly schedule saved to database!');
      setWeeklyModalOpen(false);
      setTargetWeeklyMechId(null);
      loadAllGames();
    } catch (error) {
      toast.error('Failed to save weekly schedule.');
    }
  };

  const daysEmojis = {
    Sunday: '🌅',
    Monday: '🌞',
    Tuesday: '☀️',
    Wednesday: '⭐️',
    Thursday: '🌙',
    Friday: '🎈',
    Saturday: '🍹'
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-5xl space-y-6">
        
        {/* 1. Header Banner & Add Card */}
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-3xs border border-blue-50">
                <Settings className="w-6 h-6 stroke-[2.2] animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Mechanic Working Hours & Holiday Manager</h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Manage mechanics working hours, weekly off-days, and holidays
                </p>
              </div>
            </div>

            <button
              onClick={loadAllGames}
              className="p-2.5 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Refresh List"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Add New Mechanic form */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Add New Mechanic
            </h2>

            <form onSubmit={handleAddMechanic} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Mechanic Name</label>
                <input
                  type="text"
                  placeholder="e.g. MILAN MORNING"
                  value={mechanicName}
                  onChange={(e) => setMechanicName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs uppercase"
                />
              </div>

              {/* Opening Time */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                <div className="flex border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 shadow-3xs overflow-hidden">
                  <input
                    type="text"
                    placeholder="10:25"
                    maxLength={5}
                    value={openingTime}
                    onChange={(e) => setOpeningTime(formatHHMMInput(e.target.value))}
                    onBlur={(e) => normalizeTimeOnBlur(e.target.value, setOpeningTime)}
                    className="w-full px-3 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    value={openingPeriod}
                    onChange={(e) => setOpeningPeriod(e.target.value)}
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
                <div className="flex border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 shadow-3xs overflow-hidden">
                  <input
                    type="text"
                    placeholder="11:25"
                    maxLength={5}
                    value={closingTime}
                    onChange={(e) => setClosingTime(formatHHMMInput(e.target.value))}
                    onBlur={(e) => normalizeTimeOnBlur(e.target.value, setClosingTime)}
                    className="w-full px-3 py-2.5 bg-transparent text-xs font-semibold outline-none"
                  />
                  <select
                    value={closingPeriod}
                    onChange={(e) => setClosingPeriod(e.target.value)}
                    className="bg-gray-100 border-l border-gray-300 px-3 py-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Add Market</span>
                  <Plus size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. Mechanics List Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            Active Mechanics ({mechanics.length})
          </h2>

          {loading ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center font-bold text-gray-400 text-xs">
              Loading market list from database...
            </div>
          ) : mechanics.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center font-bold text-gray-400 text-xs">
              No markets added yet. Add a market above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mechanics.map((mech) => (
                <div 
                  key={mech.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col space-y-4 transition-all relative ${
                    mech.isHoliday ? 'border-red-400 border-l-4' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                        {mech.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-gray-450 font-bold mt-1">
                        <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{mech.open} - {mech.close}</span>
                      </div>
                    </div>

                    {mech.isHoliday && (
                      <span className="bg-red-50 text-red-650 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5 shadow-3xs">
                        <span>⛱</span>
                        <span>Closed / Holiday</span>
                      </span>
                    )}
                  </div>

                  {mech.weekly && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Weekly Schedule:</span>
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-[9px] font-bold inline-flex items-center gap-1 shadow-3xs">
                        <Calendar size={10} />
                        <span>{mech.weekly}</span>
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditClick(mech)}
                        className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-gray-50 cursor-pointer shadow-3xs"
                      >
                        <Edit2 size={10} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => openWeeklyModal(mech)}
                        className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                      >
                        <span>Weekly</span>
                      </button>

                      <button
                        onClick={() => openHolidayModal(mech.id)}
                        className="px-3 py-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                      >
                        <span>Add Holiday</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mech.isHoliday ? (
                        <button
                          onClick={() => toggleHolidayState(mech.id, true)}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <Play size={10} className="fill-white" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleHolidayState(mech.id, false)}
                          className="px-3 py-1.5 bg-[#eab308] hover:bg-[#ca8a04] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                        >
                          <span>Holiday Mode</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteClick(mech.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-100 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-3xs"
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

      {/* EDIT MECHANIC MODAL */}
      {editModalOpen && targetEditMech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-3xs">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg space-y-4 text-left border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Edit Market Details</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Market Name</label>
                <input
                  type="text"
                  value={targetEditMech.name}
                  onChange={(e) => setTargetEditMech({ ...targetEditMech, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                  <input
                    type="text"
                    value={targetEditMech.open}
                    onChange={(e) => setTargetEditMech({ ...targetEditMech, open: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Closing Time</label>
                  <input
                    type="text"
                    value={targetEditMech.close}
                    onChange={(e) => setTargetEditMech({ ...targetEditMech, close: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Market Config?"
        message="Are you sure you want to delete this market configuration permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

      {/* ADD SPECIFIC HOLIDAY MODAL */}
      {holidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-3xs">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg space-y-4 text-left border border-gray-200">
            <div className="flex items-center gap-2 text-blue-900 border-b border-gray-100 pb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Add Specific Holiday</h2>
            </div>
            
            <form onSubmit={saveHoliday} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Holiday Date</label>
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                  required
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Festival, Maintenance"
                  value={holidayReason}
                  onChange={(e) => setHolidayReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHolidayModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEEKLY HOLIDAY SCHEDULE MODAL */}
      {weeklyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-3xs">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg space-y-4 text-left border border-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-blue-900 border-b border-gray-100 pb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Weekly Holiday Schedule</h2>
            </div>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Select which days of the week should be holidays:
            </p>

            <form onSubmit={saveWeeklySchedule} className="space-y-3">
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
                {Object.keys(selectedDays).map((day) => (
                  <label 
                    key={day} 
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{daysEmojis[day]}</span>
                      <span className="text-gray-800 font-bold">{day}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedDays[day]}
                      onChange={() => handleWeeklyDayChange(day)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWeeklyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  Save Weekly Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
