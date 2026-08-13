import React, { useState } from 'react';
import { 
  Settings, Clock, Plus, Edit2, Calendar, ShieldAlert, Trash2, CheckCircle2, Play 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const AdminPanel = () => {
  // Add new mechanic form states
  const [mechanicName, setMechanicName] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  // Mechanics data state
  const [mechanics, setMechanics] = useState([
    { id: 1, name: 'MILAN MORNING', open: '10:25', close: '11:25', weekly: '', isHoliday: true, holidayDetails: { date: '2026-08-13', reason: 'Festival' } },
    { id: 2, name: 'MILAN NIGHT', open: '21:05', close: '23:05', weekly: 'Every Sunday', isHoliday: false, holidayDetails: null }
  ]);

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

  const handleAddMechanic = (e) => {
    e.preventDefault();
    if (!mechanicName.trim() || !openingTime || !closingTime) {
      toast.error('Please fill name, opening time, and closing time');
      return;
    }

    const newMech = {
      id: Date.now(),
      name: mechanicName.trim().toUpperCase(),
      open: openingTime,
      close: closingTime,
      weekly: '',
      isHoliday: false,
      holidayDetails: null
    };

    setMechanics(prev => [...prev, newMech]);
    toast.success('Mechanic added successfully!');
    setMechanicName('');
    setOpeningTime('');
    setClosingTime('');
  };

  const handleEditClick = (mech) => {
    setTargetEditMech({ ...mech });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!targetEditMech.name.trim() || !targetEditMech.open || !targetEditMech.close) {
      toast.error('Please fill in all fields');
      return;
    }

    setMechanics(prev => 
      prev.map(m => m.id === targetEditMech.id ? { ...targetEditMech, name: targetEditMech.name.toUpperCase() } : m)
    );
    toast.success('Mechanic updated!');
    setEditModalOpen(false);
    setTargetEditMech(null);
  };

  const handleDeleteClick = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setMechanics(prev => prev.filter(m => m.id !== targetDeleteId));
    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
    toast.success('Mechanic deleted successfully');
  };

  // HOLIDAY MANAGEMENT
  const openHolidayModal = (mechId) => {
    setTargetHolidayMechId(mechId);
    setHolidayDate('');
    setHolidayReason('');
    setHolidayModalOpen(true);
  };

  const saveHoliday = (e) => {
    e.preventDefault();
    if (!holidayDate) {
      toast.error('Please select holiday date');
      return;
    }
    setMechanics(prev => prev.map(m => {
      if (m.id === targetHolidayMechId) {
        return {
          ...m,
          isHoliday: true,
          holidayDetails: { date: holidayDate, reason: holidayReason }
        };
      }
      return m;
    }));
    toast.success('Holiday applied successfully!');
    setHolidayModalOpen(false);
    setTargetHolidayMechId(null);
  };

  const toggleHolidayState = (mechId, currentState) => {
    setMechanics(prev => prev.map(m => {
      if (m.id === mechId) {
        return {
          ...m,
          isHoliday: !currentState,
          holidayDetails: !currentState ? { date: 'Quick Toggle', reason: 'Maintenance' } : null
        };
      }
      return m;
    }));
    toast.success(currentState ? 'Holiday Mode deactivated' : 'Holiday Mode activated');
  };

  // WEEKLY HOLIDAYS MANAGEMENT
  const openWeeklyModal = (mech) => {
    setTargetWeeklyMechId(mech.id);
    // Initialize day check states
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

  const saveWeeklySchedule = (e) => {
    e.preventDefault();
    const chosen = Object.keys(selectedDays).filter(d => selectedDays[d]);
    const weeklyString = chosen.map(d => `Every ${d}`).join(', ');

    setMechanics(prev => prev.map(m => {
      if (m.id === targetWeeklyMechId) {
        return { ...m, weekly: weeklyString };
      }
      return m;
    }));

    toast.success('Weekly schedule updated!');
    setWeeklyModalOpen(false);
    setTargetWeeklyMechId(null);
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
      
      <div className="w-full max-w-4xl space-y-6">
        
        {/* 1. Header Banner & Add Card */}
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-start gap-4">
            <div className="bg-white p-2.5 rounded-xl text-blue-600 shadow-3xs border border-blue-50">
              <Settings className="w-6 h-6 stroke-[2.2] animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Manage mechanics, working hours, specific holidays & weekly schedules
              </p>
            </div>
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
                  placeholder="Enter name"
                  value={mechanicName}
                  onChange={(e) => setMechanicName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                <div className="relative flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 shadow-3xs">
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent text-xs font-semibold outline-none cursor-pointer"
                  />
                  <Clock className="absolute right-3.5 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Closing Time</label>
                <div className="relative flex items-center border border-gray-300 rounded-lg bg-white focus-within:border-blue-500 shadow-3xs">
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent text-xs font-semibold outline-none cursor-pointer"
                  />
                  <Clock className="absolute right-3.5 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Add Mechanic</span>
                  <Plus size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. Mechanics List Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
            Mechanics List
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mechanics.map((mech) => (
              <div 
                key={mech.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col space-y-4 transition-all relative ${
                  mech.isHoliday ? 'border-red-400 border-l-4' : 'border-gray-200'
                }`}
              >
                {/* Mechanic Title & Holiday Badge */}
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
                      <span>Holiday</span>
                    </span>
                  )}
                </div>

                {/* Weekly schedule */}
                {mech.weekly && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Weekly Schedule:</span>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-[9px] font-bold inline-flex items-center gap-1 shadow-3xs">
                      <Calendar size={10} />
                      <span>{mech.weekly}</span>
                    </span>
                  </div>
                )}

                {/* Buttons controls */}
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
                      className="px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation delete modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Mechanic?"
        message="Are you sure you want to delete this mechanic working hours config permanently?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTargetDeleteId(null);
        }}
      />

      {/* Edit modal */}
      {editModalOpen && targetEditMech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-3xs">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg space-y-4 text-left border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Edit Mechanic Working Hours</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Mechanic Name</label>
                <input
                  type="text"
                  value={targetEditMech.name}
                  onChange={(e) => setTargetEditMech({ ...targetEditMech, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                  <input
                    type="time"
                    value={targetEditMech.open}
                    onChange={(e) => setTargetEditMech({ ...targetEditMech, open: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Closing Time</label>
                  <input
                    type="time"
                    value={targetEditMech.close}
                    onChange={(e) => setTargetEditMech({ ...targetEditMech, close: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setTargetEditMech(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⛱ ADD SPECIFIC HOLIDAY MODAL (Screenshot 1) */}
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

      {/* 🗓 WEEKLY HOLIDAY SCHEDULE MODAL (Screenshot 2) */}
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
