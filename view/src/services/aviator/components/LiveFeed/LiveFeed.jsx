import React, { useState } from "react";
import { FaUserCircle, FaTrophy, FaGamepad, FaHistory } from "react-icons/fa";
import { useAviatorStore } from "../../store/aviatorStore";

export const LiveFeed = () => {
    const { liveBets, myBetsHistory, isUSD } = useAviatorStore();
    const [activeTab, setActiveTab] = useState("all");

    const staticTopWins = isUSD
        ? [
            { username: "a***8", amount: 5.0, multiplier: 142.55, won: 712.75, date: "Today" },
            { username: "k***9", amount: 10.0, multiplier: 88.2, won: 882.0, date: "Today" },
            { username: "r***d", amount: 2.0, multiplier: 52.4, won: 104.8, date: "Yesterday" },
            { username: "j***s", amount: 20.0, multiplier: 34.15, won: 683.0, date: "Yesterday" },
            { username: "a***9", amount: 5.0, multiplier: 29.8, won: 149.0, date: "Yesterday" },
            { username: "n***s", amount: 1.0, multiplier: 22.1, won: 22.1, date: "2 days ago" },
        ]
        : [
            { username: "a***8", amount: 500, multiplier: 142.55, won: 71275, date: "Today" },
            { username: "k***9", amount: 1000, multiplier: 88.2, won: 88200, date: "Today" },
            { username: "r***d", amount: 200, multiplier: 52.4, won: 10480, date: "Yesterday" },
            { username: "j***s", amount: 2000, multiplier: 34.15, won: 68300, date: "Yesterday" },
            { username: "a***9", amount: 500, multiplier: 29.8, won: 14900, date: "Yesterday" },
            { username: "n***s", amount: 100, multiplier: 22.1, won: 2210, date: "2 days ago" },
        ];

    const formatCurrency = (amt, isIntegerOnly = false) => {
        if (isUSD) return `$${parseFloat(amt).toFixed(2)}`;
        return `₹${isIntegerOnly ? Math.round(amt) : parseFloat(amt).toFixed(0)}`;
    };

    const totalBetsCount = liveBets.length;
    const totalBetsVolume = liveBets.reduce((acc, b) => acc + b.amount, 0);

    return (
        <div className="flex h-full flex-col overflow-hidden  select-none">
            <div className="flex shrink-0 gap-1 border-b border-white/10 bg-[#0c1017] p-1">
                {[
                    { key: "all", label: "All Bets", icon: FaGamepad },
                    { key: "my", label: "My Bets", icon: FaHistory },
                    { key: "top", label: "Top Wins", icon: FaTrophy },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-extrabold transition ${activeTab === key ? "border border-white/10 bg-[#1a1f2b] text-white" : "text-[#9A9A9A] hover:text-gray-200"}`}
                    >
                        <Icon className={key === "top" ? "text-amber-500" : "text-red-600"} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {activeTab === "all" && (
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#121722] px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#9A9A9A]">
                    <span>All bets: <strong className="text-white">{totalBetsCount}</strong></span>
                    <span>Total bet: <strong className="font-mono text-[#2cba47]">{formatCurrency(totalBetsVolume)}</strong></span>
                </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto bg-[#0f131a] p-1.5">
                {activeTab === "all" && (
                    <>
                        {liveBets.length === 0 ? (
                            <div className="py-10 text-center text-[10px] font-bold text-gray-500">Waiting for bets...</div>
                        ) : (
                            liveBets.map((player) => (
                                <div
                                    key={player.id}
                                    className={`mb-1 flex items-center justify-between rounded-[12px] border px-2.5 py-1.5 text-[10px] transition ${player.isCashedOut ? "border-green-500/20 bg-[rgba(44,186,71,0.08)] text-white" : player.isLost ? "border-transparent bg-transparent text-gray-600" : "border-transparent bg-[#171b24] text-gray-400"}`}
                                >
                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <FaUserCircle className="shrink-0 text-gray-600" />
                                        <span className="truncate font-bold text-gray-300">{player.username}</span>
                                    </div>
                                    <div className="w-1/4 text-center font-mono font-bold text-gray-400">{formatCurrency(player.amount, true)}</div>
                                    <div className="w-1/5 text-center font-mono font-bold">
                                        {player.isCashedOut ? <span className="rounded border border-[#482878] bg-[#2f1b4c] px-1 text-[9px] text-[#913df3]">{player.cashOutMultiplier?.toFixed(2)}x</span> : <span className="text-gray-700">-</span>}
                                    </div>
                                    <div className="w-1/4 text-right font-mono font-extrabold">
                                        {player.isCashedOut ? <span className="text-[#2cba47]">{formatCurrency(player.wonAmount)}</span> : player.isLost ? <span className="text-[9px] text-red-700">Crashed</span> : <span className="text-gray-700">-</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === "my" && (
                    <>
                        {myBetsHistory.length === 0 ? (
                            <div className="py-10 text-center text-[10px] font-bold text-gray-500">No bets logged in this session.</div>
                        ) : (
                            myBetsHistory.map((bet) => (
                                <div key={bet.id} className={`mb-1 flex items-center justify-between rounded-[12px] border px-2.5 py-1.5 text-[10px] ${bet.status === "win" ? "border-green-500/20 bg-[rgba(44,186,71,0.08)] text-white" : "border-transparent bg-[#171b24] text-gray-500"}`}>
                                    <div className="w-1/4 text-[9px] font-bold text-gray-500">{bet.timestamp}</div>
                                    <div className="w-1/4 text-center font-mono font-bold text-gray-300">{formatCurrency(bet.amount, true)}</div>
                                    <div className="w-1/4 text-center font-mono font-bold">
                                        {bet.status === "win" ? <span className="rounded border border-[#482878] bg-[#2f1b4c] px-1 text-[9px] text-[#913df3]">{bet.cashOutMultiplier?.toFixed(2)}x</span> : <span className="text-red-600/50">Crashed</span>}
                                    </div>
                                    <div className="w-1/4 text-right font-mono font-black">
                                        {bet.status === "win" ? <span className="text-[#2cba47]">{formatCurrency(bet.wonAmount)}</span> : <span className="text-gray-700">$0.00</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === "top" && (
                    <div className="space-y-1">
                        {staticTopWins.map((win, idx) => (
                            <div key={`${win.username}-${idx}`} className="flex items-center justify-between rounded-[12px] border border-transparent bg-[#171b24] px-2.5 py-1.5 text-[10px] text-gray-300 transition hover:border-white/10">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-black ${idx === 0 ? "bg-amber-500 text-[#141414]" : idx === 1 ? "bg-slate-300 text-[#141414]" : idx === 2 ? "bg-[#913df3] text-[#141414]" : "bg-[#2C2C2C] text-gray-400"}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="truncate font-bold">{win.username}</span>
                                </div>
                                <div className="w-1/4 text-center font-mono text-[9px] font-bold text-gray-500">{formatCurrency(win.amount, true)}</div>
                                <div className="w-1/5 text-center font-mono font-black"><span className="rounded border border-[#78234f] bg-[#4d1933] px-1 text-[9px] text-[#e53b92]">{win.multiplier.toFixed(2)}x</span></div>
                                <div className="w-1/4 text-right font-mono font-extrabold text-[#2cba47]">{formatCurrency(win.won)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveFeed;
