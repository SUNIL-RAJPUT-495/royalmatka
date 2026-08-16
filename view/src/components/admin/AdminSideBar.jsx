import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaUserShield, FaTrophy, FaStar, FaDice, FaCrown, FaMoneyBillWave,
    FaHandHoldingUsd, FaUsersCog, FaLightbulb, FaUserTimes, FaFileAlt,
    FaComments, FaBell, FaPalette, FaPhoneAlt, FaQuestionCircle,
    FaCreditCard, FaChartPie, FaQrcode, FaCheckCircle, FaPercent, FaRocket
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
    // Dynamic Admin Name / Username
    const adminName = localStorage.getItem("admin_name") || "Admin User";
    const adminRole = localStorage.getItem("admin_role") || "Super Admin";
    const avatarLetter = (adminName || "A").charAt(0).toUpperCase();

    let adminPermissions = [];
    try {
        adminPermissions = JSON.parse(localStorage.getItem("admin_permissions") || "[]");
    } catch (e) {
        adminPermissions = [];
    }

    // Full access if Super Admin / Administrator role or All Access permission
    const isFullAccessAdmin = 
        adminRole === "Super Admin" || 
        adminRole === "Administrator" || 
        adminRole === "Pavan" ||
        adminPermissions.includes("All Access");

    // Strict Permission Filter Helper
    const isSectionAllowed = (heading) => {
        if (isFullAccessAdmin) return true;
        if (heading === "Main Menu") return true;

        if (heading === "Game Management" || heading === "Jackpot Gali" || heading === "Casino") {
            return adminPermissions.includes("Game Management") || adminPermissions.includes("Starline") || adminPermissions.includes("Jackpot");
        }
        if (heading === "Financial Management") {
            return adminPermissions.includes("Financial");
        }
        if (heading === "User Management" || heading === "Reports & History") {
            return adminPermissions.includes("User Management");
        }
        if (heading === "Communication") {
            return adminPermissions.includes("Communication");
        }
        if (heading === "Settings & Configuration") {
            return adminPermissions.includes("Settings");
        }
        if (heading === "Access Control") {
            return adminPermissions.includes("Manage Admins");
        }

        return false;
    };

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
                { icons: GiBackwardTime, itemsDetails: "Main Market Bids", link: "main-market-bids" },
               // { icons: FaTrophy, itemsDetails: "Matka Results", link: "matka-results" },
                { icons: FaCheckCircle, itemsDetails: "Declare Results", link: "ResultDecleare" },
                { icons: FaPercent, itemsDetails: "Game Rates", link: "game-rates" },
            ]
        },
        {
            heading: "Casino",
            items: [
                { icons: FaRocket, itemsDetails: "Aviator", link: "aviator" },
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
              //  { icons: FaHandHoldingUsd, itemsDetails: "Commission", link: "commission" },
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
        // Sidebar Container matching dark slate theme
        <div className='h-screen w-64 md:w-72 bg-[#16202c] flex flex-col shadow-2xl transition-all duration-300 border-r border-white/5'>

            {/* Logo Section */}
            

            {/* Dynamic Admin Profile Section */}
            <div className="px-6 py-4 flex items-center gap-3 border-b border-white/5 shrink-0 bg-slate-900/10">
                <div className="w-11 h-11 rounded-full bg-[#ef4444] flex items-center justify-center text-white text-lg font-bold shadow-sm select-none shrink-0">
                    {avatarLetter}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <h4 className="text-xs font-bold text-white tracking-wide truncate">{adminName}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-semibold truncate">{adminRole}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    </div>
                </div>
            </div>

            {/* Menu Items Section */}
            <div className='flex-1 overflow-y-auto py-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                {menuSections.filter(section => isSectionAllowed(section.heading)).map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6">
                        {/* Section Heading */}
                        <h3 className="px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">
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
                                        group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left
                                        ${isActive
                                            ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20 font-bold'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white font-semibold'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icons
                                                size={18}
                                                className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                                            />
                                            <span className="text-xs tracking-wide truncate">
                                                {item.itemsDetails}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Copyright Section */}
            <div className="px-6 py-4 border-t border-white/5 text-[10px] text-gray-500 font-semibold flex items-center justify-between shrink-0 bg-slate-900/10">
                <span>© 2025 TARA777</span>
                <span className="text-[#ef4444] font-bold">Admin Panel</span>
            </div>

        </div>
    );
};

export default AdminSideBar;