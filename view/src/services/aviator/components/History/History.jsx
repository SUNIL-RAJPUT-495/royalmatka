import React, { useState, useRef, useEffect } from "react";
import { useAviatorStore } from "../../store/aviatorStore";
import { FaEllipsisH, FaTimes } from "react-icons/fa";

export const History = () => {
  const { history } = useAviatorStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getMultiplierColor = (multVal) => {
    const mult = typeof multVal === "number" ? multVal : parseFloat(multVal?.crash || multVal || 1);
    if (mult < 1.5) return "text-blue-400";
    if (mult < 3.0) return "text-purple-400";
    return "text-pink-400";
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayedHistory = (Array.isArray(history) ? history : []).map((h) => {
    const val = typeof h === "number" ? h : parseFloat(h?.crash || h || 1);
    return isNaN(val) ? 1.00 : val;
  });

  const line1 = displayedHistory.slice(0, 20);
  const line2 = displayedHistory.slice(20, 40);
  const line3 = displayedHistory.slice(40, 60);

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      {/* Collapsed 1-Line View */}
      <div className="w-full flex items-center justify-between gap-2 p-2.5 select-none">
        <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
          {line1.map((mult, idx) => (
            <span
              key={`line1-${idx}`}
              className={`shrink-0 text-[13px] ${getMultiplierColor(mult)} whitespace-nowrap select-none`}
            >
              {mult.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* 3 Dots Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="shrink-0 px-1.5 py-1 bg-[#141518] hover:bg-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all select-none cursor-pointer flex items-center justify-center"
          title="Toggle 3 Lines History"
        >
          {isOpen ? <FaTimes className="text-sm text-red-500" /> : <FaEllipsisH className="text-sm" />}
        </button>
      </div>

      {/* Expanded 3-Lines View with Light Black Background (No Horizontal Scrolling) */}
      {isOpen && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-[#141518]/95 border border-white/10 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            {/* Multipliers wrapped naturally across 3 lines without horizontal scrolling */}
            <div className="flex-1 flex flex-wrap items-center gap-x-3.5 gap-y-2 max-h-[160px] overflow-hidden py-0.5">
              {displayedHistory.slice(0, 60).map((mult, idx) => (
                <span
                  key={`ex-${idx}`}
                  className={`text-[13px] ${getMultiplierColor(mult)} whitespace-nowrap select-none`}
                >
                  {mult.toFixed(2)}x
                </span>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="shrink-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              title="Close"
            >
              <FaTimes className="text-sm text-red-500" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;



