import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { FaSearch, FaPlay, FaTimes, FaGamepad, FaSync, FaExternalLinkAlt, FaFire } from "react-icons/fa";
import aviatorImg from "../../assets/aviator.jpg";
import SummaryApi from "../../common/SummerAPI";

export const UserCasino = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All Games");
  const [searchQuery, setSearchQuery] = useState("");
  const [providers, setProviders] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launchingGame, setLaunchingGame] = useState(null); // game_uid being launched
  const [gameUrl, setGameUrl] = useState(null); // Active iframe URL
  const [failedImages, setFailedImages] = useState({});

  const getUserToken = () => {
    return (
      localStorage.getItem("user_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("userToken") ||
      ""
    );
  };

  const getImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    if (originalUrl.startsWith("data:") || originalUrl.startsWith("blob:") || originalUrl.startsWith("/")) {
      return originalUrl;
    }
    if (originalUrl.startsWith("http")) {
      return `${SummaryApi.proxyCasinoImage.url}?url=${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  };

  // Fallback games list if API returns empty or offline
  const fallbackGames = [
    {
      game_id: "aviator_local",
      game_uid: "aviator_local",
      name: "Aviator",
      provider: "Spribe",
      category: "Crash",
      logo: aviatorImg
    },
    {
      game_id: "10071",
      game_uid: "10071",
      name: "Avia Fly 2",
      provider: "InOut",
      category: "Instant",
      logo: "https://api.nexxapi.tech/media/games/10071.png"
    },
    {
      game_id: "1373",
      game_uid: "1373",
      name: "AviaFly",
      provider: "InOut",
      category: "Flash",
      logo: "https://api.nexxapi.tech/media/games/1373.jpg"
    },
    {
      game_id: "1407",
      game_uid: "1407",
      name: "BalloniX",
      provider: "InOut",
      category: "Flash",
      logo: "https://api.nexxapi.tech/media/games/1407.png"
    },
    {
      game_id: "10050",
      game_uid: "10050",
      name: "Bubbles",
      provider: "InOut",
      category: "Instant",
      logo: "https://api.nexxapi.tech/media/games/10050.png"
    },
    {
      game_id: "139",
      game_uid: "139",
      name: "Chicken Road",
      provider: "InOut",
      category: "Flash",
      logo: "https://api.nexxapi.tech/media/games/139.png"
    }
  ];

  // Fetch Providers & Games
  const fetchCasinoCatalog = async () => {
    setLoading(true);
    try {
      // 1. Fetch Providers
      try {
        const provRes = await fetch(SummaryApi.getCasinoProviders.url);
        const provData = await provRes.json();
        const provList = provData.data?.providers || provData.providers || [];
        if (Array.isArray(provList) && provList.length > 0) {
          setProviders(provList);
        }
      } catch (err) {
        console.error("Error fetching providers:", err);
      }

      // 2. Fetch Games
      try {
        const gameRes = await fetch(`${SummaryApi.getCasinoGames.url}?user_side=true&limit=500`);
        const gameData = await gameRes.json();
        const rawGames = gameData.data?.games || gameData.games || (Array.isArray(gameData.data) ? gameData.data : []);
        if (Array.isArray(rawGames) && rawGames.length > 0) {
          setGames(rawGames);
        } else {
          setGames(fallbackGames);
        }
      } catch (err) {
        console.error("Error fetching games:", err);
        setGames(fallbackGames);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasinoCatalog();
  }, []);

  // Launch Game Handler
  const handleLaunchGame = async (gameUid, gameName) => {
    if (gameUid === "aviator_local") {
      navigate("/aviator");
      return;
    }

    const userToken = getUserToken();
    if (!userToken) {
      alert("Please login to play casino games.");
      navigate("/login");
      return;
    }

    setLaunchingGame(gameUid);

    try {
      const response = await fetch(SummaryApi.launchCasinoGame.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          game_uid: String(gameUid),
          return_url: window.location.href
        })
      });

      const data = await response.json();

      if (data.success && data.url) {
        setGameUrl(data.url);
      } else {
        alert(data.message || "Unable to launch game. Please check your balance or try again.");
      }
    } catch (err) {
      console.error("Game launch error:", err);
      alert("Network error launching game. Please ensure backend server is running.");
    } finally {
      setLaunchingGame(null);
    }
  };

  const displayGames = games.length > 0 ? games : fallbackGames;
  const categoriesList = ["All Games", "Popular", ...providers.map((p) => p.name)];

  const filteredGames = displayGames.filter((g) => {
    const matchesCategory =
      activeCategory === "All Games" ||
      (activeCategory === "Popular" && (g.category === "Instant" || g.category === "Crash" || g.provider === "InOut")) ||
      g.provider?.toLowerCase() === activeCategory.toLowerCase() ||
      g.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.game_uid?.toString().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full select-none pb-12 font-sans bg-[#0d131d] min-h-screen text-white">
      {/* 1. TOP HEADER & SEARCH BAR */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-xl transition-colors duration-300 mb-4 space-y-3.5 sticky top-0 z-30 border-b border-white/10"
        style={{ backgroundColor: currentTheme?.headerBgColor || "#16202c" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white leading-tight flex items-center gap-2">
              <span className="text-amber-400">🎰</span> Live Casino
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">
              Instant win games & live tables
            </p>
          </div>

          <button
            onClick={fetchCasinoCatalog}
            className="bg-white/15 hover:bg-white/25 active:scale-95 px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FaSync className={loading ? "animate-spin" : ""} size={11} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games by name or provider..."
            className="w-full bg-slate-900/90 border border-white/10 rounded-2xl py-2.5 pl-9 pr-3.5 text-xs font-semibold text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 shadow-inner"
          />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. FILTER PILLS ROW */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-800/80 text-gray-300 hover:text-white border border-white/10"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. FEATURED AVIATOR BANNER */}
        <div
          onClick={() => handleLaunchGame("aviator_local", "Aviator")}
          className="relative h-44 rounded-3xl overflow-hidden shadow-2xl bg-black border border-amber-500/30 flex items-center justify-center cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all group"
        >
          <img
            src={aviatorImg}
            alt="Aviator Trending"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          <div className="absolute top-3.5 left-3.5 bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-amber-300">
            <FaFire className="text-red-600" />
            <span>TRENDING CRASH GAME</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLaunchGame("aviator_local", "Aviator");
            }}
            className="absolute bottom-3.5 right-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-full shadow-xl flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
          >
            <span>PLAY NOW</span>
            <FaPlay size={9} />
          </button>
        </div>

        {/* 4. GAMES GRID SECTION */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Casino Games Catalog ({filteredGames.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 font-semibold text-sm">
            Loading Casino Games...
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-medium text-xs bg-slate-900/60 rounded-3xl border border-white/5 p-6">
            <FaGamepad size={32} className="mx-auto text-amber-400/50 mb-2" />
            No games found matching "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredGames.map((game) => {
              const isLaunching = launchingGame === game.game_uid;
              const hasImgFailed = failedImages[game.game_id || game.game_uid];
              const proxiedImg = getImageUrl(game.logo);

              return (
                <div
                  key={game.game_id || game.game_uid}
                  onClick={() => handleLaunchGame(game.game_uid, game.name)}
                  className="bg-slate-900/90 rounded-2xl p-2.5 border border-white/10 hover:border-amber-400/60 transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.02] active:scale-95 shadow-lg relative overflow-hidden"
                >
                  {/* Game Poster / Logo Container */}
                  <div className="relative aspect-square w-full rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 overflow-hidden mb-2 border border-white/5 flex flex-col items-center justify-center text-center p-2">
                    {proxiedImg && !hasImgFailed ? (
                      <img
                        src={proxiedImg}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [game.game_id || game.game_uid]: true }));
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full p-2">
                        <FaGamepad size={32} className="text-amber-400/70 mb-1" />
                        <span className="text-[10px] font-black text-amber-300 leading-tight line-clamp-2 uppercase tracking-wide">
                          {game.name}
                        </span>
                      </div>
                    )}

                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-bold">
                        <FaPlay size={12} className="ml-0.5" />
                      </div>
                    </div>

                    {/* Provider Tag */}
                    <div className="absolute top-1.5 left-1.5 bg-slate-950/85 backdrop-blur-xs px-2 py-0.5 rounded-md text-[8px] font-bold text-amber-300 border border-amber-400/20 shadow-sm">
                      {game.provider || "Casino"}
                    </div>
                  </div>

                  {/* Title & Button */}
                  <div>
                    <h4 className="text-xs font-bold text-white truncate px-0.5 tracking-tight" title={game.name}>
                      {game.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {game.category || "Slot"}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                        {isLaunching ? "Launching..." : "Play"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. FULLSCREEN GAME IFRAME MODAL */}
      {gameUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Modal Header Controls */}
          <div className="bg-slate-950 text-white px-4 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                Nexx Live Casino
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={gameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors"
              >
                <span>External</span>
                <FaExternalLinkAlt size={10} />
              </a>
              <button
                onClick={() => setGameUrl(null)}
                className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 px-2.5"
              >
                <FaTimes size={14} />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Game Iframe Viewport */}
          <div className="flex-1 w-full h-full bg-black relative">
            <iframe
              src={gameUrl}
              title="Casino Game"
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; payment"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCasino;
