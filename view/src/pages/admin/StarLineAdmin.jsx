import React, { useState } from 'react';
import { 
  Settings, Clock, Plus, Edit2, Calendar, ShieldAlert, Trash2, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

export const StarLineAdmin = () => {
  // Add new StarLine states
  const [starLineName, setStarLineName] = useState('');
  const [openingTime, setOpeningTime] = useState('');

  // Default mock list of StarLine games matching screenshots
  const [games, setGames] = useState([
    { id: 1, name: 'FARIDABAD', time: '17:50' },
    { id: 2, name: 'GALI', time: '23:25' }
  ]);

  // Modals / edit states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [targetEditGame, setTargetEditGame] = useState(null); // { id: number, name: string, time: string }

  const handleAddStarLine = (e) => {
    e.preventDefault();
    if (!starLineName.trim() || !openingTime) {
      toast.error('Please enter name and opening time');
      return;
    }

    const newGame = {
      id: Date.now(),
      name: starLineName.trim().toUpperCase(),
      time: openingTime
    };

    setGames(prev => [...prev, newGame]);
    toast.success('StarLine game added successfully!');
    setStarLineName('');
    setOpeningTime('');
  };

  const handleEditClick = (game) => {
    setTargetEditGame({ ...game });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!targetEditGame.name.trim() || !targetEditGame.time) {
      toast.error('Please fill in both fields');
      return;
    }

    setGames(prev => 
      prev.map(g => g.id === targetEditGame.id ? { ...g, name: targetEditGame.name.toUpperCase(), time: targetEditGame.time } : g)
    );
    toast.success('StarLine updated!');
    setEditModalOpen(false);
    setTargetEditGame(null);
  };

  const handleDeleteClick = (id) => {
    setTargetDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setGames(prev => prev.filter(g => g.id !== targetDeleteId));
    setDeleteConfirmOpen(false);
    setTargetDeleteId(null);
    toast.success('StarLine game deleted');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      
      <div className="w-full max-w-4xl space-y-6">
        
        {/* 1. Header Banner & Add Card (Combined) */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* Header Banner */}
          <div className="bg-[#eff6ff] text-blue-900 border-b border-blue-100 p-6 flex items-start gap-4">
            <div className="bg-white p-2.5 rounded-2xl text-blue-600 shadow-3xs border border-blue-50">
              <Settings className="w-6 h-6 stroke-[2.2] animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">StarLine Admin Panel</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Manage StarLine games, timing, specific holidays & weekly schedules
              </p>
            </div>
          </div>

          {/* Add New StarLine Form block */}
          <div className="p-6 space-y-4">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Add New StarLine
            </h2>

            <form onSubmit={handleAddStarLine} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* StarLine Name */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">StarLine Name</label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={starLineName}
                  onChange={(e) => setStarLineName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 shadow-3xs"
                />
              </div>

              {/* Opening Time */}
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                <div className="relative flex items-center border border-gray-300 rounded-xl bg-white focus-within:border-blue-500 shadow-3xs">
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent text-xs font-semibold outline-none cursor-pointer"
                  />
                  <Clock className="absolute right-3.5 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Submit button */}
              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <span>Add StarLine</span>
                  <Plus size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. StarLine Games List Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest">
            StarLine Games List
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game) => (
              <div 
                key={game.id}
                className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs flex flex-col space-y-4"
              >
                {/* Game Title */}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                    {game.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold mt-1">
                    <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Opens at: {game.time}</span>
                  </div>
                </div>

                {/* Buttons controls grid */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {/* Row 1 */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEditClick(game)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-650 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-gray-50 cursor-pointer shadow-3xs"
                    >
                      <Edit2 size={10} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => toast.success(`${game.name} Weekly schedule configured`)}
                      className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <span>Weekly</span>
                    </button>

                    <button
                      onClick={() => toast.success(`Holiday added for ${game.name}`)}
                      className="px-3 py-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <span>Add Holiday</span>
                    </button>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toast.success(`${game.name} toggled Holiday Mode`)}
                      className="px-3 py-1.5 bg-[#eab308] hover:bg-[#ca8a04] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-3xs"
                    >
                      <span>Holiday Mode</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClick(game.id)}
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
        title="Delete StarLine Game?"
        message="Are you sure you want to delete this StarLine game config permanently?"
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
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Edit StarLine Game</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">StarLine Name</label>
                <input
                  type="text"
                  value={targetEditGame.name}
                  onChange={(e) => setTargetEditGame({ ...targetEditGame, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Opening Time</label>
                <input
                  type="time"
                  value={targetEditGame.time}
                  onChange={(e) => setTargetEditGame({ ...targetEditGame, time: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                />
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
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all cursor-pointer shadow-sm"
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
