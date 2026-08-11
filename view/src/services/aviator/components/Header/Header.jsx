import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaArrowLeft } from "react-icons/fa";
import { useAviatorStore } from "../../store/aviatorStore";
import aviatorLogo from "../../../../assets/icons/26b2b24a-dab8-4c71-b0cf-7264241e172e.svg";

export const Header = () => {
  const navigate = useNavigate();
  const { balance, currency } = useAviatorStore();

  return (
    <header className="relative z-40 shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-black border-b border-gray-800">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer active:scale-95 border border-white/15"
            title="Go Back"
          >
            <FaArrowLeft size={13} />
          </button>
          <img src={aviatorLogo} alt="Aviator Logo" className="h-7 sm:h-8 object-contain" />
        </div>

        <div className="text-[#4ade80] font-black text-base sm:text-lg">
          {Number(balance || 0).toFixed(2)} {currency || 'INR'}
        </div>

        <button
          onClick={() => navigate('/casino')}
          className="text-white hover:text-gray-300 transition text-lg cursor-pointer"
        >
          <FaBars />
        </button>
      </div>
    </header>
  );
};

export default Header;
