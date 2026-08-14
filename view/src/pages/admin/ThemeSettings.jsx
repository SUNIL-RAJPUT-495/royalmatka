import React, { useState } from 'react';
import { ThemeCard } from '../../components/admin/ThemeCard';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const ThemeSettings = () => {
  const { themes, currentTheme, applyTheme } = useTheme();

  // State for card selection in admin panel
  const [selectedTheme, setSelectedTheme] = useState(() => currentTheme || themes[2]);
  const [isApplying, setIsApplying] = useState(false);

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme);
  };

  const handleApplyTheme = async () => {
    if (!selectedTheme) return;
    setIsApplying(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.updateAppTheme.url,
        method: SummaryApi.updateAppTheme.method,
        data: {
          themeId: selectedTheme.id,
          themeData: selectedTheme
        }
      });
      if (res.data.success) {
        applyTheme(selectedTheme);
        toast.success(res.data.message || `Theme "${selectedTheme.name}" applied globally for all users! 🎨`);
      } else {
        toast.error(res.data.message || 'Failed to update theme');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update theme in database');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 font-sans pb-36 select-none">
      {/* 1. Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl" role="img" aria-label="palette">
            🎨
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Appearance / Theme
          </h1>
        </div>
        <p className="text-gray-500 text-sm max-w-3xl leading-relaxed">
          App ka colour theme choose karo. Ek card par click karke live preview dekho, phir{' '}
          <strong className="text-gray-800 font-semibold">Apply</strong> karo — sab users ko ye theme dikhega.
        </p>
      </div>

      {/* 2. Themes Grid (3 Columns, Total 7 Cards) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme?.id === theme.id}
            isLive={currentTheme?.id === theme.id}
            onSelect={handleSelectTheme}
          />
        ))}
      </div>

      {/* 3. Bottom Action Bar (Directly below cards) */}
      <div className="max-w-6xl mx-auto mt-8 pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
        {/* Selected Theme Text */}
        <div className="text-sm text-gray-600 font-medium">
          Selected: <span className="font-extrabold text-gray-900">{selectedTheme?.name}</span>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyTheme}
          disabled={isApplying}
          className="w-full sm:w-auto bg-[#fba979] hover:bg-[#f97316] active:scale-95 text-white font-extrabold px-8 py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer disabled:opacity-50"
        >
          {isApplying ? 'Applying...' : 'Apply for all users'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
