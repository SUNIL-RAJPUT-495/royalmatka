import React, { createContext, useContext, useState, useEffect } from 'react';

// The 7 official theme definitions
export const APP_THEMES = [
  {
    id: 'green-current',
    name: 'Green (Current)',
    appName: 'royal1008',
    description: 'Logo ka sage green + gold. Abhi wala look.',
    headerBgColor: '#447668',
    balancePillBg: 'rgba(0, 0, 0, 0.18)',
    balancePillBorder: 'rgba(255, 255, 255, 0.2)',
    balanceTextColor: '#facc15',
    playBtnBg: '#447668',
    addFundBtnBg: '#eab308',
    addFundBtnTextColor: '#111827',
    withdrawBtnBorder: '#447668',
    withdrawBtnColor: '#447668',
    accentColor: '#447668',
    colors: ['#447668', '#2b4d44', '#eab308']
  },
  {
    id: 'orange-classic',
    name: 'Orange Classic',
    appName: 'royal1008',
    description: 'Bright orange + amber. Saaf, energetic.',
    headerBgColor: '#ea580c',
    balancePillBg: 'rgba(0, 0, 0, 0.18)',
    balancePillBorder: 'rgba(255, 255, 255, 0.2)',
    balanceTextColor: '#fed7aa',
    playBtnBg: '#ea580c',
    addFundBtnBg: '#f59e0b',
    addFundBtnTextColor: '#111827',
    withdrawBtnBorder: '#ea580c',
    withdrawBtnColor: '#ea580c',
    accentColor: '#ea580c',
    colors: ['#f97316', '#ea580c', '#f59e0b']
  },
  {
    id: 'orange-noir',
    name: 'Orange Noir',
    appName: 'royal1008',
    description: 'Neon orange + gold. Premium look.',
    headerBgColor: '#c2410c',
    balancePillBg: 'rgba(0, 0, 0, 0.18)',
    balancePillBorder: 'rgba(255, 255, 255, 0.2)',
    balanceTextColor: '#fed7aa',
    playBtnBg: '#ea580c',
    addFundBtnBg: '#fbbf24',
    addFundBtnTextColor: '#111827',
    withdrawBtnBorder: '#ea580c',
    withdrawBtnColor: '#ea580c',
    accentColor: '#c2410c',
    colors: ['#f97316', '#9a3412', '#fbbf24']
  },
  {
    id: 'orange-charcoal',
    name: 'Orange + Charcoal',
    appName: 'royal1008',
    description: 'Black header + orange buttons + gold. Sleek, premium.',
    headerBgColor: '#18181b',
    balancePillBg: 'rgba(255, 255, 255, 0.15)',
    balancePillBorder: 'rgba(255, 255, 255, 0.25)',
    balanceTextColor: '#facc15',
    playBtnBg: '#ea580c',
    addFundBtnBg: '#f97316',
    addFundBtnTextColor: '#ffffff',
    withdrawBtnBorder: '#ea580c',
    withdrawBtnColor: '#ea580c',
    accentColor: '#ea580c',
    colors: ['#18181b', '#ea580c', '#facc15']
  },
  {
    id: 'orange-emerald',
    name: 'Orange Emerald',
    appName: 'royal1008',
    description: 'Orange header + emerald action balance.',
    headerBgColor: '#ea580c',
    balancePillBg: 'rgba(0, 0, 0, 0.18)',
    balancePillBorder: 'rgba(255, 255, 255, 0.2)',
    balanceTextColor: '#6ee7b7',
    playBtnBg: '#ea580c',
    addFundBtnBg: '#059669',
    addFundBtnTextColor: '#ffffff',
    withdrawBtnBorder: '#ea580c',
    withdrawBtnColor: '#ea580c',
    accentColor: '#059669',
    colors: ['#ea580c', '#059669', '#f59e0b']
  },
  {
    id: 'rust-amber',
    name: 'Rust Amber',
    appName: 'royal1008',
    description: 'Deep rust orange + amber highlights.',
    headerBgColor: '#9a3412',
    balancePillBg: 'rgba(0, 0, 0, 0.18)',
    balancePillBorder: 'rgba(255, 255, 255, 0.2)',
    balanceTextColor: '#fed7aa',
    playBtnBg: '#c2410c',
    addFundBtnBg: '#eab308',
    addFundBtnTextColor: '#111827',
    withdrawBtnBorder: '#c2410c',
    withdrawBtnColor: '#c2410c',
    accentColor: '#9a3412',
    colors: ['#c2410c', '#9a3412', '#eab308']
  },
  {
    id: 'golden-sunset',
    name: 'Golden Sunset',
    appName: 'royal1008',
    description: 'Sunset amber + golden gradient glow.',
    headerBgColor: '#b45309',
    balancePillBg: 'rgba(0, 0, 0, 0.18)',
    balancePillBorder: 'rgba(255, 255, 255, 0.2)',
    balanceTextColor: '#fef08a',
    playBtnBg: '#ea580c',
    addFundBtnBg: '#f59e0b',
    addFundBtnTextColor: '#111827',
    withdrawBtnBorder: '#ea580c',
    withdrawBtnColor: '#ea580c',
    accentColor: '#b45309',
    colors: ['#d97706', '#b45309', '#fbbf24']
  }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Load saved theme or default to Orange Noir (id: 'orange-noir')
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedId = localStorage.getItem('app_live_theme_id');
    const matched = APP_THEMES.find((t) => t.id === savedId);
    return matched || APP_THEMES[2];
  });

  // Apply CSS Variables to :root on theme changes
  useEffect(() => {
    if (!currentTheme) return;

    const root = document.documentElement;
    root.style.setProperty('--theme-header-bg', currentTheme.headerBgColor);
    root.style.setProperty('--theme-play-btn-bg', currentTheme.playBtnBg);
    root.style.setProperty('--theme-add-fund-bg', currentTheme.addFundBtnBg);
    root.style.setProperty('--theme-add-fund-text', currentTheme.addFundBtnTextColor || '#111827');
    root.style.setProperty('--theme-withdraw-border', currentTheme.withdrawBtnBorder);
    root.style.setProperty('--theme-withdraw-color', currentTheme.withdrawBtnColor);
    root.style.setProperty('--theme-balance-pill-bg', currentTheme.balancePillBg);
    root.style.setProperty('--theme-balance-text', currentTheme.balanceTextColor);
    root.style.setProperty('--theme-accent', currentTheme.accentColor || currentTheme.headerBgColor);

    // Save to storage
    localStorage.setItem('app_live_theme_id', currentTheme.id);
    localStorage.setItem('app_selected_theme', JSON.stringify(currentTheme));

    // Broadcast change to other components/tabs
    window.dispatchEvent(new CustomEvent('app-theme-updated', { detail: currentTheme }));
  }, [currentTheme]);

  // Function to apply a new theme for all users
  const applyTheme = (theme) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        themes: APP_THEMES,
        currentTheme,
        applyTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
