import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaSearch, FaPlay } from 'react-icons/fa';
import aviatorImg from '../../assets/aviator.jpg';

export const UserCasino = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All Games');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All Games', 'Popular', 'New'];

  const games = [
    {
      id: 'aviator',
      name: 'Aviator',
      tag: 'AVIATOR',
      category: 'Popular',
      bgGradient: 'from-[#1e1b18] via-[#2d1f1d] to-[#121212]',
      iconType: 'aviator',
      link: '/aviator'
    },
    {
      id: 'balloon',
      name: 'Balloon',
      tag: 'BALLOON',
      category: 'Popular',
      bgGradient: 'from-[#be185d] via-[#db2777] to-[#9d174d]',
      iconType: 'balloon',
      link: '/aviator'
    },
    {
      id: 'dice',
      name: 'Dice',
      tag: 'DICE',
      category: 'Popular',
      bgGradient: 'from-[#7c3aed] via-[#8b5cf6] to-[#6d28d9]',
      iconType: 'dice',
      link: '/aviator'
    },
    {
      id: 'goal',
      name: 'Goal',
      tag: 'GOAL',
      category: 'New',
      bgGradient: 'from-[#15803d] via-[#16a34a] to-[#166534]',
      iconType: 'goal',
      link: '/aviator'
    },
    {
      id: 'hilo',
      name: 'HiLo',
      tag: 'HILO',
      category: 'New',
      bgGradient: 'from-[#b45309] via-[#d97706] to-[#92400e]',
      iconType: 'hilo',
      link: '/aviator'
    },
    {
      id: 'mines',
      name: 'Mines',
      tag: 'MINES',
      category: 'Popular',
      bgGradient: 'from-[#1d4ed8] via-[#2563eb] to-[#1e40af]',
      iconType: 'mines',
      link: '/aviator'
    }
  ];

  const filteredGames = games.filter((g) => {
    const matchesCategory =
      activeCategory === 'All Games' || g.category === activeCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full select-none pb-8 font-sans">
      {/* 1. TOP ORANGE HEADER AREA */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-3.5 space-y-3.5 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        {/* Title & Spribe Badge */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
              Live Casino
            </h2>
            <p className="text-xs text-white/80 font-normal mt-0.5">
              Instant-win crash games
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-xs px-3.5 py-1 rounded-full text-xs font-bold text-white border border-white/25 tracking-wider shadow-2xs">
            SPRIBE
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FaSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={13}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games"
            className="w-full bg-white rounded-2xl py-2.5 pl-9 pr-3.5 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. FILTER PILLS ROW */}
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f97316] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:text-gray-900 shadow-2xs border border-gray-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. FEATURED BIG AVIATOR BANNER (Click opens /aviator) */}
        <div
          onClick={() => navigate('/aviator')}
          className="relative h-44 rounded-3xl overflow-hidden shadow-md bg-black border border-gray-150 flex items-center justify-center cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all"
        >
          {/* Background image */}
          <img
            src={aviatorImg}
            alt="Aviator Trending"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />

          {/* Top-Left Trending Badge */}
          <div className="absolute top-3.5 left-3.5 bg-[#4ade80] text-gray-950 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>★</span>
            <span>TRENDING</span>
          </div>

          {/* Bottom-Right Play Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/aviator');
            }}
            className="absolute bottom-3.5 right-3.5 bg-[#4ade80] hover:bg-green-400 active:scale-95 text-gray-950 font-black text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 cursor-pointer transition-transform"
          >
            <span>Play</span>
            <FaPlay size={8} />
          </button>
        </div>

        {/* 4. ALL GAMES SECTION TITLE */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-1 h-4 rounded-full bg-[#f97316]" />
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            All Games
          </h3>
        </div>

        {/* 5. GAMES 3-COLUMN GRID */}
        <div className="grid grid-cols-3 gap-3">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => navigate(game.link || '/aviator')}
              className="space-y-1.5 group cursor-pointer"
            >
              {/* Game Icon Card Container */}
              <div
                className={`w-full aspect-square rounded-3xl bg-gradient-to-br ${game.bgGradient} p-2.5 flex flex-col items-center justify-between text-white shadow-2xs relative overflow-hidden group-hover:scale-102 active:scale-95 transition-all border border-white/10`}
              >
                {/* Visual Icon Art */}
                <div className="flex-1 flex items-center justify-center">
                  {game.iconType === 'aviator' && (
                    <img
                      src={aviatorImg}
                      alt="Aviator"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  )}

                  {game.iconType === 'balloon' && (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path d="M12 2C7.58 2 4 5.58 4 10c0 3.31 2.69 6 6 6.9V19h4v-2.1c3.31-.9 6-3.59 6-6.9 0-4.42-3.58-8-8-8z" />
                        <path d="M10 19h4v3h-4z" />
                        <path d="M9 22h6" />
                      </svg>
                    </div>
                  )}

                  {game.iconType === 'dice' && (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                        <circle cx="8" cy="8" r="1" fill="white" />
                        <circle cx="16" cy="8" r="1" fill="white" />
                        <circle cx="12" cy="12" r="1" fill="white" />
                        <circle cx="8" cy="16" r="1" fill="white" />
                        <circle cx="16" cy="16" r="1" fill="white" />
                      </svg>
                    </div>
                  )}

                  {game.iconType === 'goal' && (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                        <rect x="4" y="5" width="16" height="14" rx="2" />
                        <path d="M4 12h16" />
                        <path d="M12 5v14" />
                        <circle cx="17" cy="16" r="2" fill="white" />
                      </svg>
                    </div>
                  )}

                  {game.iconType === 'hilo' && (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                        <rect x="4" y="6" width="10" height="14" rx="2" />
                        <rect x="10" y="4" width="10" height="14" rx="2" />
                        <path d="M15 8v6M12 11l3-3 3 3" />
                      </svg>
                    </div>
                  )}

                  {game.iconType === 'mines' && (
                    <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 stroke-white fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="12" cy="12" r="3" fill="white" />
                        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Bottom Tag */}
                {game.iconType !== 'aviator' && (
                  <span className="text-[9px] font-black tracking-widest text-white/90 uppercase">
                    {game.tag}
                  </span>
                )}
              </div>

              {/* Game Label Below */}
              <h4 className="text-xs font-bold text-gray-900 px-0.5">
                {game.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCasino;
