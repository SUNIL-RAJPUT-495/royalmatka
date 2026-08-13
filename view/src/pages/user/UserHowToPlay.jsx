import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import { IoVideocamOutline, IoBookOutline } from 'react-icons/io5';

export const UserHowToPlay = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Load title from local storage
  const [pageTitle] = useState(() => {
    return localStorage.getItem('how_to_play_title') || 'How to Play';
  });

  // Load sections from local storage
  const [sections] = useState(() => {
    const saved = localStorage.getItem('how_to_play_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }
    }
    return [];
  });

  return (
    <div className="w-full select-none pb-12 font-sans bg-[#f8f9fa] min-h-screen">
      {/* 1. TOP ORANGE HEADER */}
      <div
        className="p-4 pt-4 pb-5 rounded-b-[28px] text-white shadow-md transition-colors duration-300 mb-4 sticky top-0 z-30"
        style={{ backgroundColor: currentTheme.headerBgColor }}
      >
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 border border-white/20 shadow-xs"
            title="Go Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <h2 className="text-base font-bold text-white tracking-wide">
            {pageTitle}
          </h2>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {sections.length > 0 ? (
          sections.map((sec, idx) => (
            <div 
              key={sec.id || idx} 
              className="bg-white rounded-3xl p-5 border border-gray-150 shadow-2xs space-y-4 text-left"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-[#ea580c] flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                  {sec.title || 'Introduction'}
                </h3>
              </div>

              {/* Instructions */}
              {sec.instructions && (
                <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                  {sec.instructions}
                </p>
              )}

              {/* Video URL Link Card */}
              {sec.videoUrl && (
                <a 
                  href={sec.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3.5 bg-orange-50/50 hover:bg-orange-50 border border-orange-100/70 rounded-2xl transition-all cursor-pointer active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                      <FaPlay size={10} className="ml-0.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-none">Watch Tutorial Video</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1 truncate max-w-[200px]">
                        {sec.videoUrl}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-orange-500 hover:translate-x-1 transition-transform">▶</span>
                </a>
              )}

            </div>
          ))
        ) : (
          /* Empty state */
          <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-2xs flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-18 h-18 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
              <IoVideocamOutline size={48} />
            </div>

            <p className="text-xs font-semibold text-gray-655 leading-relaxed max-w-xs">
              No How To Play content available yet. Please ask the admin to configure this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHowToPlay;
