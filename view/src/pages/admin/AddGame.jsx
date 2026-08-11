import React, { useState, useEffect } from 'react';
import { IoAdd, IoSettingsOutline, IoListOutline } from "react-icons/io5";
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import { fetchGame } from '../../utils/api'
import toast from 'react-hot-toast';; 

export const AddGame = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: '',
    open_time: '', open_period: 'AM',         
    close_time: '', close_period: 'PM',       
    open_result_time: '', open_result_period: 'AM',   
    close_result_time: '', close_result_period: 'PM'          
  });
  
  const [gamesList, setGamesList] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // --- ADD GAME LOGIC ---
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
    // Sabhi fields check kar rahe hain
    if (!formData.name || !formData.open_time || !formData.close_time || !formData.open_result_time || !formData.close_result_time) {
      toast.error("Please fill all the timing fields!");
      return;
    }
    if (
      !isValidTwelveHourTime(formData.open_time) ||
      !isValidTwelveHourTime(formData.close_time) ||
      !isValidTwelveHourTime(formData.open_result_time) ||
      !isValidTwelveHourTime(formData.close_result_time)
    ) {
      toast.error("Please enter valid time in HH:MM format (e.g. 04:10).");
      return;
    }

    // Chaaron times ko AM/PM ke saath jod (combine) rahe hain
    const formattedOpenTime = `${formatTimeTo12Hour(formData.open_time)} ${formData.open_period}`;
    const formattedCloseTime = `${formatTimeTo12Hour(formData.close_time)} ${formData.close_period}`;
    const formattedOpenResultTime = `${formatTimeTo12Hour(formData.open_result_time)} ${formData.open_result_period}`;
    const formattedCloseResultTime = `${formatTimeTo12Hour(formData.close_result_time)} ${formData.close_result_period}`;

    try {
      const response = await AxiosAdmin({
        url: SummaryApi.addGame.url,
        method: SummaryApi.addGame.method,
        data: {
          name: formData.name, 
          open_time: formattedOpenTime, 
          close_time: formattedCloseTime,
          open_result_time: formattedOpenResultTime,
          close_result_time: formattedCloseResultTime
        }
      });

      toast.success(response.data.message || "Game added successfully!");
      
      // Form ko wapas reset kar diya
      setFormData({ 
        name: '', 
        open_time: '', open_period: 'AM', 
        close_time: '', close_period: 'PM',
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
  const handleToggleStatus = async (gameId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      await AxiosAdmin({
        url: SummaryApi.updateGameStatus.url, 
        method: SummaryApi.updateGameStatus.method,
        data: { gameId: gameId, status: newStatus }
      });
      setGamesList(prevGames => 
        prevGames.map(game => 
          game._id === gameId ? { ...game, status: newStatus } : game
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  // --- DELETE MARKET LOGIC ---
  const deleteMarketAction = async (gameId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this market?");
      if (!confirmDelete) return;

      const response = await AxiosAdmin({
        url: SummaryApi.deleteMarket.url,
        method: SummaryApi.deleteMarket.method,
        data: { marketId: gameId } 
      });

      toast.success(response.data.message || "Market deleted successfully!");
      setGamesList(prevGames => prevGames.filter(game => game._id !== gameId));
    } catch (error) {
      console.error("Error deleting market:", error);
      toast.error(error?.response?.data?.message || "Failed to delete market.");
    }
  };

  // --- UI RENDER ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 gap-6">
      
      {/* TOP SECTION: ADD NEW GAME */}
      <div className="w-full max-w-4xl shadow-xl rounded-2xl bg-white overflow-hidden">
        <div className="bg-blue-50 p-6 border-b border-blue-100">
          <div className="flex items-center gap-3 mb-1">
            <span className='bg-blue-100 p-2 rounded-full'>
              <IoSettingsOutline className="text-blue-600 text-3xl" />
            </span> 
            <h2 className="text-blue-600 font-bold text-2xl">Admin Panel</h2>
          </div>
          <p className="text-gray-600 ml-12">Manage your Games/Markets and their timings</p>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-xl mb-6 text-gray-800 border-b pb-2">Add New Game</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
            
            {/* Name Input (Full Width via col-span-2) */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label htmlFor="name" className="text-sm font-bold text-gray-700">Game Name</label>
              <input 
                id="name" value={formData.name} onChange={handleChange}
                className="border border-gray-300 px-4 py-3 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all w-full text-lg uppercase" 
                type="text" placeholder="e.g. SITA MORNING" 
              />
            </div>

            {/* --- BID TIMINGS --- */}
            {/* Open Bid Last Time */}
            <div className="flex flex-col gap-1">
              <label htmlFor="open_time" className="text-sm font-semibold text-gray-700">Open Bid Time</label>
              <div className="flex shadow-sm">
                <input 
                  id="open_time" value={formData.open_time} onChange={handleTimeInputChange}
                  onBlur={(e) => normalizeTimeOnBlur('open_time', e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-l-md outline-none focus:border-blue-500 transition-all w-full" 
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="HH:MM"
                />
                <select 
                  id="open_period" value={formData.open_period} onChange={handleChange}
                  className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Close Bid Last Time */}
            <div className="flex flex-col gap-1">
              <label htmlFor="close_time" className="text-sm font-semibold text-gray-700">Close Bid Last Time</label>
              <div className="flex shadow-sm">
                <input 
                  id="close_time" value={formData.close_time} onChange={handleTimeInputChange}
                  onBlur={(e) => normalizeTimeOnBlur('close_time', e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-l-md outline-none focus:border-blue-500 transition-all w-full" 
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="HH:MM"
                />
                <select 
                  id="close_period" value={formData.close_period} onChange={handleChange}
                  className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* --- RESULT TIMINGS --- */}
            {/* Open Result Time */}
            <div className="flex flex-col gap-1">
              <label htmlFor="open_result_time" className="text-sm font-semibold text-blue-700">Open Result Time</label>
              <div className="flex shadow-sm">
                <input 
                  id="open_result_time" value={formData.open_result_time} onChange={handleTimeInputChange}
                  onBlur={(e) => normalizeTimeOnBlur('open_result_time', e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-l-md outline-none focus:border-blue-500 transition-all w-full" 
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="HH:MM"
                />
                <select 
                  id="open_result_period" value={formData.open_result_period} onChange={handleChange}
                  className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Close Result Time */}
            <div className="flex flex-col gap-1">
              <label htmlFor="close_result_time" className="text-sm font-semibold text-blue-700">Close Result Time</label>
              <div className="flex shadow-sm">
                <input 
                  id="close_result_time" value={formData.close_result_time} onChange={handleTimeInputChange}
                  onBlur={(e) => normalizeTimeOnBlur('close_result_time', e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-l-md outline-none focus:border-blue-500 transition-all w-full" 
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="HH:MM"
                />
                <select 
                  id="close_result_period" value={formData.close_result_period} onChange={handleChange}
                  className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
          <button 
            onClick={handleSubmit} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg transition-colors font-bold shadow-md active:scale-95"
          >
            Add Market <IoAdd className="text-xl" />
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: GAMES LIST TABLE */}
      <div className="w-full max-w-4xl shadow-xl rounded-2xl bg-white overflow-hidden mb-10">
        <div className="bg-gray-800 p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <IoListOutline className="text-white text-2xl" />
            <h3 className="font-bold text-lg text-white">All Active & Closed Games</h3>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b border-gray-200 text-sm">
                <th className="p-4 font-bold">Game Name</th>
                <th className="p-4 font-bold">Bid Times (Open - Close)</th>
                <th className="p-4 font-bold">Result Times (Open - Close)</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500 font-medium">Loading markets...</td>
                </tr>
              ) : gamesList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500 font-medium">No markets added yet.</td>
                </tr>
              ) : (
                gamesList.map((game) => (
                  <tr key={game._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800 uppercase">{game.name}</td>
                    
                    {/* Bid Times Col */}
                    <td className="p-4 text-gray-600 font-medium">
                      <div className="text-green-600 text-xs">O: {game.open_time}</div>
                      <div className="text-red-500 text-xs">C: {game.close_time}</div>
                    </td>

                    {/* Result Times Col */}
                    <td className="p-4 text-gray-600 font-medium">
                      <div className="text-blue-600 text-xs">O: {game.open_result_time || 'N/A'}</div>
                      <div className="text-purple-600 text-xs">C: {game.close_result_time || 'N/A'}</div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide ${
                        game.status === 'Active' 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(game._id, game.status)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold text-white transition-all shadow-sm active:scale-95 ${
                          game.status === 'Active' 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {game.status === 'Active' ? 'Stop Betting' : 'Start Betting'}
                      </button>
                      <button onClick={() => deleteMarketAction(game._id)} className='ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm active:scale-95'>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
  
    </div>
  );
};