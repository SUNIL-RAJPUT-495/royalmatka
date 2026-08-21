import React, { useState, useEffect } from 'react';
import { 
  Plus, Phone, MessageCircle, Mail, MapPin, Send, Save, 
  RefreshCw, Trash2, CheckCircle2, User, Key, Eye, EyeOff, Upload, QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';
import Axios from '../../utils/axios';
import SummaryApi from '../../common/SummerAPI';

export const UpiSettings = () => {
  // UPI ID List
  const [upiList, setUpiList] = useState([
    { id: 1, upiId: 'sanwariyaboss@ybl', displayName: 'Sanwariya Boss', isActive: true }
  ]);
  const [newUpiId, setNewUpiId] = useState('sanwariyaboss@ybl');
  const [newDisplayName, setNewDisplayName] = useState('Sanwariya Boss');
  const [newIsActive, setNewIsActive] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // OTP Verification state
  const [isOtpEnabled, setIsOtpEnabled] = useState(true);

  // Add-Fund System state
  const [activeFundSystem, setActiveFundSystem] = useState('Manual'); // 'IMB' | 'PayFromUPI' | 'Manual'
  const [imbToken, setImbToken] = useState('****');
  const [payFromUpiToken, setPayFromUpiToken] = useState('');
  const [showImbToken, setShowImbToken] = useState(false);
  const [showPayFromUpiToken, setShowPayFromUpiToken] = useState(false);

  // Payment Limits state
  const [minAmount, setMinAmount] = useState('100');
  const [maxAmount, setMaxAmount] = useState('20000');
  const [quickAmountString, setQuickAmountString] = useState('100,300,500,1000,5000,10000');

  // Load backend payment settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await Axios({
          url: SummaryApi.getPaymentSettings.url,
          method: SummaryApi.getPaymentSettings.method
        });
        if (res.data?.settings) {
          const s = res.data.settings;
          setNewUpiId(s.upiId || 'sanwariyaboss@ybl');
          setNewDisplayName(s.displayName || 'Sanwariya Boss');
          setQrCodeUrl(s.qrCodeUrl || '');
          setActiveFundSystem(s.activeFundSystem || 'Manual');
          setMinAmount(String(s.minAmount || 100));
          setMaxAmount(String(s.maxAmount || 20000));
          if (s.quickAmounts && s.quickAmounts.length > 0) {
            setQuickAmountString(s.quickAmounts.join(','));
          }
          setIsOtpEnabled(s.isOtpEnabled !== false);
        }
      } catch (err) {
        console.warn('Using default UPI settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSaveAllSettings = async () => {
    try {
      const payload = {
        upiId: newUpiId,
        displayName: newDisplayName,
        qrCodeUrl: qrCodeUrl,
        activeFundSystem: activeFundSystem,
        minAmount: Number(minAmount),
        maxAmount: Number(maxAmount),
        quickAmounts: quickAmountString.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v)),
        isOtpEnabled: isOtpEnabled
      };

      const res = await Axios({
        url: SummaryApi.updatePaymentSettings.url,
        method: SummaryApi.updatePaymentSettings.method,
        data: payload
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Payment settings saved successfully! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save payment settings');
    }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUrl(reader.result);
        toast.success('QR Code Scanner uploaded! Click Save Settings.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse quick amounts
  const quickAmounts = quickAmountString
    .split(',')
    .map(val => val.trim())
    .filter(val => val !== '' && !isNaN(val));

  const handleAddUpi = (e) => {
    e.preventDefault();
    if (!newUpiId.trim() || !newUpiId.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }
    if (!newDisplayName.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    const newUpi = {
      id: Date.now(),
      upiId: newUpiId.trim(),
      displayName: newDisplayName.trim(),
      isActive: newIsActive
    };

    if (newIsActive) {
      setUpiList(prev => prev.map(u => ({ ...u, isActive: false })).concat(newUpi));
    } else {
      setUpiList(prev => [...prev, newUpi]);
    }

    toast.success('UPI ID added successfully!');
    setNewUpiId('');
    setNewDisplayName('');
    setNewIsActive(false);
  };

  const handleToggleUpiActive = (id) => {
    setUpiList(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, isActive: !u.isActive };
      }
      return { ...u, isActive: false };
    }));
    toast.success('UPI active state updated');
  };

  const handleDeleteUpi = (id) => {
    if (window.confirm('Are you sure you want to delete this UPI ID?')) {
      setUpiList(prev => prev.filter(u => u.id !== id));
      toast.success('UPI ID deleted');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 md:p-10 font-sans flex justify-center items-start text-left select-none text-gray-800">
      
      <div className="w-full max-w-5xl space-y-8">
        
        {/* 1. Header Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-red-100 text-red-650 rounded-2xl border border-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">UPI Settings Management</h1>
            <p className="text-gray-500 font-medium text-xs mt-1">Configure and manage UPI payment options for your application</p>
          </div>
        </div>

        {/* 2. Side-By-Side: Add UPI & Manage UPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Add New UPI */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-green-600 text-xl font-bold">+</span>
                <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Add New UPI</span>
              </div>

              <form onSubmit={handleAddUpi} className="space-y-4">
                {/* UPI ID */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">UPI ID</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    </span>
                    <input 
                      type="text" 
                      placeholder="example@ybl"
                      value={newUpiId}
                      onChange={(e) => setNewUpiId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold"
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 font-semibold block">Enter a valid UPI ID in the format username@provider</span>
                </div>

                {/* Display Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">
                      <User size={14} className="stroke-[2.5]" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="LocalMart"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold"
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 font-semibold block">This name will be displayed to users during payment</span>
                </div>

                {/* QR Code Scanner Upload */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <QrCode size={12} className="text-orange-500" />
                    <span>UPI QR Code Scanner Image</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Scanner" className="w-20 h-20 object-contain rounded-xl border border-gray-200 shadow-2xs bg-white" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-semibold">
                        No QR Image
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <label className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-2xs">
                        <Upload size={14} />
                        <span>Upload Scanner Image</span>
                        <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                      </label>
                      <input 
                        type="text" 
                        placeholder="Or paste QR Image URL"
                        value={qrCodeUrl}
                        onChange={(e) => setQrCodeUrl(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Switch Active */}
                <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-2">
                  <div>
                    <span className="text-xs font-bold text-gray-700">Set as active UPI</span>
                    <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Only active UPIs can receive payments</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewIsActive(!newIsActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${
                      newIsActive ? 'bg-[#22c55e]' : 'bg-gray-250'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${newIsActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </form>
            </div>

            <button 
              type="button"
              onClick={handleSaveAllSettings}
              className="w-full bg-[#ef4444] hover:bg-red-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-wider text-xs mt-4 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Payment & QR Settings</span>
            </button>
          </div>

          {/* Manage UPI Settings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-xl font-bold">::</span>
                <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Manage UPI Settings</span>
              </div>
              <button 
                onClick={() => toast.success('List updated')}
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>

            {upiList.length > 0 ? (
              <div className="space-y-3 flex-1">
                {upiList.map((upi) => (
                  <div key={upi.id} className="p-4 rounded-xl border border-gray-150 flex items-center justify-between bg-white shadow-2xs">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">{upi.upiId}</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Name: {upi.displayName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleUpiActive(upi.id)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          upi.isActive 
                            ? 'bg-green-50 text-[#22c55e] border-green-200' 
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                      >
                        {upi.isActive ? '● Active' : '○ Inactive'}
                      </button>

                      <button
                        onClick={() => handleDeleteUpi(upi.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-150 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><rect width="6" height="6" x="7" y="7"/><rect width="6" height="6" x="7" y="15"/><rect width="6" height="6" x="15" y="7"/><rect width="2" height="2" x="15" y="15"/><rect width="2" height="2" x="17" y="17"/></svg>
                <span className="text-xs font-bold text-gray-700 block">No UPI settings found</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1">Add your first UPI setting using the form</span>
              </div>
            )}
          </div>

        </div>

        {/* 3. Login OTP Verification */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold text-xs">i</div>
            <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Login OTP Verification</span>
          </div>
          <p className="text-xs text-gray-505 font-medium leading-relaxed">
            Turn OTP verification on or off for user login & signup. When OFF, users log in directly without receiving an OTP.
          </p>

          <div className="p-4 rounded-xl border border-gray-200 flex items-center justify-between bg-white shadow-2xs">
            <div>
              <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isOtpEnabled ? 'text-emerald-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isOtpEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                OTP is currently {isOtpEnabled ? 'ON' : 'OFF'}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                {isOtpEnabled ? 'Users must verify an OTP to log in / sign up.' : 'Users log in instantly without OTP.'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-extrabold ${isOtpEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                {isOtpEnabled ? 'ON' : 'OFF'}
              </span>
              <button
                type="button"
                onClick={async () => {
                  const nextVal = !isOtpEnabled;
                  setIsOtpEnabled(nextVal);
                  toast.success(`OTP Verification turned ${nextVal ? 'ON' : 'OFF'}`);
                  try {
                    await Axios({
                      url: SummaryApi.updatePaymentSettings.url,
                      method: SummaryApi.updatePaymentSettings.method,
                      data: {
                        upiId: newUpiId,
                        displayName: newDisplayName,
                        qrCodeUrl: qrCodeUrl,
                        activeFundSystem: activeFundSystem,
                        minAmount: Number(minAmount),
                        maxAmount: Number(maxAmount),
                        quickAmounts: quickAmountString.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v)),
                        isOtpEnabled: nextVal
                      }
                    });
                  } catch (err) {
                    console.error('Error saving OTP setting:', err);
                  }
                }}
                className={`w-12 h-6.5 rounded-full transition-all relative flex items-center px-1 cursor-pointer border ${
                  isOtpEnabled 
                    ? 'bg-[#22c55e] border-emerald-600' 
                    : 'bg-gray-300 border-gray-400'
                }`}
                title={`Click to turn OTP ${isOtpEnabled ? 'OFF' : 'ON'}`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform ${
                  isOtpEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>



        {/* 4. Add-Fund System */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold text-xs">i</div>
            <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Add-Fund System</span>
          </div>
          <p className="text-xs text-gray-505 font-medium leading-relaxed">
            Choose which system users see on the Add-Fund page. Only one is active at a time.
          </p>

          {/* 3 option boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1: IMB Gateway */}
            <div 
              onClick={() => setActiveFundSystem('IMB')}
              className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                activeFundSystem === 'IMB' ? 'border-[#f97316] bg-white' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-gray-800 block">IMB Gateway</span>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">Automatic payment gateway — instant auto-credit to wallet.</span>
              </div>
              <button
                type="button"
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  activeFundSystem === 'IMB' ? 'bg-[#f97316]' : 'bg-gray-200'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${activeFundSystem === 'IMB' ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Box 2: PayFromUPI */}
            <div 
              onClick={() => setActiveFundSystem('PayFromUPI')}
              className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                activeFundSystem === 'PayFromUPI' ? 'border-[#f97316] bg-white' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-gray-800 block">PayFromUPI</span>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">Automatic UPI gateway — redirect + webhook, instant auto-credit.</span>
              </div>
              <button
                type="button"
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  activeFundSystem === 'PayFromUPI' ? 'bg-[#f97316]' : 'bg-gray-200'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${activeFundSystem === 'PayFromUPI' ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Box 3: QR / UPI Manual */}
            <div 
              onClick={() => setActiveFundSystem('Manual')}
              className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                activeFundSystem === 'Manual' ? 'border-[#f97316] bg-white' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-gray-800 block">QR / UPI (Manual)</span>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">User pays to your UPI ID, admin approves the payment manually.</span>
              </div>
              <button
                type="button"
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  activeFundSystem === 'Manual' ? 'bg-[#f97316]' : 'bg-gray-200'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${activeFundSystem === 'Manual' ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>

          {/* Conditional inputs */}
          {activeFundSystem === 'IMB' && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">IMB API Token</label>
              <div className="relative">
                <input 
                  type={showImbToken ? 'text' : 'password'} 
                  value={imbToken}
                  onChange={(e) => setImbToken(e.target.value)}
                  className="w-full px-4 py-2.5 pr-14 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs font-semibold"
                />
                <button 
                  type="button" 
                  onClick={() => setShowImbToken(!showImbToken)}
                  className="absolute right-4 top-3 text-[11px] font-bold text-orange-500 uppercase tracking-wide cursor-pointer hover:text-orange-600"
                >
                  {showImbToken ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {activeFundSystem === 'PayFromUPI' && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">PayFromUPI Token</label>
                <div className="relative">
                  <input 
                    type={showPayFromUpiToken ? 'text' : 'password'} 
                    value={payFromUpiToken}
                    onChange={(e) => setPayFromUpiToken(e.target.value)}
                    className="w-full px-4 py-2.5 pr-14 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs font-semibold focus:border-orange-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPayFromUpiToken(!showPayFromUpiToken)}
                    className="absolute right-4 top-3 text-[11px] font-bold text-orange-500 uppercase tracking-wide cursor-pointer hover:text-orange-600"
                  >
                    {showPayFromUpiToken ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                Bearer token from your PayFromUPI dashboard (App Login key). Required when PayFromUPI is selected. Set the webhook URL in your PayFromUPI dashboard to:<br/>
                <span className="text-blue-600 font-bold">https://api.tara777.uno/api/payfromupi/webhook</span>
              </p>
            </div>
          )}

          {/* Yellow info banner */}
          <div className="bg-[#fff7ed] border border-[#ffedd5] text-[#c2410c] p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
            <span>Users will currently see the <span className="font-bold underline">{activeFundSystem} (auto)</span> add-fund system.</span>
          </div>

          <button 
            type="button"
            onClick={handleSaveAllSettings}
            className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-sm"
          >
            <Save size={13} />
            <span>Save Add-Fund System</span>
          </button>
        </div>

        {/* 5. Payment Limits */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold text-xs">i</div>
            <span className="font-bold text-gray-800 uppercase text-xs tracking-wider">Payment Limits</span>
          </div>
          <p className="text-xs text-gray-555 font-medium leading-relaxed">
            Set the minimum and maximum deposit amount users can enter on the payment page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min Amount */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum Payment Amount (₹)</label>
              <input 
                type="text" 
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs font-semibold"
              />
              <span className="text-[9px] text-gray-400 font-semibold block">User cannot pay less than this amount.</span>
            </div>

            {/* Max Amount */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Maximum Payment Amount (₹)</label>
              <input 
                type="text" 
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs font-semibold"
              />
              <span className="text-[9px] text-gray-400 font-semibold block">User cannot pay more than this amount.</span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quick Amount Buttons</label>
              <input 
                type="text" 
                value={quickAmountString}
                onChange={(e) => setQuickAmountString(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none text-xs font-semibold"
              />
              <span className="text-[9px] text-gray-400 font-semibold block">Comma se alag karke amounts likho. Yehi buttons deposit page par dikhenge.</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt, idx) => (
                <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xs">
                  ₹{Number(amt).toLocaleString('en-IN')}
                </span>
              ))}
            </div>
          </div>

          {/* Yellow info banner */}
          <div className="bg-[#fff7ed] border border-[#ffedd5] text-[#c2410c] p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
            <span>Users will be allowed to deposit between <span className="font-bold">₹{Number(minAmount).toLocaleString('en-IN')}</span> and <span className="font-bold">₹{Number(maxAmount).toLocaleString('en-IN')}</span>.</span>
          </div>

          <button 
            type="button"
            onClick={handleSaveAllSettings}
            className="w-full bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-sm"
          >
            <Save size={13} />
            <span>Save Payment Limits</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default UpiSettings;
