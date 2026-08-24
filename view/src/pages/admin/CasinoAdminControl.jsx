import React, { useState, useEffect } from "react";
import {
  FaWallet,
  FaServer,
  FaGamepad,
  FaSync,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaToggleOn,
  FaToggleOff,
  FaThLarge,
  FaList
} from "react-icons/fa";
import SummaryApi from "../../common/SummerAPI";

export const CasinoAdminControl = () => {
  const [ggrBalance, setGgrBalance] = useState(null);
  const [whoAmI, setWhoAmI] = useState(null);
  const [providers, setProviders] = useState([]);
  const [games, setGames] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [activeTab, setActiveTab] = useState("games"); // 'games' | 'providers' | 'transactions'
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
  const [togglingGame, setTogglingGame] = useState(null);

  const getAdminToken = () => {
    return (
      localStorage.getItem("royal_user_admin") ||
      localStorage.getItem("admin_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "jwt_admin_token_master"
    );
  };

  const fetchData = async () => {
    setRefreshing(true);
    const adminToken = getAdminToken();
    try {
      // 1. Fetch GGR Balance
      try {
        const ggrRes = await fetch(SummaryApi.getCasinoGgrBalance.url, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const ggrData = await ggrRes.json();
        if (ggrData.code === 0) {
          setGgrBalance(ggrData.data?.wallet);
        }
      } catch (err) {
        console.error("Failed to fetch GGR balance", err);
      }

      // 2. Fetch WhoAmI
      try {
        const whoRes = await fetch(SummaryApi.getCasinoWhoAmI.url);
        const whoData = await whoRes.json();
        if (whoData.code === 0) {
          setWhoAmI(whoData.data);
        }
      } catch (err) {
        console.error("Failed to fetch whoami", err);
      }

      // 3. Fetch Providers
      try {
        const provRes = await fetch(SummaryApi.getCasinoProviders.url);
        const provData = await provRes.json();
        if (provData.code === 0) {
          setProviders(provData.data?.providers || []);
        }
      } catch (err) {
        console.error("Failed to fetch providers", err);
      }

      // 4. Fetch Games
      try {
        let url = SummaryApi.getCasinoGames.url + "?limit=500";
        if (selectedBrand) url += `&brand_id=${selectedBrand}`;
        const gameRes = await fetch(url);
        const gameData = await gameRes.json();
        const gamesList = gameData.data?.games || gameData.games || (Array.isArray(gameData.data) ? gameData.data : []);
        setGames(gamesList);
      } catch (err) {
        console.error("Failed to fetch games", err);
      }

      // 5. Fetch Recent Transactions
      try {
        const txRes = await fetch(SummaryApi.getCasinoTransactions.url, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBrand]);

  // Handle ON / OFF Toggle for User Side Visibility
  const handleToggleGameStatus = async (game) => {
    const currentStatus = game.status || "Active";
    const targetStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const gameUid = String(game.game_uid);
    const adminToken = getAdminToken();

    setTogglingGame(gameUid);

    // Optimistic UI Update
    setGames((prevGames) =>
      prevGames.map((g) =>
        String(g.game_uid) === gameUid ? { ...g, status: targetStatus } : g
      )
    );

    try {
      const response = await fetch(SummaryApi.toggleCasinoGameStatus.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          game_uid: gameUid,
          game_id: String(game.game_id || ""),
          name: game.name,
          provider: game.provider,
          category: game.category,
          status: targetStatus
        })
      });

      const data = await response.json();
      if (!data.success) {
        // Revert on failure
        setGames((prevGames) =>
          prevGames.map((g) =>
            String(g.game_uid) === gameUid ? { ...g, status: currentStatus } : g
          )
        );
        alert(data.message || "Failed to update game status.");
      }
    } catch (err) {
      console.error("Error toggling game status:", err);
      // Revert on error
      setGames((prevGames) =>
        prevGames.map((g) =>
          String(g.game_uid) === gameUid ? { ...g, status: currentStatus } : g
        )
      );
      alert("Network error updating game status.");
    } finally {
      setTogglingGame(null);
    }
  };

  const filteredGames = games.filter(
    (g) =>
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.game_uid?.toString().includes(searchQuery)
  );

  return (
    <div className="-m-4 md:-m-6 p-4 md:p-6 space-y-6 text-white min-h-screen bg-[#0f172a]">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <span className="text-amber-400">🎰</span> NexxAPI Casino Control
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage NexxAPI providers, games visibility (ON / OFF), GGR balance & settlement logs
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs md:text-sm cursor-pointer disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: GGR Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-amber-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                GGR Credit Balance
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                {ggrBalance !== null
                  ? `₹${Number(ggrBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "Loading..."}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shadow-inner">
              <FaWallet />
            </div>
          </div>
          {ggrBalance !== null && Number(ggrBalance) <= 100 && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-red-400 font-bold bg-red-950/40 p-2 rounded-lg border border-red-800/40">
              <FaExclamationTriangle className="shrink-0" />
              <span>Low Balance Alert: Please top up account with provider!</span>
            </div>
          )}
        </div>

        {/* Card 2: Server IP Whitelist */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Server IP Status
              </span>
              <h3 className="text-lg font-bold text-white mt-1 font-mono">
                {whoAmI?.your_ip || "Checking..."}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shadow-inner">
              <FaServer />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <FaCheckCircle />
            <span>{whoAmI?.note || (whoAmI?.whitelisted ? "IP Whitelisted & Active" : "No whitelist lock active")}</span>
          </div>
        </div>

        {/* Card 3: Providers Count */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-cyan-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Providers
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                {providers.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl shadow-inner">
              <FaGamepad />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 font-medium">
            Active casino brand integrations
          </p>
        </div>

        {/* Card 4: Total Games & Status */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-purple-500/20 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Games Active (ON)
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                {games.filter((g) => (g.status || "Active") === "Active").length} / {games.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl shadow-inner">
              <FaHistory />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 font-medium">
            Visible to player on /casino page
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("games")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
            activeTab === "games"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          Game Control & Status ({games.length})
        </button>
        <button
          onClick={() => setActiveTab("providers")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
            activeTab === "providers"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          Providers ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
            activeTab === "transactions"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          Recent Settlements ({transactions.length})
        </button>
      </div>

      {/* TAB 1: GAMES CATALOG & ON / OFF STATUS CONTROL */}
      {activeTab === "games" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Search games or UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Right Controls: Provider Filter & View Mode Switch */}
            <div className="w-full sm:w-auto flex items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 shrink-0">Provider:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">All Providers</option>
                  {providers.map((p) => (
                    <option key={p.brand_id} value={p.brand_id}>
                      {p.name} ({p.game_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Switch (Table vs Grid) */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === "table" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                  title="Table View (Recommended)"
                >
                  <FaList size={13} />
                  <span className="hidden md:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    viewMode === "grid" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                  }`}
                  title="Grid Cards View"
                >
                  <FaThLarge size={13} />
                  <span className="hidden md:inline">Grid</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 font-semibold text-sm">
              Loading NexxAPI Casino Catalog & Game Status...
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-medium text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
              No games found matching your search.
            </div>
          ) : viewMode === "table" ? (
            /* TABLE VIEW WITH ON / OFF TOGGLE SWITCHES */
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">
                  Showing {filteredGames.length} games. Click switch to Enable (ON) or Disable (OFF) games for users.
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Game</th>
                      <th className="p-3.5">Game UID</th>
                      <th className="p-3.5">Provider</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">User Status</th>
                      <th className="p-3.5 text-center">ON / OFF Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredGames.map((game, idx) => {
                      const isActive = (game.status || "Active") === "Active";
                      const isToggling = togglingGame === String(game.game_uid);
                      const proxiedImg = game.logo
                        ? game.logo.startsWith("http")
                          ? `${SummaryApi.proxyCasinoImage.url}?url=${encodeURIComponent(game.logo)}`
                          : game.logo
                        : null;

                      return (
                        <tr key={game.game_id || idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                {proxiedImg ? (
                                  <img
                                    src={proxiedImg}
                                    alt={game.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <FaGamepad className="text-amber-400 text-lg" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-white tracking-tight">{game.name}</h4>
                                <span className="text-[10px] text-slate-400">ID: {game.game_id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-amber-400 font-bold">{game.game_uid}</td>

                          <td className="p-3.5 font-semibold text-slate-300">{game.provider || "Casino"}</td>

                          <td className="p-3.5">
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              {game.category || "Slot"}
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            {isActive ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active (ON)
                              </span>
                            ) : (
                              <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Hidden (OFF)
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleGameStatus(game)}
                              disabled={isToggling}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer active:scale-95 ${
                                isActive
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <FaToggleOn size={18} />
                                  <span>ON</span>
                                </>
                              ) : (
                                <>
                                  <FaToggleOff size={18} className="text-red-400" />
                                  <span className="text-red-400">OFF</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GRID VIEW CARDS */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredGames.map((game, idx) => {
                const isActive = (game.status || "Active") === "Active";
                const proxiedImg = game.logo
                  ? game.logo.startsWith("http")
                    ? `${SummaryApi.proxyCasinoImage.url}?url=${encodeURIComponent(game.logo)}`
                    : game.logo
                  : null;

                return (
                  <div
                    key={game.game_id || idx}
                    className={`bg-slate-900/80 border rounded-2xl p-3 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group relative ${
                      isActive ? "border-slate-800 hover:border-amber-500/50" : "border-red-900/40 opacity-75 bg-slate-950/90"
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800 mb-2.5 flex items-center justify-center">
                      {proxiedImg ? (
                        <img
                          src={proxiedImg}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : null}
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] font-bold text-amber-400 border border-amber-500/30">
                        {game.provider || "Casino"}
                      </div>

                      {/* Status Tag on Card */}
                      <div className="absolute bottom-2 right-2">
                        {isActive ? (
                          <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                            ON
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                            OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white truncate tracking-tight" title={game.name}>
                        {game.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                        <span>UID: {game.game_uid}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleGameStatus(game)}
                          className="text-amber-400 hover:underline font-bold"
                        >
                          {isActive ? "Turn OFF" : "Turn ON"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROVIDERS LIST */}
      {activeTab === "providers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {providers.map((p) => (
            <div
              key={p.brand_id}
              onClick={() => {
                setSelectedBrand(p.brand_id);
                setActiveTab("games");
              }}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500 p-4 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <FaGamepad className="text-amber-400 text-xl" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{p.name}</h4>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  {p.game_count || 0} Games
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Brand ID: {p.brand_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RECENT SETTLEMENT TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Serial No</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Game</th>
                  <th className="p-3.5">Bet Amount</th>
                  <th className="p-3.5">Win Amount</th>
                  <th className="p-3.5">Authoritative Balance</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No settlement callbacks recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id || tx.serial_number} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-300">{tx.serial_number}</td>
                      <td className="p-3.5 font-semibold text-white">
                        {tx.userId?.name || tx.member_account}
                        <div className="text-[10px] text-slate-500 font-mono">{tx.userId?.mobile || ""}</div>
                      </td>
                      <td className="p-3.5 text-amber-400 font-bold">{tx.game_name || tx.game_uid}</td>
                      <td className="p-3.5 text-red-400 font-mono font-bold">₹{tx.bet_amount}</td>
                      <td className="p-3.5 text-emerald-400 font-mono font-bold">₹{tx.win_amount}</td>
                      <td className="p-3.5 text-white font-mono font-bold">₹{tx.credit_amount}</td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp || tx.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {tx.status || "PROCESSED"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoAdminControl;
