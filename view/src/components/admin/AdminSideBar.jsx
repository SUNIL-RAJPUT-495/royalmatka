import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaUserShield, FaTrophy, FaStar, FaDice, FaCrown, FaMoneyBillWave,
    FaHandHoldingUsd, FaUsersCog, FaLightbulb, FaUserTimes, FaFileAlt,
    FaComments, FaBell, FaPalette, FaPhoneAlt, FaQuestionCircle,
    FaCreditCard, FaChartPie, FaGift, FaQrcode, FaCheckCircle, FaPercent
} from "react-icons/fa";
import { 
    MdDashboard, MdGames, MdScoreboard, MdHistory, MdPersonRemove, 
    MdNotificationsActive, MdAnnouncement, MdOutlineWindow 
} from "react-icons/md";
import { GiBackwardTime, GiDiceSixFacesThree, GiFireGem, GiCardPick } from "react-icons/gi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { IoBagHandle } from "react-icons/io5";
import { TbMoneybag, TbReportAnalytics } from "react-icons/tb";
import { RiCoupon3Line, RiAdminLine } from "react-icons/ri";

export const AdminSideBar = ({ closeSidebar }) => {
    const menuSections = [
        {
            heading: "Main Menu",
            items: [
                { icons: MdDashboard, itemsDetails: "Dashboard", link: "dashboard" },
            ]
        },
        {
            heading: "Game Management",
            items: [
                { icons: MdGames, itemsDetails: "Add Game", link: "AddGame" },
                { icons: GiBackwardTime, itemsDetails: "Bids", link: "AdminBid" },
                { icons: FaTrophy, itemsDetails: "Matka Results", link: "matka-results" },
                { icons: FaCheckCircle, itemsDetails: "Declare Results", link: "ResultDecleare" },
                { icons: FaPercent, itemsDetails: "Game Rates", link: "game-rates" },
            ]
        },
        // {
        //     heading: "Starline Games",
        //     items: [
        //         { icons: FaStar, itemsDetails: "Starline Game", link: "starline-game" },
        //         { icons: MdScoreboard, itemsDetails: "Starline Results", link: "starline-results" },
        //         { icons: GiDiceSixFacesThree, itemsDetails: "Starline Bids", link: "starline-bids" },
        //     ]
        // },
        // {
        //     heading: "Jackpot Games",
        //     items: [
        //         { icons: FaDice, itemsDetails: "Jackpot Game", link: "jackpot-game" },
        //         { icons: FaCrown, itemsDetails: "Jackpot Results", link: "jackpot-results" },
        //         { icons: GiCardPick, itemsDetails: "Jackpot Bids", link: "jackpot-bids" },
        //     ]
        // },
        {
            heading: "Jackpot Gali",
            items: [
                { icons: GiFireGem, itemsDetails: "Jackpot Gali", link: "jackpot-gali" },
                { icons: MdScoreboard, itemsDetails: "Jackpot Gali Results", link: "jackpot-gali-results" },
                { icons: RiCoupon3Line, itemsDetails: "Jackpot Gali Bids", link: "jackpot-gali-bids" },
            ]
        },
        {
            heading: "Financial Management",
            items: [
                { icons: FaCreditCard, itemsDetails: "Payments", link: "Payment" },
                { icons: BiMoneyWithdraw, itemsDetails: "Withdrawals", link: "Withdraw" },
                { icons: FaMoneyBillWave, itemsDetails: "All Withdrawals", link: "all-withdrawals" },
                { icons: FaHandHoldingUsd, itemsDetails: "Commission", link: "commission" },
                { icons: IoBagHandle, itemsDetails: "Referrals", link: "referal" },
                { icons: FaChartPie, itemsDetails: "Bonus Management", link: "bonus" },
            ]
        },
        {
            heading: "User Management",
            items: [
                { icons: FaUsersCog, itemsDetails: "User Management", link: "users" },
                { icons: FaTrophy, itemsDetails: "Winners History", link: "WinnersHistory" },
                { icons: FaLightbulb, itemsDetails: "Tips Panel", link: "tips-panel" },
                { icons: FaUserTimes, itemsDetails: "Delete Requests", link: "delete-requests" },
            ]
        },
        {
            heading: "Reports & History",
            items: [
                { icons: TbReportAnalytics, itemsDetails: "Reports / History", link: "reports-history" },
            ]
        },
        {
            heading: "Communication",
            items: [
                { icons: FaComments, itemsDetails: "Chat Messages", link: "admin-chat" },
                { icons: FaBell, itemsDetails: "Notifications", link: "NotificationSender" },
                { icons: MdNotificationsActive, itemsDetails: "Notification Settings", link: "notification-settings" },
            ]
        },
        {
            heading: "Settings & Configuration",
            items: [
                { icons: FaQrcode, itemsDetails: "UPI Settings", link: "upi" },
                { icons: FaPalette, itemsDetails: "Appearance / Theme", link: "theme-settings" },
                { icons: FaPhoneAlt, itemsDetails: "Contact Settings", link: "contact" },
                { icons: FaQuestionCircle, itemsDetails: "How To Play", link: "how-to-play" },
                { icons: MdAnnouncement, itemsDetails: "Welcome Popup", link: "welcome-popup" },
            ]
        },
        {
            heading: "Access Control",
            items: [
                { icons: RiAdminLine, itemsDetails: "Admins & Access", link: "admin-access" },
            ]
        },
    ];

    return (
        // Main Sidebar Background
        <div className='h-screen w-64 md:w-72 bg-black flex flex-col shadow-2xl transition-all duration-300'>

            {/* Logo Section */}
            <div className='px-6 py-6 flex items-center gap-3 border-b border-white/10 shrink-0'>
                <div className='bg-[#ef4444] p-2 rounded-xl shadow-lg text-white'>
                    <FaUserShield size={22} />
                </div>
                <div>
                    <h2 className='text-lg font-black text-white tracking-wider leading-none'>
                        ROYAL<span className="text-[#ef4444]">1008</span>
                    </h2>
                    <span className='text-[10px] font-bold text-gray-400 tracking-widest uppercase'>Control Panel</span>
                </div>
            </div>

            {/* Menu Items Section */}
            <div className='flex-1 overflow-y-auto py-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6">
                        {/* Section Heading */}
                        <h3 className="px-4 mb-2 text-[11px] font-black text-white/50 uppercase tracking-[2px]">
                            {section.heading}
                        </h3>

                        {/* Section Links */}
                        <div className="space-y-1">
                            {section.items.map((item, itemIndex) => (
                                <NavLink
                                    key={itemIndex}
                                    to={item.link}
                                    onClick={closeSidebar}
                                    className={({ isActive }) => `
                                        group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-white text-[#31004A] shadow-lg shadow-black/20 font-bold'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white font-medium'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icons
                                                size={18}
                                                className={`shrink-0 transition-colors ${isActive ? 'text-[#31004A]' : 'text-white/60 group-hover:text-white'}`}
                                            />
                                            <span className={`text-xs md:text-sm tracking-wide truncate ${isActive ? 'text-[#31004A]' : ''}`}>
                                                {item.itemsDetails}
                                            </span>
                                            {isActive && (
                                                <div className="ml-auto w-1.5 h-1.5 bg-[#31004A] rounded-full animate-pulse shrink-0"></div>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Logout Placeholder */}
            <div className="p-4 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-3 p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/5 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#31004A] text-xs font-black">
                        A
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-white truncate">System Admin</p>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
};