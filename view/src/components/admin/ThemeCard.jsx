import React from 'react';

export const ThemeCard = ({ theme, isSelected, isLive, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(theme)}
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col border-2 ${
        isSelected
          ? 'border-[#1e293b] shadow-xl ring-1 ring-[#1e293b]'
          : 'border-gray-200 hover:border-gray-500 hover:shadow-md'
      }`}
    >
      {/* 1. TOP MOCKUP PREVIEW */}
      <div className="p-0">
        {/* Header Bar */}
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ backgroundColor: theme.headerBgColor }}
        >
          {/* Logo: Royal in white, 1008 in gold/amber */}
          <div className="flex items-center text-white font-extrabold text-base tracking-tight">
            <span>Royal</span>
            <span className="text-[#facc15]">1008</span>
          </div>

          {/* Amount Pill */}
          <div
            className="px-3 py-1 rounded-full text-[11px] font-bold border flex items-center justify-center"
            style={{
              backgroundColor: theme.balancePillBg || 'rgba(0, 0, 0, 0.15)',
              borderColor: theme.balancePillBorder || 'rgba(255, 255, 255, 0.25)',
              color: theme.balanceTextColor || '#facc15'
            }}
          >
            ₹ 12,500
          </div>
        </div>

        {/* 3 Buttons Row */}
        <div className="px-4 py-3 bg-white flex items-center justify-between gap-2.5">
          {/* 1. Play Button */}
          <button
            type="button"
            className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-white shadow-2xs"
            style={{ backgroundColor: theme.playBtnBg }}
          >
            Play
          </button>

          {/* 2. + Add Fund Button */}
          <button
            type="button"
            className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold shadow-2xs"
            style={{
              backgroundColor: theme.addFundBtnBg,
              color: theme.addFundBtnTextColor || '#111827'
            }}
          >
            + Add Fund
          </button>

          {/* 3. Withdraw Button */}
          <button
            type="button"
            className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold bg-white border-2"
            style={{
              borderColor: theme.withdrawBtnBorder,
              color: theme.withdrawBtnColor
            }}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* 2. BOTTOM DETAILS */}
      <div className="px-5 pb-5 pt-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Clean LIVE text */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">
              {theme.name}
            </h3>
            {isLive && (
              <span className="text-[11px] font-black text-emerald-600 tracking-wider uppercase">
                LIVE
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[11px] text-gray-400 font-normal mb-3 leading-relaxed">
            {theme.description}
          </p>
        </div>

        {/* 3 Square Palette Chips */}
        <div className="flex items-center gap-2">
          {theme.colors.map((color, index) => (
            <div
              key={index}
              className="w-5 h-5 rounded-md border border-black/5"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeCard;
