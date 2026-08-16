import React, { useState, useEffect } from 'react';
import {
  FiCalendar, FiRefreshCw, FiUsers, FiDollarSign, FiCreditCard, FiActivity,
  FiTrendingUp, FiClock, FiGift, FiBarChart2, FiDownload, FiSearch, FiFilter,
  FiPhone, FiEye
} from "react-icons/fi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaWallet } from "react-icons/fa";
import SummaryApi from '../../common/SummerAPI';
import AxiosAdmin from '../../utils/axiosAdmin';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'overview');
  
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await AxiosAdmin({ url: SummaryApi.getAdminDashboardStats.url, method: SummaryApi.getAdminDashboardStats.method });
        setStats(res.data.stats);
      } else if (activeTab === 'users') {
        const res = await AxiosAdmin({ url: SummaryApi.getAllUsers.url, method: SummaryApi.getAllUsers.method });
        setUsers(res.data.users);
      } else if (activeTab === 'transactions') {
        const res = await AxiosAdmin({ url: SummaryApi.allTransactions.url, method: SummaryApi.allTransactions.method });
        setTransactions(res.data.transactions);
      } else if (activeTab === 'Withdrawal') {
        const res = await AxiosAdmin({ url: SummaryApi.getAllWithdrawals.url, method: SummaryApi.getAllWithdrawals.method });
        setWithdrawals(res.data);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const statCards = [
    { title: "TOTAL USERS", value: stats?.totalUsers || "0", subtitle: "Registered profiles", subtitleColor: "text-green-500", headerColor: "bg-blue-600", iconBg: "bg-blue-100", iconColor: "text-blue-600", icon: FiUsers },
    { title: "TOTAL DEPOSITS", value: `₹${stats?.totalDeposits || 0}`, subtitle: "Approved deposits", subtitleColor: "text-gray-500", headerColor: "bg-green-700", iconBg: "bg-green-100", iconColor: "text-green-700", icon: FiDownload },
    { title: "TOTAL WITHDRAWALS", value: `₹${stats?.totalWithdrawals || 0}`, subtitle: "Approved payouts", subtitleColor: "text-gray-500", headerColor: "bg-purple-600", iconBg: "bg-purple-100", iconColor: "text-purple-600", icon: FiCreditCard },
    { title: "TOTAL BETS", value: `₹${stats?.totalBets || 0}`, subtitle: "Total volume placed", subtitleColor: "text-gray-500", headerColor: "bg-blue-500", iconBg: "bg-cyan-100", iconColor: "text-cyan-500", icon: FiActivity },
    { title: "TOTAL WINNINGS", value: `₹${stats?.totalWinnings || 0}`, subtitle: "Winnings paid to players", subtitleColor: "text-gray-500", headerColor: "bg-green-500", iconBg: "bg-green-100", iconColor: "text-green-500", icon: FiTrendingUp },
    { title: "ADMIN PROFIT/LOSS", value: `₹${stats?.adminProfitLoss || 0}`, subtitle: "Overall P/L calculation", subtitleColor: "text-gray-500", headerColor: "bg-green-600", iconBg: "bg-green-100", iconColor: "text-green-600", icon: FiDollarSign },
    { title: "PENDING WITHDRAWALS", value: stats?.pendingWithdrawalsCount || "0", subtitle: "Awaiting Action", subtitleColor: "text-orange-500", headerColor: "bg-orange-500", iconBg: "bg-orange-100", iconColor: "text-orange-500", icon: FiClock },
    { title: "TOTAL BONUSES GIVEN", value: `₹${stats?.totalBonuses || 0}`, subtitle: "Promotional credits", subtitleColor: "text-gray-500", headerColor: "bg-pink-600", iconBg: "bg-pink-100", iconColor: "text-pink-600", icon: FiGift }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans ">

      {/* Top Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, Sunil! Here's what's happening today.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
              <FiCalendar className="text-blue-500" />
              <span>
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            <select className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option>All Time</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>

            <button onClick={fetchData} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
              <FiRefreshCw className={`text-blue-500 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

      {/* Tabs Section - Responsive Grid (3 per row) */}
      <div className="bg-white rounded-xl shadow-sm p-3 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3 w-full lg:w-max border border-gray-100">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
        >
          <FiBarChart2 size={18} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}
        >
          <FiUsers size={18} /> Users
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}>
          <FiDollarSign size={18} /> transactions
        </button>
        <button onClick={() => setActiveTab('Withdrawal')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'Withdrawal' ? 'bg-blue-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-50'}`}>
          <BiMoneyWithdraw size={18} /> Withdrawals
        </button>
      </div>

      {/* 2. Conditional Rendering: Agar tab 'overview' hai toh pichla design dikhega */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`${card.headerColor} text-white text-xs font-bold px-5 py-2.5 tracking-wider`}>
                  {card.title}
                </div>
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                    <p className={`text-sm mt-1.5 font-medium ${card.subtitleColor}`}>
                      {card.subtitle}
                    </p>
                  </div>
                  <div className={`p-3.5 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                    <card.icon size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2 min-h-[300px] flex flex-col border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                <a href="#" className="text-blue-500 text-sm hover:underline font-medium">View All</a>
              </div>
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm font-medium">
                No recent transactions found
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-between p-3.5 rounded-xl bg-[#fff8e6] text-[#b37400] hover:bg-[#ffeec2] transition-colors w-full border border-yellow-100">
                  <div className="flex items-center gap-3 font-semibold text-sm">
                    <FiClock size={18} /> Pending Withdrawals
                  </div>
                  <span className="bg-[#f0c14b] text-yellow-900 text-xs py-0.5 px-2.5 rounded-full font-bold">0</span>
                </button>
                <button className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors w-full font-semibold text-sm border border-blue-100">
                  <FiUsers size={18} /> Manage Users
                </button>
                <button className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors w-full font-semibold text-sm border border-green-100">
                  <FiDollarSign size={18} /> View Transactions
                </button>
                <button className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors w-full font-semibold text-sm border border-purple-100">
                  <FiBarChart2 size={18} /> Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Transaction Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {['Total Deposits', 'Total Withdrawals', 'Game Winnings', 'Game Losses'].map((title, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
                  <p className={`text-2xl font-bold ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'} mb-1`}>
                    ₹{ i === 0 ? stats?.totalDeposits || 0 : i === 1 ? stats?.totalWithdrawals || 0 : i === 2 ? stats?.totalWinnings || 0 : stats?.adminProfitLoss || 0 }
                  </p>
                  <p className="text-xs font-medium text-gray-400">0 transactions</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 3. Conditional Rendering: Users tab */}
      {activeTab === 'users' && (() => {
        const filteredDashboardUsers = users.filter((u) => {
          const term = userSearchTerm.toLowerCase().trim();
          const nameMatch = u.name ? u.name.toLowerCase().includes(term) : false;
          const mobileMatch = u.mobile ? u.mobile.includes(term) : false;
          const matchesSearch = term === '' || nameMatch || mobileMatch;
          const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
          return matchesSearch && matchesStatus;
        });

        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[300px]">

            {/* Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiUsers className="text-blue-600" /> User Management
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Manage registered user accounts and view wallet balances.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
                {/* Search Box */}
                <div className="relative w-full md:w-64">
                  <FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="text"
                    placeholder="Search name or mobile..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs appearance-none pr-8"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                  <FiFilter className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                </div>
              </div>
            </div>

            {/* Content Body / Users Table */}
            <div className="flex-1 overflow-x-auto rounded-xl border border-gray-150 shadow-2xs">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50">
                  <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 text-xs font-semibold">Loading users list...</p>
                </div>
              ) : filteredDashboardUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50">
                  <FiUsers size={32} className="text-gray-300 mb-2" />
                  <p className="text-gray-500 text-xs font-semibold">No users found matching criteria</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">User</th>
                      <th className="px-4 py-3.5">Mobile</th>
                      <th className="px-4 py-3.5">Wallet Balance</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredDashboardUsers.map(u => {
                      const balField = Number(u.balance || 0);
                      const wbField = Number(u.walletBalance || 0);
                      const wWithdraw = Number(u.wallet?.withdrowalable || 0);
                      const wBonus = Number(u.wallet?.bonusBalance || 0);
                      const totalMoney = Math.max(balField, wbField, wWithdraw + wBonus);

                      const isBlocked = u.status === 'Blocked';

                      return (
                        <tr key={u._id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-xs">{u.name || 'User'}</div>
                                <div className="text-[10px] text-gray-400 font-medium">
                                  ID: {u._id?.substring(u._id?.length - 6) || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-700 font-mono">
                              <FiPhone size={12} className="text-gray-400" />
                              <span>{u.mobile || 'N/A'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-3xs">
                              <FaWallet size={12} className="text-emerald-600" />
                              <span>₹{totalMoney.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isBlocked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                              {u.status || 'Active'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => navigate(`/systum/view-user/${u._id}`)}
                              className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-3xs active:scale-95 inline-flex items-center gap-1"
                            >
                              <FiEye size={12} />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer Pagination Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-5 pt-4 border-t border-gray-150 gap-3">
              <p className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-800">{filteredDashboardUsers.length > 0 ? 1 : 0}</span> to <span className="font-bold text-gray-800">{filteredDashboardUsers.length}</span> of <span className="font-bold text-gray-800">{users.length}</span> users
              </p>
            </div>

          </div>
        );
      })()}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[250px]">

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex-1 min-w-[140px]">
                <select className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {/* Dropdown ke options */}
                  <option value="pending" className="bg-white text-gray-700 font-medium">All Types</option>
                  <option value="pending" className="bg-white text-gray-700 font-medium">Deposites</option>
                  <option value="confirm" className="bg-white text-gray-700 font-medium">Withdrawals</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Game Wins</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Game Losses</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Game Bets</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Bonuses</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Admin Added Funds</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Admin deductednFunds</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <select className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {/* Dropdown ke options */}
                  <option value="pending" className="bg-white text-gray-700 font-medium">All Status</option>
                  <option value="pending" className="bg-white text-gray-700 font-medium">Pending</option>
                  <option value="confirm" className="bg-white text-gray-700 font-medium">Confirm</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Reject</option>
                </select>
              </div>


            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-x-auto mt-4">
            {transactions.length === 0 && !loading ? (
              <div className="flex items-center justify-center p-12">
                <p className="text-gray-500 text-base">No transactions found</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(t => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-800">{t.type}</td>
                      <td className="px-4 py-3">{t.userId?.name} <span className="text-xs text-gray-400 block">{t.userId?.mobile}</span></td>
                      <td className="px-4 py-3 font-bold text-gray-800">₹{t.amount}</td>
                      <td className="px-4 py-3">{t.method}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-semibold">{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">0</span> of <span className="font-semibold text-gray-700">0</span> users</p>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                Next
              </button>
            </div>
          </div>

        </div>)}

      {activeTab === 'Withdrawal' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[250px]">

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-xl font-bold text-gray-900">Withdrawal Requests</h2>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex-1 min-w-[140px]">
                <select className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <option value="pending" className="bg-white text-gray-700 font-medium">All Status</option>
                  <option value="pending" className="bg-white text-gray-700 font-medium">Pending</option>
                  <option value="confirm" className="bg-white text-gray-700 font-medium">Approved</option>
                  <option value="reject" className="bg-white text-gray-700 font-medium">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto mt-4">
            {withdrawals.length === 0 && !loading ? (
              <div className="flex items-center justify-center p-12">
                <p className="text-gray-500 text-base"> No withdrawal requests found</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Request ID</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Account Details</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {withdrawals.map(w => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-red-500 font-bold">{w.transactionId}</td>
                      <td className="px-4 py-3">{w.userId?.name} <span className="text-xs text-gray-400 block">{w.userId?.mobile}</span></td>
                      <td className="px-4 py-3">{w.method} <span className="text-xs text-gray-400 block">{w.accountDetails}</span></td>
                      <td className="px-4 py-3 font-bold text-gray-800">₹{w.amount}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold">{w.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">0</span> of <span className="font-semibold text-gray-700">0</span> users</p>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                Previous
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                Next
              </button>
            </div>
          </div>

        </div>)}



    </div>
  );
};