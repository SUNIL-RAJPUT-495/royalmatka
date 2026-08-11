import React from "react";
import BetCard from "../BetCard/BetCard";

export const BetPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto">
      <BetCard index={0} />
      <BetCard index={1} />
    </div>
  );
};

export default BetPanel;
