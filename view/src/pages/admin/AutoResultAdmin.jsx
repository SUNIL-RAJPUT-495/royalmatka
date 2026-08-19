import React, { useState, useEffect } from 'react';
import { 
  FaRobot, FaMagic, FaPlay, FaCheckCircle, 
  FaSearch, FaClock, FaChartBar, FaHistory, FaSlidersH, FaBolt, FaCrown, FaCheck, FaTimes, FaSync, FaPlus, FaExternalLinkAlt, FaGlobe
} from 'react-icons/fa';
import { MdScoreboard, MdAutoMode } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { fetchGame } from '../../utils/api';
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';

const API_BASE_URL = 'https://dpbpssapi.growva.tech';

export const AutoResultAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('api_feed'); // 'api_feed' | 'markets' | 'calculator' | 'logs'

  // External Live API State (dpbpssapi.growva.tech/api/markets)
  const [liveApiMarkets, setLiveApiMarkets] = useState([]);
  const [liveApiLoading, setLiveApiLoading] = useState(false);
  const [goldenAnk, setGoldenAnk] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [apiSearchQuery, setApiSearchQuery] = useState('');

  // Master Global Settings State
  const [globalAutoEnabled, setGlobalAutoEnabled] = useState(() => {
    return localStorage.getItem('auto_result_global_enabled') !== 'false';
  });

  const [globalMode, setGlobalMode] = useState(() => {
    return localStorage.getItem('auto_result_global_mode') || 'least_loss';
  });

  // Market-specific Auto Settings map
  const [marketConfigs, setMarketConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_result_market_configs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Bids data for Least Loss calculation
  const [allBids, setAllBids] = useState([]);
  const [selectedCalcMarket, setSelectedCalcMarket] = useState('');
  const [calcSession, setCalcSession] = useState('Open'); // 'Open' | 'Close'

  // Execution History Logs
  const [autoLogs, setAutoLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('auto_result_logs');
      return saved ? JSON.parse(saved) : [
        {
          id: 'log-1',
          marketName: 'KALYAN',
          session: 'OPEN',
          declaredPana: '145',
          declaredJodi: '0*',
          mode: 'Least Loss (Profit Opt)',
          time: new Date(Date.now() - 3600000).toLocaleString('en-IN'),
          status: 'Success'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // 1. Fetch External Live API Markets (https://dpbpssapi.growva.tech/api/markets)
  const fetchLiveApiFeed = async () => {
    setLiveApiLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/markets`);
      const data = await response.json();

      if (data && data.markets) {
        setLiveApiMarkets(data.markets);
        if (data.goldenAnk) setGoldenAnk(data.goldenAnk);
        if (data.lastUpdated) setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString('en-IN'));
      }
    } catch (err) {
      console.error("Failed to fetch live API feed:", err);
    } finally {
      setLiveApiLoading(false);
    }
  };

  // 2. Fetch Local Database Markets & Bids
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const marketList = await fetchGame();
      if (Array.isArray(marketList)) {
        setMarkets(marketList);
        if (marketList.length > 0 && !selectedCalcMarket) {
          setSelectedCalcMarket(marketList[0]?.market_name || marketList[0]?.name || '');
        }
      }

      // Fetch bids
      const bidsRes = await AxiosAdmin({
        url: SummaryApi.getAllBids.url,
        method: SummaryApi.getAllBids.method,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      }).catch(() => null);

      if (bidsRes?.data?.bids && Array.isArray(bidsRes.data.bids)) {
        setAllBids(bidsRes.data.bids);
      }
    } catch (err) {
      console.warn("Failed to load initial data for Auto Result:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    fetchLiveApiFeed();
  }, []);

  // Real-Time Auto-Sync Polling Loop when Auto Master is ON
  useEffect(() => {
    if (!globalAutoEnabled) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/markets`);
        const data = await response.json();

        if (data && Array.isArray(data.markets)) {
          setLiveApiMarkets(data.markets);
          if (data.goldenAnk) setGoldenAnk(data.goldenAnk);
          if (data.lastUpdated) setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString('en-IN'));

          // Check if any matching market has new 3-digit Pana result to sync
          for (const apiItem of data.markets) {
            const rawResult = (apiItem.result || '').trim();
            if (!rawResult || rawResult.includes('***') || rawResult === 'Loading...') continue;

            const apiNameUpper = apiItem.name.toUpperCase().trim();
            const matched = markets.find(
              m => (m.market_name || m.name || '').toUpperCase().trim() === apiNameUpper
            );

            if (matched) {
              const dbHasOpen = matched.result_open && matched.result_open !== '***';
              const dbHasClose = matched.result_close && matched.result_close !== '***';
              
              // If open or close result is missing in DB but available in API, auto-sync!
              if (!dbHasOpen || !dbHasClose) {
                await handleSyncApiResultToDb(apiItem, true);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Auto-sync background interval:", err);
      }
    }, 10000); // Auto-sync every 10 seconds

    return () => clearInterval(interval);
  }, [globalAutoEnabled, markets]);

  // Toggle Global System Switch
  const handleToggleGlobalAuto = async () => {
    const nextState = !globalAutoEnabled;
    setGlobalAutoEnabled(nextState);
    localStorage.setItem('auto_result_global_enabled', String(nextState));

    try {
      await AxiosAdmin({
        url: '/api/market/toggle-auto-master',
        method: 'post',
        data: { enabled: nextState }
      });
    } catch (e) {}

    toast.success(`Auto Master ${nextState ? 'ACTIVATED (Automatic Sync ON) ⚡' : 'PAUSED (Manual Click Mode) ⏸️'}`);
  };

  const handleGlobalModeChange = (mode) => {
    setGlobalMode(mode);
    localStorage.setItem('auto_result_global_mode', mode);
    toast.success(`Default Algorithm set to ${mode === 'least_loss' ? 'Least Loss (Profit Opt)' : 'Random Natural'}`);
  };

  const handleToggleMarketAuto = (marketId) => {
    const current = marketConfigs[marketId] || { enabled: true, mode: globalMode };
    const updated = {
      ...marketConfigs,
      [marketId]: { ...current, enabled: !current.enabled }
    };
    setMarketConfigs(updated);
    localStorage.setItem('auto_result_market_configs', JSON.stringify(updated));
    toast.success('Market auto-result setting updated');
  };

  const handleMarketModeChange = (marketId, mode) => {
    const current = marketConfigs[marketId] || { enabled: true, mode: globalMode };
    const updated = {
      ...marketConfigs,
      [marketId]: { ...current, mode: mode }
    };
    setMarketConfigs(updated);
    localStorage.setItem('auto_result_market_configs', JSON.stringify(updated));
    toast.success('Market algorithm updated');
  };

  // Helper: Generate Random 3-digit Pana
  const generateRandomPana = () => {
    const p1 = Math.floor(Math.random() * 10);
    const p2 = Math.floor(Math.random() * 10);
    const p3 = Math.floor(Math.random() * 10);
    const sorted = [p1, p2, p3].sort((a, b) => a - b);
    return sorted.join('');
  };

  // Helper: Single digit sum mod 10
  const calculateAnk = (pana) => {
    if (!pana || String(pana).trim().length !== 3) return '*';
    const sum = String(pana).trim().split('').reduce((acc, d) => acc + (parseInt(d, 10) || 0), 0);
    return String(sum % 10);
  };

  // Least Loss Pana Calculator
  const calculateOptimalLeastLossPana = (marketName, session) => {
    const marketBids = allBids.filter(b => {
      const bMarket = (b.marketName || b.mechanic || '').toUpperCase().trim();
      const targetMarket = (marketName || '').toUpperCase().trim();
      const bSession = (b.session || 'open').toLowerCase().trim();
      const targetSession = (session || 'open').toLowerCase().trim();
      return bMarket === targetMarket && bSession === targetSession;
    });

    if (marketBids.length === 0) {
      return { pana: generateRandomPana(), payout: 0, bidCount: 0 };
    }

    const candidates = [];
    for (let i = 0; i < 50; i++) {
      const candidatePana = generateRandomPana();
      const candidateAnk = calculateAnk(candidatePana);
      let totalPayout = 0;

      marketBids.forEach(bid => {
        const betPoints = Number(bid.points || 0);
        const betDigit = String(bid.digit || bid.pana || bid.jodi || '').trim();

        if (betDigit === candidatePana) {
          totalPayout += betPoints * 140;
        } else if (betDigit === candidateAnk) {
          totalPayout += betPoints * 9.5;
        }
      });

      candidates.push({ pana: candidatePana, payout: totalPayout, bidCount: marketBids.length });
    }

    candidates.sort((a, b) => a.payout - b.payout);
    return candidates[0];
  };

  // Execute Auto Result manually
  const handleExecuteAutoResult = async (market) => {
    const marketName = market.market_name || market.name;
    const marketId = market._id;
    const config = marketConfigs[marketId] || { enabled: true, mode: globalMode };
    const modeUsed = config.mode || globalMode;

    const dbHasOpen = market.result_open && market.result_open !== '***';
    const dbHasClose = market.result_close && market.result_close !== '***';

    let sessionToDeclare = 'open';
    if (!dbHasOpen) {
      sessionToDeclare = 'open';
    } else if (!dbHasClose) {
      sessionToDeclare = 'close';
    } else {
      toast.error(`Both Open & Close results are already declared for ${marketName}!`);
      return;
    }

    setLoading(true);
    try {
      let finalOpenPana = market.result_open && market.result_open !== '***' ? market.result_open : '';
      let finalClosePana = market.result_close && market.result_close !== '***' ? market.result_close : '';

      if (sessionToDeclare === 'open') {
        if (modeUsed === 'least_loss') {
          const res = calculateOptimalLeastLossPana(marketName, 'Open');
          finalOpenPana = res.pana;
        } else {
          finalOpenPana = generateRandomPana();
        }
      } else {
        if (modeUsed === 'least_loss') {
          const res = calculateOptimalLeastLossPana(marketName, 'Close');
          finalClosePana = res.pana;
        } else {
          finalClosePana = generateRandomPana();
        }
      }

      const openAnk = calculateAnk(finalOpenPana);
      const closeAnk = calculateAnk(finalClosePana);
      const jodiVal = (openAnk !== '*' && closeAnk !== '*') ? (openAnk + closeAnk) : (openAnk !== '*' ? `${openAnk}*` : '');

      const res = await AxiosAdmin({
        url: SummaryApi.declareResult.url,
        method: SummaryApi.declareResult.method,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        data: {
          marketId,
          marketName,
          resultOpen: finalOpenPana,
          resultClose: finalClosePana,
          jodiResult: jodiVal
        }
      });

      if (res.data?.success) {
        toast.success(`Auto Result Declared for ${marketName} (${sessionToDeclare.toUpperCase()})! Pana: ${sessionToDeclare === 'open' ? finalOpenPana : finalClosePana} 🎯`);
      } else {
        toast.success(`Auto Result updated for ${marketName}! 🎯`);
      }

      const newLog = {
        id: `log-${Date.now()}`,
        marketName,
        session: sessionToDeclare.toUpperCase(),
        declaredPana: sessionToDeclare === 'open' ? finalOpenPana : finalClosePana,
        declaredJodi: jodiVal || '**',
        mode: modeUsed === 'least_loss' ? 'Least Loss (Profit Opt)' : 'Random Natural',
        time: new Date().toLocaleString('en-IN'),
        status: 'Success'
      };

      const updatedLogs = [newLog, ...autoLogs];
      setAutoLogs(updatedLogs);
      localStorage.setItem('auto_result_logs', JSON.stringify(updatedLogs));

      await loadInitialData();
    } catch (err) {
      console.error("Auto Result execution failed:", err);
      toast.error(`Failed to auto-declare result for ${marketName}`);
    } finally {
      setLoading(false);
    }
  };

  // Add External API Market to Local Database
  const handleCreateMarketFromApi = async (apiItem) => {
    const marketName = apiItem.name;

    const isAlreadyAdded = markets.some(
      m => (m.market_name || m.name || '').toUpperCase().trim() === marketName.toUpperCase().trim()
    );

    if (isAlreadyAdded) {
      toast.error(`Market "${marketName}" is ALREADY added in Database! Duplicate entry is not allowed.`);
      return;
    }

    const timingStr = (apiItem.timing || '').trim();

    // Parse timing string e.g. "11:40 AM 12:40 PM"
    let openTime = "12:00 PM";
    let closeTime = "02:00 PM";

    const timeMatch = timingStr.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s+(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
    if (timeMatch) {
      openTime = timeMatch[1].toUpperCase();
      closeTime = timeMatch[2].toUpperCase();
    } else {
      const parts = timingStr.split(/\s+/);
      if (parts.length >= 4) {
        openTime = `${parts[0]} ${parts[1]}`;
        closeTime = `${parts[2]} ${parts[3]}`;
      }
    }

    setLoading(true);
    try {
      const response = await AxiosAdmin({
        url: SummaryApi.addGame.url,
        method: SummaryApi.addGame.method,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        data: {
          market_name: marketName,
          name: marketName,
          open_time: openTime,
          close_time: closeTime,
          open_result_time: openTime,
          close_result_time: closeTime,
          off_days: []
        }
      });

      const newMarketObj = response.data?.data || {
        _id: `temp-${Date.now()}`,
        market_name: marketName,
        name: marketName,
        open_time: openTime,
        close_time: closeTime
      };

      // Immediately append to markets state so isMatch becomes true instantly and + Add Market button vanishes!
      setMarkets((prev) => {
        const exists = prev.some(m => (m.market_name || m.name || '').toUpperCase().trim() === marketName.toUpperCase().trim());
        return exists ? prev : [...prev, newMarketObj];
      });

      toast.success(response.data?.message || `Market "${marketName}" created successfully! 🎉`);

      // Auto-sync result if available (silently without secondary toast)
      const rawResult = (apiItem.result || '').trim();
      if (rawResult && !rawResult.includes('***') && rawResult !== 'Loading...') {
        await handleSyncApiResultToDb(apiItem, true);
      } else {
        await loadInitialData();
      }
    } catch (error) {
      console.error("Error adding market from API:", error);
      toast.error(error?.response?.data?.message || `Failed to add market "${marketName}"`);
    } finally {
      setLoading(false);
    }
  };

  // Sync Live API Result to local DB market
  const handleSyncApiResultToDb = async (apiItem, isSilent = false) => {
    const rawResult = (apiItem.result || '').trim();
    if (!rawResult || rawResult.includes('***') || rawResult === 'Loading...') {
      if (!isSilent) toast.error(`No valid result published yet for ${apiItem.name} (${rawResult || 'N/A'})`);
      return;
    }

    const parts = rawResult.split('-');
    let openPana = '';
    let jodiVal = '';
    let closePana = '';

    if (parts.length === 3) {
      openPana = parts[0];
      jodiVal = parts[1];
      closePana = parts[2];
    } else if (parts.length === 2) {
      openPana = parts[0];
      jodiVal = parts[1];
    }

    // Match with local db market
    const apiNameUpper = apiItem.name.toUpperCase().trim();
    const matchedMarket = markets.find(m => (m.market_name || m.name || '').toUpperCase().trim() === apiNameUpper);

    if (!matchedMarket) {
      if (!isSilent) toast.error(`Market "${apiItem.name}" is not in Database. Click "+ Add Market" first!`);
      return;
    }

    // Check if result is already declared in DB
    const dbHasOpen = matchedMarket.result_open && matchedMarket.result_open !== '***';
    const dbHasClose = matchedMarket.result_close && matchedMarket.result_close !== '***';

    if (dbHasOpen && dbHasClose) {
      if (!isSilent) {
        toast.error(`Result for "${apiItem.name}" is ALREADY declared in database!`);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await AxiosAdmin({
        url: SummaryApi.declareResult.url,
        method: SummaryApi.declareResult.method,
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        data: {
          marketId: matchedMarket._id,
          marketName: matchedMarket.market_name || matchedMarket.name,
          resultOpen: openPana || matchedMarket.result_open || '***',
          resultClose: closePana || matchedMarket.result_close || '***',
          jodiResult: jodiVal || matchedMarket.jodi_result || '**'
        }
      });

      if (!isSilent) {
        if (res.data?.success) {
          toast.success(`Synced ${apiItem.name} result (${rawResult}) to database! 🎯`);
        } else {
          toast.success(`Result updated for ${apiItem.name}!`);
        }
      }

      const newLog = {
        id: `log-${Date.now()}`,
        marketName: apiItem.name,
        session: 'API SYNC',
        declaredPana: `${openPana || '***'}-${closePana || '***'}`,
        declaredJodi: jodiVal || '**',
        mode: 'DPBOSS Live API Sync',
        time: new Date().toLocaleString('en-IN'),
        status: 'Success'
      };

      const updatedLogs = [newLog, ...autoLogs];
      setAutoLogs(updatedLogs);
      localStorage.setItem('auto_result_logs', JSON.stringify(updatedLogs));

      await loadInitialData();
    } catch (err) {
      toast.error(`Failed to sync result for ${apiItem.name}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkets = markets.filter(m => {
    const name = (m.market_name || m.name || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredApiMarkets = liveApiMarkets.filter(item => {
    const name = (item.name || '').toLowerCase();
    const result = (item.result || '').toLowerCase();
    return name.includes(apiSearchQuery.toLowerCase()) || result.includes(apiSearchQuery.toLowerCase());
  });

  const calcMarketData = markets.find(m => (m.market_name || m.name) === selectedCalcMarket);
  const calcOptimal = selectedCalcMarket ? calculateOptimalLeastLossPana(selectedCalcMarket, calcSession) : null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-8 font-sans text-gray-800 text-left select-none flex justify-center items-start">
      <Toaster position="top-center" />

      <div className="w-full max-w-5xl shadow-md rounded-3xl overflow-hidden border border-gray-200 bg-white">

        {/* 1. Deep Blue Header Banner */}
        <div className="bg-[#0f53d6] text-white py-6 px-6 text-center relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white text-xl">
                <FaRobot />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold tracking-tight text-white">Auto Result Management</h1>
                <p className="text-xs text-white/80 font-medium">DPBOSS Live API Feed & Automated Payout System</p>
              </div>
            </div>

            {/* Master Toggle Switch */}
            <div className="flex items-center gap-3 bg-white/15 px-4 py-2 rounded-2xl border border-white/20">
              <div className="text-right">
                <span className="text-xs font-bold text-white block">Auto Master</span>
                <span className="text-[10px] text-white/80 font-medium">
                  {globalAutoEnabled ? 'Online ⚡' : 'Paused ⏸️'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleGlobalAuto}
                className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer flex items-center shadow-inner ${
                  globalAutoEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-400 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Main Content Container */}
        <div className="p-6 space-y-6">

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold">
            <div className="bg-blue-50 border border-blue-150 p-4 rounded-2xl text-blue-900">
              <span className="text-[10px] text-blue-600 block uppercase font-bold">Live API Feed</span>
              <span className="text-xl font-black text-blue-900 mt-1 block">{liveApiMarkets.length} Markets</span>
            </div>

            <div className="bg-amber-50 border border-amber-150 p-4 rounded-2xl text-amber-900">
              <span className="text-[10px] text-amber-600 block uppercase font-bold">Golden Ank</span>
              <span className="text-base font-black text-amber-900 mt-1 block font-mono">
                {goldenAnk || '0-5-3-8'}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-emerald-900">
              <span className="text-[10px] text-emerald-600 block uppercase font-bold">Local DB Markets</span>
              <span className="text-xl font-black text-emerald-900 mt-1 block">{markets.length}</span>
            </div>

            <div className="bg-purple-50 border border-purple-150 p-4 rounded-2xl text-purple-900">
              <span className="text-[10px] text-purple-600 block uppercase font-bold">API Sync Endpoint</span>
              <span className="text-[11px] font-bold text-purple-900 mt-1.5 block truncate">
                {API_BASE_URL}/api/markets
              </span>
            </div>
          </div>

          {/* Tabs switch row */}
          <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 pb-3 text-xs font-bold text-gray-400">
            {[
              { id: 'api_feed', label: `🌐 DPBOSS API Feed (${liveApiMarkets.length})` },
              { id: 'logs', label: 'Execution History' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 pb-3 -mb-3 transition-colors cursor-pointer ${
                    isActive 
                      ? 'text-[#0f53d6] border-b-2 border-[#0f53d6] font-extrabold' 
                      : 'hover:text-gray-600'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 0: LIVE EXTERNAL API FEED */}
          {activeTab === 'api_feed' && (
            <div className="space-y-4">
              
              {/* API Header & Search Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="relative w-full md:w-80">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input
                    type="text"
                    value={apiSearchQuery}
                    onChange={(e) => setApiSearchQuery(e.target.value)}
                    placeholder="Search 164 live API markets or results..."
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-semibold">
                    Last Updated: <strong className="text-gray-800">{lastUpdated || 'Just Now'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={fetchLiveApiFeed}
                    disabled={liveApiLoading}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <FaSync className={liveApiLoading ? 'animate-spin' : ''} size={11} />
                    <span>Refresh Live Feed</span>
                  </button>
                </div>
              </div>

              {/* API Markets Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="p-3.5">ID</th>
                        <th className="p-3.5">Market Name</th>
                        <th className="p-3.5">Live Result</th>
                        <th className="p-3.5">Timing</th>
                        <th className="p-3.5">Match Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredApiMarkets.map((item) => {
                        const matchedDbMarket = markets.find(
                          m => (m.market_name || m.name || '').toUpperCase().trim() === item.name.toUpperCase().trim()
                        );
                        const isMatch = Boolean(matchedDbMarket);
                        const isAlreadyDeclared = Boolean(
                          matchedDbMarket &&
                          matchedDbMarket.result_open && matchedDbMarket.result_open !== '***' &&
                          matchedDbMarket.result_close && matchedDbMarket.result_close !== '***'
                        );
                        const hasResult = item.result && item.result !== '***-**-***' && item.result !== 'Loading...';

                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3.5 text-gray-400 font-mono text-[11px]">{item.id}</td>

                            <td className="p-3.5 font-bold text-gray-900">
                              <span>{item.name}</span>
                            </td>

                            <td className="p-3.5">
                              <span className={`font-mono font-bold px-2.5 py-1 rounded-lg border text-xs ${
                                hasResult 
                                  ? 'bg-amber-50 text-amber-900 border-amber-200' 
                                  : 'bg-gray-100 text-gray-400 border-gray-200'
                              }`}>
                                {item.result || '***-**-***'}
                              </span>
                            </td>

                            <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                              {item.timing || 'N/A'}
                            </td>

                            <td className="p-3.5">
                              {isMatch ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Added In DB
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                                  + Not In DB
                                </span>
                              )}
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Button 1: Add Market to DB (Only shown if NOT in database) */}
                                {!isMatch ? (
                                  <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleCreateMarketFromApi(item)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-2xs active:scale-95 cursor-pointer inline-flex items-center gap-1"
                                    title="Add market to database"
                                  >
                                    <FaPlus size={10} />
                                    <span>+ Add Market</span>
                                  </button>
                                ) : (
                                  <>
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-flex items-center gap-1">
                                      <FaCheck size={10} />
                                      <span>Added</span>
                                    </span>
                                    
                                    {/* Button 2: Sync Result to DB */}
                                    <button
                                      type="button"
                                      disabled={loading || !hasResult || isAlreadyDeclared}
                                      onClick={() => handleSyncApiResultToDb(item)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 ${
                                        isAlreadyDeclared
                                          ? 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
                                          : hasResult
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs active:scale-95 cursor-pointer'
                                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                      }`}
                                      title={isAlreadyDeclared ? "Result is already declared in database" : "Sync result to database"}
                                    >
                                      {isAlreadyDeclared ? <FaCheck size={10} /> : <FaBolt size={10} />}
                                      <span>{isAlreadyDeclared ? '✓ Already Declared' : (hasResult ? 'Sync Result' : 'No Result')}</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EXECUTION LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FaHistory className="text-blue-600" />
                <span>Auto Result Execution History</span>
              </h2>

              {autoLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead className="bg-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="p-3">Market</th>
                        <th className="p-3">Session</th>
                        <th className="p-3">Declared Pana</th>
                        <th className="p-3">Declared Jodi</th>
                        <th className="p-3">Algorithm</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {autoLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-bold text-gray-900">{log.marketName}</td>
                          <td className="p-3 text-gray-600">{log.session}</td>
                          <td className="p-3 font-mono text-amber-700 font-bold">{log.declaredPana}</td>
                          <td className="p-3 font-mono text-emerald-700 font-bold">{log.declaredJodi}</td>
                          <td className="p-3 text-gray-600">{log.mode}</td>
                          <td className="p-3 text-gray-400 text-xs font-mono">{log.time}</td>
                          <td className="p-3 text-right">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No auto result execution logs recorded yet.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AutoResultAdmin;
