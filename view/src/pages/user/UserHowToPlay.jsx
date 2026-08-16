import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import { IoVideocamOutline } from 'react-icons/io5';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const UserHowToPlay = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [pageTitle, setPageTitle] = useState('How to Play');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await Axios({
          url: SummaryApi.getHowToPlay.url,
          method: SummaryApi.getHowToPlay.method
        });
        if (res.data?.success) {
          if (res.data.title) setPageTitle(res.data.title);
          if (Array.isArray(res.data.sections)) setSections(res.data.sections);
        }
      } catch (err) {
        console.warn('Could not fetch How To Play content');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="w-full select-none pb-12 font-sans bg-[#f8f9fa] min-h-screen text-left">
      {/* 1. TOP HEADER */}
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

      <div className="px-4 space-y-4 max-w-lg mx-auto">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin h-8 w-8 border-3 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sections.length > 0 ? (
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
                <p className="text-xs font-semibold text-gray-600 leading-relaxed whitespace-pre-line">
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
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
                      <FaPlay size={10} className="ml-0.5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-800 leading-none">Watch Tutorial Video</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1 truncate">
                        {sec.videoUrl}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-orange-500 group-hover:translate-x-1 transition-transform shrink-0 ml-2">▶</span>
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

            <p className="text-xs font-semibold text-gray-500 leading-relaxed max-w-xs">
              No How To Play content available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHowToPlay;
