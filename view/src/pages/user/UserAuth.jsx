import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Axios from "../../utils/axios";
import SummaryApi from "../../common/SummerAPI";
import {
  FaUserAlt,
  FaPhoneAlt,
  FaLock,
  FaKey,
  FaShareAlt,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft
} from "react-icons/fa";

export const UserAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: "register" | "login"
  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");

  // Registration step: 1 (Mobile), 2 (Verify OTP), 3 (Create Account)
  const [regStep, setRegStep] = useState(1);

  // Login step: 1 (Mobile & Method select), 2 (Enter Pass OR Enter OTP)
  const [loginStep, setLoginStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"

  // Form Fields
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer & Loading states
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(271); // 4:31 countdown like screenshot
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState("");

  const otpInputsRef = useRef([]);

  // Sync mode with route changes
  useEffect(() => {
    if (location.pathname === "/register" || location.pathname === "/signup") {
      setMode("register");
    } else if (location.pathname === "/login") {
      setMode("login");
    }
  }, [location.pathname]);

  // Countdown timer logic
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Reset states when switching mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setRegStep(1);
    setLoginStep(1);
    setMobile("");
    setOtp(["", "", "", ""]);
    setName("");
    setPassword("");
    setConfirmPassword("");
    setReferralCode("");
    setGeneratedDemoOtp("");
    setIsTimerActive(false);
    if (newMode === "register") {
      navigate("/register", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  // Helper for OTP inputs auto-focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-move to next input
    if (value && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // REGISTRATION HANDLERS
  // ==========================================
  const handleRegisterSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios({
        url: SummaryApi.sendOtp.url,
        method: SummaryApi.sendOtp.method,
        data: { mobile, type: "register" }
      });

      if (res.data?.success) {
        toast.success(res.data.message || "OTP sent successfully!");
        if (res.data.otp) {
          setGeneratedDemoOtp(res.data.otp);
          // Auto fill demo OTP for smooth user testing
          const digits = res.data.otp.toString().split("");
          setOtp([digits[0] || "", digits[1] || "", digits[2] || "", digits[3] || ""]);
        }
        setRegStep(2);
        setTimer(271);
        setIsTimerActive(true);
      } else {
        toast.error(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please check mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      toast.error("Please enter complete 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios({
        url: SummaryApi.verifyOtp.url,
        method: SummaryApi.verifyOtp.method,
        data: { mobile, otp: otpCode }
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Mobile verified successfully!");
        setRegStep(3);
      } else {
        toast.error(res.data?.message || "Invalid OTP code.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCreateAccount = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!password || password.length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios({
        url: SummaryApi.creatUser.url,
        method: SummaryApi.creatUser.method,
        data: {
          name: name.trim(),
          mobile,
          password,
          referralCode: referralCode.trim()
        }
      });

      if (res.data?.success) {
        toast.success("Account Created Successfully! Welcome 🎉");
        if (res.data.token) localStorage.setItem("token", res.data.token);
        if (res.data.user) localStorage.setItem("user_data", JSON.stringify(res.data.user));

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(res.data?.message || "Failed to create account.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Mobile may already exist.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIN HANDLERS
  // ==========================================
  const handleLoginContinue = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (loginMethod === "otp") {
      setLoading(true);
      try {
        const res = await Axios({
          url: SummaryApi.sendOtp.url,
          method: SummaryApi.sendOtp.method,
          data: { mobile, type: "login" }
        });
        if (res.data?.success) {
          toast.success(res.data.message || "OTP sent for login!");
          if (res.data.otp) {
            setGeneratedDemoOtp(res.data.otp);
            const digits = res.data.otp.toString().split("");
            setOtp([digits[0] || "", digits[1] || "", digits[2] || "", digits[3] || ""]);
          }
          setLoginStep(2);
          setTimer(271);
          setIsTimerActive(true);
        } else {
          toast.error(res.data?.message || "Mobile number not found.");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send OTP. Please check mobile.");
      } finally {
        setLoading(false);
      }
    } else {
      // Password method -> proceed to step 2 password entry
      setLoginStep(2);
    }
  };

  const handleLoginPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios({
        url: SummaryApi.loginUser.url,
        method: SummaryApi.loginUser.method,
        data: { mobile, password }
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Login Successful! 🎉");
        if (res.data.token) localStorage.setItem("token", res.data.token);
        if (res.data.user) localStorage.setItem("user_data", JSON.stringify(res.data.user));

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(res.data?.message || "Invalid credentials.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Incorrect password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      toast.error("Please enter complete 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios({
        url: SummaryApi.loginOtp.url,
        method: SummaryApi.loginOtp.method,
        data: { mobile, otp: otpCode }
      });

      if (res.data?.success) {
        toast.success("Login Successful! 🎉");
        if (res.data.token) localStorage.setItem("token", res.data.token);
        if (res.data.user) localStorage.setItem("user_data", JSON.stringify(res.data.user));

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(res.data?.message || "Invalid OTP code.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />

      {/* TOP LOGO & HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#ff6600] tracking-tight flex items-center justify-center gap-1.5 drop-shadow-xs">
          <span>Royal777</span>
        </h1>
        <p className="text-xs font-semibold text-gray-500 mt-0.5 tracking-wide">
          Premium Betting Platform
        </p>
      </div>

      {/* CENTER CARD CONTAINER */}
      <div className="w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 transition-all">
        
        {/* ORANGE CIRCULAR TOP ICON */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-[#ff6600] text-white flex items-center justify-center shadow-md shadow-orange-500/20 text-xl">
            <FaUserAlt />
          </div>
        </div>

        {/* STEP INDICATOR DOTS */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {mode === "register" ? (
            <>
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${regStep === 1 ? "bg-[#ff6600] scale-110" : "bg-gray-200"}`} />
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${regStep === 2 ? "bg-[#ff6600] scale-110" : "bg-gray-200"}`} />
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${regStep === 3 ? "bg-[#ff6600] scale-110" : "bg-gray-200"}`} />
            </>
          ) : (
            <>
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${loginStep === 1 ? "bg-[#ff6600] scale-110" : "bg-gray-200"}`} />
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${loginStep === 2 ? "bg-[#ff6600] scale-110" : "bg-gray-200"}`} />
            </>
          )}
        </div>

        {/* ========================================================= */}
        {/* REGISTRATION FLOW                                         */}
        {/* ========================================================= */}
        {mode === "register" && (
          <>
            {/* STEP 1: MOBILE NUMBER INPUT */}
            {regStep === 1 && (
              <form onSubmit={handleRegisterSendOtp} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Enter Mobile Number</h2>
                  <p className="text-xs text-gray-500 mt-1">We'll send you an OTP to verify</p>
                </div>

                <div className="relative">
                  <div className="flex items-center border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-3 transition-colors bg-white">
                    <FaPhoneAlt className="text-gray-400 text-sm mr-2 shrink-0" />
                    <span className="text-gray-600 font-bold text-sm mr-2 shrink-0">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="Mobile Number"
                      className="w-full bg-transparent text-gray-900 font-semibold text-sm outline-none placeholder-gray-400"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6600] hover:bg-[#e65c00] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{loading ? "Sending..." : "Send OTP"}</span>
                  <FaArrowRight size={12} />
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {regStep === 2 && (
              <form onSubmit={handleRegisterVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 4-digit code sent to <br />
                    <span className="font-bold text-gray-800">+91 {mobile}</span>
                  </p>
                  {generatedDemoOtp && (
                    <span className="inline-block mt-2 bg-orange-50 text-[#ff6600] text-[11px] font-bold px-3 py-1 rounded-full border border-orange-200">
                      Demo OTP: {generatedDemoOtp}
                    </span>
                  )}
                </div>

                {/* 4 OTP BOXES */}
                <div className="flex items-center justify-center gap-3 py-1">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-14 text-center text-xl font-extrabold text-gray-900 border-2 border-gray-200 focus:border-[#ff6600] rounded-xl outline-none transition-colors bg-white shadow-2xs"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* RESEND TIMER */}
                <div className="text-center">
                  {isTimerActive ? (
                    <p className="text-xs text-gray-400 font-medium">
                      Resend OTP in <span className="text-gray-600 font-bold">{formatTimer(timer)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterSendOtp}
                      className="text-xs font-bold text-[#ff6600] hover:underline cursor-pointer"
                    >
                      Resend OTP Now
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6600] hover:bg-[#e65c00] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{loading ? "Verifying..." : "Verify OTP"}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <FaArrowLeft size={10} />
                    <span>Change Number</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CREATE ACCOUNT */}
            {regStep === 3 && (
              <form onSubmit={handleRegisterCreateAccount} className="space-y-3.5">
                {/* GREEN SUCCESS BANNER */}
                <div className="bg-[#eefbf3] border border-[#bdf0d0] text-[#16a34a] rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs font-semibold">
                  <FaCheckCircle className="text-sm shrink-0" />
                  <span>Mobile verified successfully!</span>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Setup for +91 {mobile}</p>
                </div>

                {/* FULL NAME */}
                <div className="border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-2.5 flex items-center bg-white">
                  <FaUserAlt className="text-gray-400 text-sm mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-transparent text-gray-900 font-semibold text-sm outline-none placeholder-gray-400"
                    required
                    autoFocus
                  />
                </div>

                {/* PASSWORD */}
                <div className="border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-2.5 flex items-center bg-white relative">
                  <FaLock className="text-gray-400 text-sm mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create Password"
                    className="w-full bg-transparent text-gray-900 font-semibold text-sm outline-none placeholder-gray-400 pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-2.5 flex items-center bg-white relative">
                  <FaKey className="text-gray-400 text-sm mr-2.5 shrink-0" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-transparent text-gray-900 font-semibold text-sm outline-none placeholder-gray-400 pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                {/* REFERRAL CODE (OPTIONAL) */}
                <div className="border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-2.5 flex items-center bg-white">
                  <FaShareAlt className="text-gray-400 text-sm mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="REFERRAL CODE (OPTIONAL)"
                    className="w-full bg-transparent text-gray-900 font-semibold text-xs tracking-wider outline-none placeholder-gray-400 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6600] hover:bg-[#e65c00] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  <span>{loading ? "Creating..." : "Create Account"}</span>
                  <FaArrowRight size={12} />
                </button>
              </form>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* LOGIN FLOW                                                */}
        {/* ========================================================= */}
        {mode === "login" && (
          <>
            {/* STEP 1: ENTER MOBILE & CHOOSE METHOD */}
            {loginStep === 1 && (
              <form onSubmit={handleLoginContinue} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">User Login</h2>
                  <p className="text-xs text-gray-500 mt-1">Enter mobile number to continue</p>
                </div>

                {/* MOBILE NUMBER INPUT */}
                <div className="border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-3 flex items-center bg-white">
                  <FaPhoneAlt className="text-gray-400 text-sm mr-2 shrink-0" />
                  <span className="text-gray-600 font-bold text-sm mr-2 shrink-0">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="Mobile Number"
                    className="w-full bg-transparent text-gray-900 font-semibold text-sm outline-none placeholder-gray-400"
                    autoFocus
                    required
                  />
                </div>

                {/* LOGIN METHOD SELECTOR TABS */}
                <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("password")}
                    className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                      loginMethod === "password"
                        ? "bg-white text-[#ff6600] shadow-2xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    🔑 Password Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("otp")}
                    className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                      loginMethod === "otp"
                        ? "bg-white text-[#ff6600] shadow-2xs"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    📲 OTP Login
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6600] hover:bg-[#e65c00] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{loading ? "Processing..." : loginMethod === "otp" ? "Send OTP →" : "Continue →"}</span>
                </button>
              </form>
            )}

            {/* STEP 2A: LOGIN WITH PASSWORD */}
            {loginStep === 2 && loginMethod === "password" && (
              <form onSubmit={handleLoginPasswordSubmit} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Enter Password</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Login for <span className="font-bold text-gray-800">+91 {mobile}</span>
                  </p>
                </div>

                <div className="border-2 border-gray-200 focus-within:border-[#ff6600] rounded-xl px-3.5 py-3 flex items-center bg-white relative">
                  <FaLock className="text-gray-400 text-sm mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-transparent text-gray-900 font-semibold text-sm outline-none placeholder-gray-400 pr-8"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6600] hover:bg-[#e65c00] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{loading ? "Logging in..." : "Login Account"}</span>
                  <FaArrowRight size={12} />
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("otp");
                      handleLoginContinue({ preventDefault: () => {} });
                    }}
                    className="text-[#ff6600] font-bold hover:underline cursor-pointer"
                  >
                    Login via OTP instead
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginStep(1)}
                    className="text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    ← Change Number
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2B: LOGIN WITH OTP */}
            {loginStep === 2 && loginMethod === "otp" && (
              <form onSubmit={handleLoginOtpSubmit} className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Verify OTP Login</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter code sent to <span className="font-bold text-gray-800">+91 {mobile}</span>
                  </p>
                  {generatedDemoOtp && (
                    <span className="inline-block mt-2 bg-orange-50 text-[#ff6600] text-[11px] font-bold px-3 py-1 rounded-full border border-orange-200">
                      Demo OTP: {generatedDemoOtp}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3 py-1">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 sm:w-14 sm:h-14 text-center text-xl font-extrabold text-gray-900 border-2 border-gray-200 focus:border-[#ff6600] rounded-xl outline-none transition-colors bg-white shadow-2xs"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="text-center">
                  {isTimerActive ? (
                    <p className="text-xs text-gray-400 font-medium">
                      Resend OTP in <span className="text-gray-600 font-bold">{formatTimer(timer)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLoginContinue}
                      className="text-xs font-bold text-[#ff6600] hover:underline cursor-pointer"
                    >
                      Resend OTP Now
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff6600] hover:bg-[#e65c00] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{loading ? "Verifying..." : "Verify & Login"}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("password")}
                    className="text-[#ff6600] font-bold hover:underline cursor-pointer"
                  >
                    Login via Password instead
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginStep(1)}
                    className="text-gray-500 hover:text-gray-800 cursor-pointer"
                  >
                    ← Change Number
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* BOTTOM SWITCHER LINK */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          {mode === "register" ? (
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-bold text-[#ff6600] hover:underline cursor-pointer"
              >
                Login Here
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-bold text-[#ff6600] hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>

      {/* FOOTER TERMS */}
      <div className="mt-6 text-center text-[11px] text-gray-400 font-medium">
        By continuing, you agree to our <a href="#" className="underline hover:text-gray-600">Terms & Conditions</a>
      </div>
    </div>
  );
};

export default UserAuth;
