import React, { useState, useEffect } from 'react';
import { 
  FaSave, FaEye, FaRedo, FaPlus, FaTrashAlt, 
  FaShieldAlt, FaInfoCircle, FaCheckCircle, FaStar
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';

export const WelcomePopupAdmin = () => {
  const defaultConfig = {
    enabled: true,
    eliteLabel: 'Elite Experience',
    headingLine: 'WELCOME TO',
    brandName: 'Royal 1008',
    trustBadgeText: "INDIA'S #1 TRUSTED APP",
    ratesHeading: 'Live Payout Rates',
    ratesSubLabel: '10 Ka Rate',
    ctaButtonText: 'Start Playing Now',
    footerLine1: 'Authorized Gaming Environment',
    footerLine2: 'Target your success with Royal Matka 🎯',
    heroDescription: 'Play safely with trusted rates and transparent payout rules.',
    ratesDescription: 'Below rates are for quick reference. Please verify before placing bids.',
    highlights: ['Fast support', 'Secure wallet', 'Instant updates'],
    notes: ['KYC required for withdrawals.', 'Play responsibly.'],
    statCards: [
      { label: 'MIN DEPOSIT', value: '₹100', color: 'emerald' },
      { label: 'MIN WITHDRAW', value: '₹1000', color: 'blue' },
      { label: 'MIN BID POINT', value: '₹10', color: 'amber' },
      { label: 'WITHDRAWAL', value: '6AM - 5PM', color: 'rose' }
    ]
  };

  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch config from API on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getWelcomePopup.url,
        method: SummaryApi.getWelcomePopup.method
      });
      if (res.data.success && res.data.config) {
        setConfig(res.data.config);
        localStorage.setItem('welcome_popup_config', JSON.stringify(res.data.config));
      }
    } catch (err) {
      console.warn('API error, falling back to local storage', err);
      const saved = localStorage.getItem('welcome_popup_config');
      if (saved) {
        try { setConfig(JSON.parse(saved)); } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, val) => {
    setConfig((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    handleChange('highlights', [...(config.highlights || []), '']);
  };

  const handleHighlightChange = (index, value) => {
    const list = [...(config.highlights || [])];
    list[index] = value;
    handleChange('highlights', list);
  };

  const handleRemoveHighlight = (index) => {
    const list = (config.highlights || []).filter((_, i) => i !== index);
    handleChange('highlights', list);
  };

  // Notes handlers
  const handleAddNote = () => {
    handleChange('notes', [...(config.notes || []), '']);
  };

  const handleNoteChange = (index, value) => {
    const list = [...(config.notes || [])];
    list[index] = value;
    handleChange('notes', list);
  };

  const handleRemoveNote = (index) => {
    const list = (config.notes || []).filter((_, i) => i !== index);
    handleChange('notes', list);
  };

  // Stat Cards handlers
  const handleAddStatCard = () => {
    handleChange('statCards', [
      ...(config.statCards || []),
      { label: 'NEW CARD', value: '₹0', color: 'emerald' }
    ]);
  };

  const handleStatCardChange = (index, key, value) => {
    const list = [...(config.statCards || [])];
    list[index] = { ...list[index], [key]: value };
    handleChange('statCards', list);
  };

  const handleRemoveStatCard = (index) => {
    const list = (config.statCards || []).filter((_, i) => i !== index);
    handleChange('statCards', list);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.updateWelcomePopup.url,
        method: SummaryApi.updateWelcomePopup.method,
        data: config
      });
      if (res.data.success) {
        localStorage.setItem('welcome_popup_config', JSON.stringify(res.data.config || config));
        window.dispatchEvent(new Event('storage'));
        toast.success(res.data.message || 'Welcome Popup settings saved to Database! 🎉');
      } else {
        toast.error(res.data.message || 'Failed to save settings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.getWelcomePopup.url,
        method: SummaryApi.getWelcomePopup.method,
        params: { _t: Date.now() }
      });
      if (res.data.success && res.data.config) {
        setConfig(res.data.config);
        localStorage.setItem('welcome_popup_config', JSON.stringify(res.data.config));
        toast.success('Welcome Popup settings refreshed from Database! 🔄');
      } else {
        toast.success('Settings reloaded 🔄');
      }
    } catch (err) {
      toast.error('Failed to refresh settings from server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 select-none font-sans bg-[#f8f9fa] min-h-screen text-gray-800">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Welcome Popup Settings
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Customize app entry modal contents, alerts, colors and limits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="border border-gray-300 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 transition-all disabled:opacity-50"
          >
            <FaRedo size={10} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <button
            onClick={handleSave}
            className="bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all"
            style={{ backgroundColor: '#00a86b' }} // Match Save button green theme
          >
            <FaSave size={12} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm space-y-5">
          
          {/* Checkbox Status */}
          <div className="flex items-center gap-2.5 pb-2">
            <input
              type="checkbox"
              id="showPopup"
              checked={config.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="w-4.5 h-4.5 text-blue-600 border-gray-300 rounded-md focus:ring-blue-500 cursor-pointer accent-blue-600"
            />
            <label htmlFor="showPopup" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
              Show Popup on Hero Page
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Elite Label */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Elite Label
              </label>
              <input
                type="text"
                value={config.eliteLabel}
                onChange={(e) => handleChange('eliteLabel', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Heading Line */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Heading Line
              </label>
              <input
                type="text"
                value={config.headingLine}
                onChange={(e) => handleChange('headingLine', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Trust Badge Text */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Trust Badge Text
              </label>
              <input
                type="text"
                value={config.trustBadgeText}
                onChange={(e) => handleChange('trustBadgeText', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Rates Heading */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Rates Heading
              </label>
              <input
                type="text"
                value={config.ratesHeading}
                onChange={(e) => handleChange('ratesHeading', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Rates Sub Label */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Rates Sub Label
              </label>
              <input
                type="text"
                value={config.ratesSubLabel}
                onChange={(e) => handleChange('ratesSubLabel', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* CTA Button Text */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={config.ctaButtonText}
                onChange={(e) => handleChange('ctaButtonText', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Footer Line 1 */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Footer Line 1
              </label>
              <input
                type="text"
                value={config.footerLine1}
                onChange={(e) => handleChange('footerLine1', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Footer Line 2 */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Footer Line 2
              </label>
              <input
                type="text"
                value={config.footerLine2}
                onChange={(e) => handleChange('footerLine2', e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            {/* Hero Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Hero Description
              </label>
              <textarea
                value={config.heroDescription}
                onChange={(e) => handleChange('heroDescription', e.target.value)}
                rows={2}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs resize-none"
              />
            </div>

            {/* Rates Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Rates Description
              </label>
              <textarea
                value={config.ratesDescription}
                onChange={(e) => handleChange('ratesDescription', e.target.value)}
                rows={2}
                className="w-full text-xs font-semibold text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs resize-none"
              />
            </div>

          </div>

          {/* Highlights List Section */}
          <div className="pt-4 border-t border-gray-150 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Highlights
              </h4>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="bg-black hover:bg-gray-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <FaPlus size={8} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {config.highlights.map((hl, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={hl}
                    onChange={(e) => handleHighlightChange(index, e.target.value)}
                    placeholder="Highlight detail"
                    className="flex-1 text-xs font-semibold text-gray-850 bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 cursor-pointer active:scale-95 transition-all"
                  >
                    <FaTrashAlt size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes Section */}
          <div className="pt-4 border-t border-gray-150 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Important Notes
              </h4>
              <button
                type="button"
                onClick={handleAddNote}
                className="bg-black hover:bg-gray-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <FaPlus size={8} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {config.notes.map((note, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleNoteChange(index, e.target.value)}
                    placeholder="Important instruction"
                    className="flex-1 text-xs font-semibold text-gray-850 bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNote(index)}
                    className="p-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 cursor-pointer active:scale-95 transition-all"
                  >
                    <FaTrashAlt size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Cards Section */}
          <div className="pt-4 border-t border-gray-150 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Stat Cards
              </h4>
              <button
                type="button"
                onClick={handleAddStatCard}
                className="bg-black hover:bg-gray-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <FaPlus size={8} />
                <span>Add Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.statCards.map((card, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50/40 relative">
                  
                  {/* Card Title & Delete button */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Card {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStatCard(index)}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <FaTrashAlt size={8} />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Label Input */}
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Label</label>
                    <input
                      type="text"
                      value={card.label}
                      onChange={(e) => handleStatCardChange(index, 'label', e.target.value)}
                      className="w-full text-xs font-semibold text-gray-850 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Value Input */}
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Value</label>
                    <input
                      type="text"
                      value={card.value}
                      onChange={(e) => handleStatCardChange(index, 'value', e.target.value)}
                      className="w-full text-xs font-semibold text-gray-850 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Color Dropdown */}
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Color</label>
                    <select
                      value={card.color}
                      onChange={(e) => handleStatCardChange(index, 'color', e.target.value)}
                      className="w-full text-xs font-bold text-gray-800 bg-white border border-gray-300 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-blue-500"
                    >
                      <option value="emerald">Emerald (Green)</option>
                      <option value="blue">Blue</option>
                      <option value="amber">Amber (Orange)</option>
                      <option value="rose">Rose (Red)</option>
                    </select>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Preview Simulator Simulator Panel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
            <span className="text-sm">👁️</span>
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Live Mockup Preview
            </h3>
          </div>

          {/* Simulator Container */}
          <div className="w-full max-w-[340px] border-[6px] border-gray-800 rounded-[36px] bg-gray-900 p-2.5 shadow-xl relative overflow-hidden aspect-[9/18]">
            <div className="w-full h-full bg-black/60 rounded-[28px] overflow-hidden flex items-center justify-center relative p-1.5">
              
              {/* Welcome Popup simulation */}
              <div className="w-full bg-white rounded-2xl overflow-y-auto max-h-[96%] scrollbar-none relative">
                
                {/* 1. Header gradient mockup */}
                <div className="bg-[#f95e07] rounded-b-[28px] px-3 pt-6 pb-6 text-center text-white relative flex flex-col items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center absolute top-2 right-2 text-xs">
                    <IoClose size={14} />
                  </div>

                  <div className="text-[8px] tracking-widest font-black text-white/80 uppercase">
                    {config.eliteLabel || 'Elite Experience'}
                  </div>

                  <h2 className="text-xs font-black uppercase mt-1">
                    {config.headingLine || 'WELCOME TO'}
                  </h2>

                  <h1 className="text-2xl font-black italic text-yellow-300 mt-0.5">
                    {config.brandName || 'Royal 1008'}
                  </h1>

                  <div className="bg-white/15 px-3 py-1 rounded-full border border-white/25 flex items-center gap-1 mt-2.5 shadow-2xs">
                    <FaShieldAlt size={8} className="text-yellow-300" />
                    <span className="text-[7px] font-black text-white">
                      {config.trustBadgeText || "INDIA'S #1 TRUSTED APP"}
                    </span>
                  </div>

                  <p className="text-white/95 text-[9px] font-semibold mt-3 max-w-[180px] leading-snug">
                    {config.heroDescription || 'Play safely with trusted rates and transparent payout rules.'}
                  </p>
                </div>

                {/* 2. Stats Grid mockup */}
                <div className="grid grid-cols-2 gap-2 px-3 pt-4">
                  {config.statCards.map((card, i) => {
                    let textClass = 'text-gray-900';
                    let borderClass = 'border-black';
                    if (card.color === 'emerald') { textClass = 'text-emerald-600'; }
                    else if (card.color === 'blue') { textClass = 'text-blue-600'; }
                    else if (card.color === 'amber') { textClass = 'text-amber-600'; }
                    else if (card.color === 'rose') { textClass = 'text-rose-500'; }

                    return (
                      <div key={i} className={`bg-white border-[1.5px] ${borderClass} rounded-xl p-2 text-center min-h-[50px] flex flex-col justify-center`}>
                        <span className={`text-[7px] font-black ${textClass}`}>{card.label}</span>
                        <span className={`text-[10px] font-black ${textClass} mt-0.5`}>{card.value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Highlights list mockup */}
                <div className="flex justify-between gap-1 px-3 pt-3">
                  {config.highlights.map((hl, i) => (
                    <span key={i} className="bg-orange-50 text-[7.5px] font-black py-0.5 rounded-full border border-orange-100/50 flex-1 text-center text-orange-600 truncate px-1">
                      {hl || 'Highlight'}
                    </span>
                  ))}
                </div>

                {/* 4. Rates table mockup */}
                <div className="bg-white border border-gray-150 rounded-2xl p-2.5 mx-3 mt-3.5 space-y-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-black">{config.ratesHeading || 'Live Payout Rates'}</span>
                    <span className="bg-gray-100 text-gray-500 text-[7px] font-bold px-1.5 py-0.5 rounded">
                      {config.ratesSubLabel || '10 Ka Rate'}
                    </span>
                  </div>
                  
                  {/* Default static rates mapping since they are not edited here */}
                  {[
                    { l: 'SINGLE ANK', r: '₹1 ka 10' },
                    { l: 'JODI', r: '₹1 ka 100' },
                    { l: 'SINGLE PANNA', r: '₹1 ka 160' },
                    { l: 'DOUBLE PANNA', r: '₹1 ka 320' },
                    { l: 'TRIPLE PANNA', r: '₹1 ka 700' },
                  ].map((item, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg p-1.5 flex justify-between items-center text-[8px] font-bold">
                      <span className="text-gray-600">{item.l}</span>
                      <span className="text-emerald-600">{item.r}</span>
                    </div>
                  ))}
                </div>

                {/* 5. Notes mockup */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 mx-3 mt-3 text-left">
                  <span className="text-[8px] font-black text-emerald-800 block mb-1">IMPORTANT NOTES</span>
                  {config.notes.map((note, i) => (
                    <p key={i} className="text-[7.5px] font-bold text-emerald-800">• {note}</p>
                  ))}
                </div>

                {/* 6. Action button mockup */}
                <div className="px-3 pt-3 pb-3">
                  <button className="w-full bg-[#f95e07] text-white text-[8.5px] font-black py-2 rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide shadow-xs">
                    ⭐ {config.ctaButtonText || 'Start Playing Now'} ▶
                  </button>
                </div>

                {/* 7. Footer mockup */}
                <div className="text-center px-3 pb-4">
                  <span className="text-[7px] font-black text-gray-400 block uppercase">
                    {config.footerLine1 || 'Authorized Gaming Environment'}
                  </span>
                  <p className="text-[7.5px] text-gray-500 font-bold mt-1">
                    {config.footerLine2 || 'Target your success with Royal Matka 🎯'}
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WelcomePopupAdmin;
