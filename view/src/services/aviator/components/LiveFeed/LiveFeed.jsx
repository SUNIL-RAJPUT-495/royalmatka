import React, { useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { useAviatorStore } from "../../store/aviatorStore";

export const LiveFeed = () => {
    const { liveBets, myBetsHistory, isUSD } = useAviatorStore();
    const [activeTab, setActiveTab] = useState("all"); // "all", "previous", "top"
    const [topSubFilter, setTopSubFilter] = useState("huge"); // huge, biggest, multiplier
    const [topTimeFilter, setTopTimeFilter] = useState("day"); // day, month, year

    const staticTopWins = isUSD
        ? [
            { username: "d***8", amount: 5.0, multiplier: 142.55, won: 712.75, date: "Today" },
            { username: "d***1", amount: 10.0, multiplier: 88.2, won: 882.0, date: "Today" },
            { username: "d***9", amount: 2.0, multiplier: 52.4, won: 104.8, date: "Yesterday" },
            { username: "d***2", amount: 20.0, multiplier: 34.15, won: 683.0, date: "Yesterday" },
            { username: "d***6", amount: 5.0, multiplier: 29.8, won: 149.0, date: "Yesterday" },
            { username: "d***7", amount: 1.0, multiplier: 22.1, won: 22.1, date: "2 days ago" },
        ]
        : [
            { username: "d***8", amount: 500, multiplier: 142.55, won: 71275, date: "Today" },
            { username: "d***1", amount: 1000, multiplier: 88.2, won: 88200, date: "Today" },
            { username: "d***9", amount: 200, multiplier: 52.4, won: 10480, date: "Yesterday" },
            { username: "d***2", amount: 2000, multiplier: 34.15, won: 68300, date: "Yesterday" },
            { username: "d***6", amount: 500, multiplier: 29.8, won: 14900, date: "Yesterday" },
            { username: "d***7", amount: 100, multiplier: 22.1, won: 2210, date: "2 days ago" },
        ];

    const currencyLabel = isUSD ? "USD" : "INR";
    const totalBetsCount = liveBets.length || 371;
    const totalMaxBets = 377;
    const totalWinSum = liveBets.reduce((acc, b) => acc + (b.wonAmount || 0), 0);

    const formatAmount = (amt) => {
        if (!amt && amt !== 0) return "0.00";
        return parseFloat(amt).toFixed(2);
    };

    // User avatar presets matching official Spribe
    const avatarGradients = [
        "from-emerald-500 to-teal-700",
        "from-purple-500 to-indigo-700",
        "from-rose-500 to-pink-700",
        "from-amber-500 to-orange-700",
        "from-cyan-500 to-blue-700"
    ];

    return (
        <div className="flex h-full flex-col bg-[#10131c] text-white select-none rounded-2xl border border-[#1b202d] overflow-hidden font-sans shadow-2xl">
            
            {/* 1. TOP TABS: All Bets | Previous | Top */}
            <div className="p-2 bg-[#0c0e15] border-b border-[#1b202d]">
                <div className="flex items-center justify-between bg-[#151924] p-1 rounded-full border border-white/5">
                    {[
                        { key: "all", label: "All Bets" },
                        { key: "previous", label: "Previous" },
                        { key: "top", label: "Top" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex-1 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                                activeTab === key
                                    ? "bg-[#2c3242] text-white shadow-sm font-bold"
                                    : "text-gray-400 hover:text-gray-200 font-semibold"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. HEADER INFO SUMMARY SECTION */}
            {activeTab === "all" && (
                <div className="px-3.5 py-2 bg-[#121622] border-b border-[#1b202d] flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                            <div className="flex -space-x-1.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#121622]" />
                                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-[#121622]" />
                                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-[#121622]" />
                            </div>
                            <span className="text-sm font-black text-white ml-1">
                                {totalBetsCount}/{totalMaxBets}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">Bets</span>
                        </div>
                        <div className="w-16 h-0.5 bg-emerald-500 rounded-full" />
                    </div>

                    <div className="text-right">
                        <div className="text-sm font-black text-white font-mono leading-none">
                            {formatAmount(totalWinSum)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                            Total win {currencyLabel}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "previous" && (
                <div className="px-3.5 py-2 bg-[#121622] border-b border-[#1b202d] flex items-center justify-between text-xs text-gray-400 font-semibold">
                    <span>MY BETS HISTORY</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                        <FaShieldAlt size={10} /> Provably Fair
                    </span>
                </div>
            )}

            {activeTab === "top" && (
                <div className="bg-[#121622] border-b border-[#1b202d] p-2 space-y-1.5">
                    <div className="flex items-center justify-between bg-[#0a0d13] p-0.5 rounded-lg text-[10px] font-bold">
                        {[
                            { id: "huge", label: "HUGE WINS" },
                            { id: "biggest", label: "BIGGEST WINS" },
                            { id: "multiplier", label: "MULTIPLIERS" },
                        ].map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setTopSubFilter(sub.id)}
                                className={`flex-1 py-1 rounded-md transition-all ${
                                    topSubFilter === sub.id ? "bg-[#2c3242] text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold">
                        {[
                            { id: "day", label: "DAY" },
                            { id: "month", label: "MONTH" },
                            { id: "year", label: "YEAR" },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTopTimeFilter(t.id)}
                                className={`px-3 py-0.5 rounded-full transition-all ${
                                    topTimeFilter === t.id ? "bg-[#e53b92] text-white" : "bg-[#181e2b] text-gray-400"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. TABLE COLUMN HEADERS */}
            <div className="px-3 py-1.5 bg-[#0e1118] border-b border-[#1b202d] flex items-center justify-between text-[10px] font-medium text-gray-400">
                <div className="w-[32%]">Player</div>
                <div className="w-[22%] text-center">Bet {currencyLabel}</div>
                <div className="w-[20%] text-center">X</div>
                <div className="w-[26%] text-right">Win {currencyLabel}</div>
            </div>

            {/* 4. BET ROWS CONTAINER */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 bg-[#0b0e14]">
                {activeTab === "all" && (
                    liveBets.map((player, idx) => {
                        const gradient = avatarGradients[idx % avatarGradients.length];
                        return (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                                    player.isCashedOut
                                        ? "bg-[#13271f] border border-emerald-500/30 text-white"
                                        : "bg-[#141822] border border-transparent text-gray-300"
                                }`}
                            >
                                {/* Player Name & Avatar */}
                                <div className="flex items-center gap-2 w-[32%] min-w-0">
                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-[9px] font-bold text-white shrink-0 uppercase shadow-2xs`}>
                                        {player.username ? player.username[0] : 'd'}
                                    </div>
                                    <span className="truncate font-semibold text-[#9ea7b8] text-xs">
                                        {player.username}
                                    </span>
                                </div>

                                {/* Bet Amount */}
                                <div className="w-[22%] text-center font-mono text-gray-300 font-semibold text-xs">
                                    {formatAmount(player.amount)}
                                </div>

                                {/* Multiplier Pill Badge */}
                                <div className="w-[20%] text-center flex justify-center">
                                    {player.isCashedOut ? (
                                        <span className="bg-[#2b1747] border border-[#a825e6] text-[#e06bf7] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                                            {player.cashOutMultiplier?.toFixed(2)}x
                                        </span>
                                    ) : (
                                        <span className="text-gray-600">-</span>
                                    )}
                                </div>

                                {/* Win Amount */}
                                <div className="w-[26%] text-right font-mono font-bold text-xs">
                                    {player.isCashedOut ? (
                                        <span className="text-[#00e676]">{formatAmount(player.wonAmount)}</span>
                                    ) : (
                                        <span className="text-gray-600">-</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {activeTab === "previous" && (
                    myBetsHistory.length === 0 ? (
                        <div className="py-12 text-center text-xs font-semibold text-gray-500">No bets recorded yet.</div>
                    ) : (
                        myBetsHistory.map((bet) => (
                            <div
                                key={bet.id}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs ${
                                    bet.status === "win" || bet.wonAmount > 0
                                        ? "bg-[#13271f] border border-emerald-500/30 text-white"
                                        : "bg-[#141822] border border-transparent text-gray-400"
                                }`}
                            >
                                <div className="w-[32%] text-gray-400 font-semibold text-[11px]">
                                    {bet.timestamp}
                                </div>
                                <div className="w-[22%] text-center font-mono font-semibold text-gray-300 text-xs">
                                    {formatAmount(bet.amount)}
                                </div>
                                <div className="w-[20%] text-center flex justify-center">
                                    {bet.cashOutMultiplier ? (
                                        <span className="bg-[#2b1747] border border-[#a825e6] text-[#e06bf7] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                                            {bet.cashOutMultiplier?.toFixed(2)}x
                                        </span>
                                    ) : (
                                        <span className="text-rose-500/70 text-[10px]">Crashed</span>
                                    )}
                                </div>
                                <div className="w-[26%] text-right font-mono font-bold text-xs">
                                    {bet.wonAmount > 0 ? (
                                        <span className="text-[#00e676]">{formatAmount(bet.wonAmount)}</span>
                                    ) : (
                                        <span className="text-gray-600">0.00</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )
                )}

                {activeTab === "top" && (
                    staticTopWins.map((win, idx) => (
                        <div
                            key={`${win.username}-${idx}`}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#141822] border border-transparent text-xs text-gray-300"
                        >
                            <div className="flex items-center gap-2 w-[32%] min-w-0">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                                    idx === 0 ? "bg-amber-400 text-black" : idx === 1 ? "bg-slate-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-gray-700 text-gray-300"
                                }`}>
                                    {idx + 1}
                                </span>
                                <span className="truncate font-semibold text-[#9ea7b8] text-xs">{win.username}</span>
                            </div>

                            <div className="w-[22%] text-center font-mono text-gray-300 font-semibold text-xs">
                                {formatAmount(win.amount)}
                            </div>

                            <div className="w-[20%] text-center flex justify-center">
                                <span className="bg-[#4d1933] border border-[#78234f] text-[#e53b92] px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                                    {win.multiplier.toFixed(2)}x
                                </span>
                            </div>

                            <div className="w-[26%] text-right font-mono font-bold text-xs text-[#00e676]">
                                {formatAmount(win.won)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 5. FOOTER SPRIBE BRANDING */}
            <div className="px-3 py-1.5 bg-[#090b10] border-t border-[#1b202d] flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                <div className="flex items-center gap-1.5 text-gray-400">
                    <FaShieldAlt className="text-emerald-500" size={10} />
                    <span>Provably Fair Game</span>
                </div>
                <div>
                    Powered by <strong className="text-gray-300 font-extrabold tracking-wider">SPRIBE</strong>
                </div>
            </div>
        </div>
    );
};

export default LiveFeed;
