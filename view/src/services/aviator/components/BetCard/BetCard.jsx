import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAviatorStore } from "../../store/aviatorStore";

export const BetCard = ({ index }) => {
  const {
    status,
    multiplier,
    balance,
    betCards,
    placeBet,
    cancelBet,
    cashOut,
    updateBetCard,
    isUSD,
  } = useAviatorStore();

  const card = betCards[index];
  const quickAmounts = isUSD ? [1, 2, 5, 10] : [100, 200, 500, 1000];
  const [betAmountInput, setBetAmountInput] = useState(card.amount.toFixed(2));

  useEffect(() => {
    setBetAmountInput(isUSD ? card.amount.toFixed(2) : card.amount.toString());
  }, [card.amount, isUSD]);

  const handleAmountChange = (val) => {
    setBetAmountInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      updateBetCard(index, { amount: Math.min(balance, isUSD ? parseFloat(num.toFixed(2)) : Math.floor(num)) });
    }
  };

  const adjustAmount = (modifier) => {
    let current = card.amount;
    if (modifier === "minus") {
      current = isUSD ? Math.max(0.1, parseFloat((current - 1).toFixed(2))) : Math.max(10, Math.floor(current - 100));
    } else if (modifier === "plus") {
      current = isUSD ? parseFloat((current + 1).toFixed(2)) : Math.floor(current + 100);
    }
    current = Math.min(balance > 0 ? balance : 100000, current);
    updateBetCard(index, { amount: current });
  };

  const handleButtonClick = () => {
    if (card.isCashedOut) return;
    if (card.isPlaced) {
      if (status === "waiting") {
        cancelBet(index);
        toast.error("Bet cancelled");
      } else if (status === "flying") {
        cashOut(index);
        const winVal = (card.amount * multiplier).toFixed(2);
        toast.success(`Won ${isUSD ? "$" : "₹"}${winVal}!`);
      }
    } else if (card.isQueued) {
      cancelBet(index);
      toast.error("Cancelled");
    } else {
      const err = placeBet(index);
      if (err) {
        toast.error(err);
      } else {
        toast.success("Bet placed!");
      }
    }
  };

  const potentialWinnings = (card.amount * multiplier).toFixed(2);
  const displayAmount = isUSD ? `${card.amount.toFixed(2)} USD` : `${card.amount} INR`;

  return (
    <div className="bg-[#141518] border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xl relative overflow-hidden">
      {/* Left Column: Controls & Presets */}
      <div className="flex flex-col gap-2.5 w-1/2 min-w-[130px]">
        {/* Unified Input Container */}
        <div className="flex items-center justify-between bg-[#000000]/40 rounded-full p-0.5 border border-white/5">
          <button
            onClick={() => adjustAmount("minus")}
            className="w-8 h-8 flex items-center justify-center bg-[#1d2025] hover:bg-[#282c34] active:scale-95 text-[#9ea0a3] hover:text-white rounded-full font-bold text-lg transition-all cursor-pointer select-none"
          >
            −
          </button>
          <input
            type="text"
            value={betAmountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-12 bg-transparent text-white text-center font-black text-base border-none focus:outline-none focus:ring-0 p-0"
          />
          <button
            onClick={() => adjustAmount("plus")}
            className="w-8 h-8 flex items-center justify-center bg-[#1d2025] hover:bg-[#282c34] active:scale-95 text-[#9ea0a3] hover:text-white rounded-full font-bold text-lg transition-all cursor-pointer select-none"
          >
            +
          </button>
        </div>

        {/* 2x2 Grid of Quick presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {quickAmounts.map((amt) => (
            <button
              key={`preset-${amt}`}
              onClick={() => updateBetCard(index, { amount: amt })}
              className="bg-[#1d2025] hover:bg-[#282c34] text-[#9ea0a3] hover:text-white text-xs font-black py-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center"
            >
              {amt}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Action Button */}
      <div className="flex-1 self-stretch flex">
        {card.isCashedOut ? (
          <div className="w-full bg-green-950/20 border border-green-500/20 rounded-2xl flex flex-col items-center justify-center text-center p-2">
            <div className="text-green-500 text-xs font-black tracking-wider uppercase">Cashed Out</div>
            <div className="text-green-400 text-sm font-black mt-0.5">
              {isUSD ? `$${card.wonAmount?.toFixed(2)}` : `₹${card.wonAmount?.toFixed(0)}`}
            </div>
          </div>
        ) : card.isPlaced && status === "flying" ? (
          <button
            onClick={handleButtonClick}
            className="w-full bg-gradient-to-b from-[#d59900] to-[#f4b500] hover:from-[#c28b00] hover:to-[#e0a600] active:scale-[0.98] text-white font-extrabold rounded-2xl flex flex-col items-center justify-center cursor-pointer transition shadow-lg py-2 px-3 uppercase"
          >
            <span className="text-xs tracking-wider opacity-90 font-medium">Cash Out</span>
            <span className="text-base font-black leading-snug">{isUSD ? `$${potentialWinnings}` : `₹${potentialWinnings}`}</span>
          </button>
        ) : (
          <button
            onClick={handleButtonClick}
            className={`w-full rounded-2xl flex flex-col items-center justify-center font-extrabold cursor-pointer active:scale-[0.98] transition-all shadow-lg py-2 px-3 uppercase ${
              card.isPlaced
                ? "bg-[#cb011a] hover:bg-[#b00114] text-white"
                : card.isQueued
                ? "bg-[#58595a] hover:bg-[#48494a] text-white"
                : "bg-[#2cba00] hover:bg-[#249e00] text-white"
            }`}
          >
            <span className="text-lg leading-tight font-black">
              {card.isPlaced || card.isQueued ? "Cancel" : "Bet"}
            </span>
            <span className="text-xs font-semibold opacity-90 mt-0.5">
              {card.isPlaced ? "Waiting..." : displayAmount}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BetCard;
