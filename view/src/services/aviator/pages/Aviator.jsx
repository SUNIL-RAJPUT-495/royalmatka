import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAviatorStore } from "../store/aviatorStore";
import Header from "../components/Header/Header";
import History from "../components/History/History";
import GameArea from "../components/GameArea/GameArea";
import BetPanel from "../components/BetPanel/BetPanel";
import LiveFeed from "../components/LiveFeed/LiveFeed";

const Aviator = () => {
    const { initGameLoop, stopGameLoop } = useAviatorStore();

    useEffect(() => {
        initGameLoop();
        return () => {
            stopGameLoop();
        };
    }, [initGameLoop, stopGameLoop]);

    return (
        <div className="min-h-screen  bg-black   text-white flex flex-col font-sans select-none relative overflow-hidden">
            <div className="absolute inset-0pointer-events-none" />
            <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[70vw] h-[70vw] max-w-[680px] rounded-full blur-[140px] pointer-events-none" />

            <Toaster position="top-right" reverseOrder={false} />
            <Header />

            <main className="relative z-10 flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5 max-w-7xl mx-auto w-full flex flex-col xl:flex-row gap-4 lg:gap-5 min-h-0">
                <section className="w-full xl:w-[340px] shrink-0 order-2 xl:order-1">
                    <div className="h-full rounded-[28px] border border-white/10 bg-[#0f1218]/85 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.34)] p-2.5">
                        <LiveFeed />
                    </div>
                </section>

                <section className="flex-grow flex flex-col gap-3 order-1 xl:order-2 min-w-0">
                    <div className="  ">
                        <History />
                    </div>

                    <div className="border border-white/10 rounded-3xl">
                        <GameArea />
                    </div>

                    <BetPanel />
                </section>
            </main>
        </div>
    );
};

export default Aviator;