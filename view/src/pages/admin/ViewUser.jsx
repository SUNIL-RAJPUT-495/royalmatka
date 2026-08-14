import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import AxiosAdmin from '../../utils/axiosAdmin';
import SummaryApi from '../../common/SummerAPI';
import toast from 'react-hot-toast';

// Reusable Table Component (Exact matching structure)
const DataTable = ({ title, columns, data = [], emptyMessage = "No data available in table", tabs }) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm p-5 mt-6 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight flex items-center gap-2">
                <span>📋</span> {title}
            </h3>

            <div className="overflow-x-auto border border-gray-150 rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[800px] text-xs font-semibold text-gray-700">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-3.5 whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-400 font-semibold bg-gray-50/50">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50/80 transition-colors">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="p-3.5">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-xs text-gray-500 font-semibold">
                <div>
                    Showing {data.length > 0 ? 1 : 0} to {data.length} of {data.length} entries
                </div>
            </div>
        </div>
    );
};

// Main Component Function
export const ViewUser = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals & Tab state
    const [activeTab, setActiveTab] = useState('deposits');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showChangePassModal, setShowChangePassModal] = useState(false);
    const [amount, setAmount] = useState('');
    const [remark, setRemark] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [changePassLoading, setChangePassLoading] = useState(false);
    const [forceLogoutLoading, setForceLogoutLoading] = useState(false);
    const [showRawPass, setShowRawPass] = useState(false);

    const fetchUser = useCallback(async () => {
        try {
            const res = await AxiosAdmin({
                url: `${SummaryApi.getAdminViewUser.url}/${id}`,
                method: SummaryApi.getAdminViewUser.method
            });
            if (res.data.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load user details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleManualTransaction = async (type) => {
        if (!amount || Number(amount) <= 0) {
            return toast.error("Please enter a valid amount");
        }

        setIsSubmitting(true);
        const apiCall = type === 'deposit' ? SummaryApi.adminAddFund : SummaryApi.adminDeductFund;

        try {
            const res = await AxiosAdmin({
                url: apiCall.url,
                method: apiCall.method,
                data: { userId: id, amount, remark }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setShowAddModal(false);
                setShowWithdrawModal(false);
                setAmount('');
                setRemark('');
                fetchUser(); // reload the user data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to process ${type}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const [statusUpdating, setStatusUpdating] = useState(false);

    const handleToggleBlock = async () => {
        if (!user || !user._id) return;
        const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
        setStatusUpdating(true);
        try {
            const res = await AxiosAdmin({
                url: SummaryApi.toggleUserStatus?.url || '/api/user/toggle-status',
                method: SummaryApi.toggleUserStatus?.method || 'post',
                data: { userId: user._id, status: newStatus }
            });
            if (res.data.success) {
                toast.success(`User status updated to ${newStatus}! 🎉`);
                fetchUser();
            } else {
                toast.error(res.data.message || "Failed to update status");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update status");
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.trim().length < 4) {
            return toast.error("Password must be at least 4 characters long");
        }
        setChangePassLoading(true);
        try {
            const res = await AxiosAdmin({
                url: SummaryApi.adminChangePassword?.url || '/api/user/admin-change-password',
                method: SummaryApi.adminChangePassword?.method || 'post',
                data: { userId: user._id, newPassword: newPassword.trim() }
            });
            if (res.data.success) {
                toast.success(res.data.message || "Password changed successfully! 🎉");
                setShowChangePassModal(false);
                setNewPassword('');
            } else {
                toast.error(res.data.message || "Failed to change password");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setChangePassLoading(false);
        }
    };

    const handleForceLogout = async () => {
        if (!user || !user._id) return;
        setForceLogoutLoading(true);
        try {
            const res = await AxiosAdmin({
                url: SummaryApi.forceLogoutUser?.url || '/api/user/force-logout',
                method: SummaryApi.forceLogoutUser?.method || 'post',
                data: { userId: user._id }
            });
            if (res.data.success) {
                toast.success(res.data.message || `User ${user.name || user.mobile} forcibly logged out! 🚪`);
            } else {
                toast.error(res.data.message || "Failed to force logout user");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to force logout user");
        } finally {
            setForceLogoutLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500 font-semibold">Loading User Details...</div>;
    if (!data || !data.user) return <div className="p-6 text-center text-red-500 font-semibold">User Not Found</div>;

    const user = data.user || {};
    const deposits = Array.isArray(data.deposits) ? data.deposits : [];
    const withdrawals = Array.isArray(data.withdrawals) ? data.withdrawals : [];
    const bids = Array.isArray(data.bids) ? data.bids : [];
    const transactions = Array.isArray(data.transactions) ? data.transactions : [];
    const winnings = bids.filter(b => b.status === 'Winner');

    // Formatting functions
    const formatDate = (dateStr) => new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

    const depositsData = deposits.map((d, i) => [
        i + 1,
        `₹${d.amount}`,
        d.transactionId,
        formatDate(d.createdAt),
        <span key={`dep-${d._id}`} className={`px-2 py-1 rounded text-xs ${d.status === 'Approved' ? 'bg-green-100 text-green-700' : d.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
    ]);

    const withdrawalsData = withdrawals.map((w, i) => [
        i + 1,
        `₹${w.amount}`,
        w.transactionId,
        formatDate(w.createdAt),
        <span key={`wd-${w._id}`} className={`px-2 py-1 rounded text-xs ${w.status === 'Approved' ? 'bg-green-100 text-green-700' : w.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.status}</span>,
        w.accountDetails || 'N/A'
    ]);

    const bidsData = bids.map((b, i) => [
        i + 1,
        b.market_id?.name || 'N/A',
        b.game_type,
        b.number,
        `₹${b.amount}`,
        formatDate(b.createdAt)
    ]);

    const winTransactions = transactions.filter(t => t.type === 'Win' || (t.amount > 0 && t.remark && t.remark.toLowerCase().includes('win')));

    const winningsData = [
        ...winnings.map((w, i) => [
            i + 1,
            formatDate(w.updatedAt || w.createdAt),
            user.name || 'User',
            user.mobile || 'N/A',
            w.market_id?.name || 'Matka Game',
            w.number || '-',
            w.game_type || 'Win',
            `₹${w.winningAmount || (w.amount * (w.game_type === 'Single' ? 9 : w.game_type === 'Jodi' ? 90 : 10))}`
        ]),
        ...winTransactions.map((wt, i) => [
            winnings.length + i + 1,
            formatDate(wt.createdAt),
            user.name || 'User',
            user.mobile || 'N/A',
            wt.remark || 'Casino / Aviator Win',
            '-',
            wt.type || 'Win',
            `₹${wt.amount}`
        ])
    ];

    const transactionsData = transactions.map((t, i) => [
        i + 1,
        t.transactionId,
        `₹${t.amount}`,
        <span key={`tx-${t._id}`} className={`text-white px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${t.type === 'Deposit' ? 'bg-[#28c76f]' : 'bg-[#ff6b6b]'}`}>{t.type}</span>,
        formatDate(t.createdAt),
        t.status
    ]);

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-4 md:p-6 font-sans text-left text-gray-800 select-none">

            {/* Header with Back button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 shadow-2xs transition-all cursor-pointer active:scale-95"
                        title="Go Back"
                    >
                        ←
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none uppercase">
                                {user.name || 'User Profile'}
                            </h1>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                {user.status || 'Active'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold mt-1">
                            User Management <span className="mx-1">/</span> User Details <span className="mx-1">/</span> <span className="font-mono text-gray-700">{user.mobile}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleBlock}
                        disabled={statusUpdating}
                        className={`rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all ${
                            user.status === 'Blocked'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                        title={user.status === 'Blocked' ? 'Unblock User' : 'Block User'}
                    >
                        <span>{user.status === 'Blocked' ? '🟢 Unblock User' : '🚫 Block / Restrict User'}</span>
                    </button>

                    <button
                        onClick={fetchUser}
                        className="border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                    >
                        <span>🔄 Refresh Profile</span>
                    </button>
                </div>
            </div>

            {/* Top Section */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Profile Card */}
                <div className="w-full lg:w-[320px] bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col shrink-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 pb-16 relative flex justify-between text-white">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-0.5 tracking-tight">{user.name}</h2>
                            <p className="text-xs text-white/80 font-mono flex items-center gap-1">
                                📱 {user.mobile}
                            </p>
                        </div>
                        <div className="text-right text-xs font-bold flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                {user.status === 'Active' ? 'Active User' : 'Inactive'}
                            </span>
                            {user.status === 'Blocked' && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-500 text-white uppercase tracking-wider">
                                    Banned
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="px-5 pb-5 relative bg-white rounded-b-3xl">
                        {/* Avatar overlapping */}
                        <div className="absolute -top-12 left-5 w-20 h-20 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center overflow-hidden shadow-md font-bold text-white text-2xl uppercase">
                            {user.name?.charAt(0) || 'U'}
                        </div>

                        <div className="pt-12 mt-2">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Available Balance</p>
                            <p className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                                ₹{((user.wallet?.withdrowalable ?? user.wallet?.realBalance ?? user.balance ?? 0) + (user.wallet?.bonusBalance || 0)).toFixed(2)}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs mb-5 bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Withdrawable</span>
                                    <span className="font-bold text-emerald-600 text-sm">
                                        ₹{(user.wallet?.withdrowalable ?? user.wallet?.realBalance ?? user.balance ?? 0).toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-amber-500 block uppercase tracking-wider">Bonus Money</span>
                                    <span className="font-bold text-amber-600 text-sm">
                                        ₹{Number(user.wallet?.bonusBalance || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-2.5 rounded-2xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <span>➕ Add Fund</span>
                                </button>
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="flex-1 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold py-2.5 rounded-2xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <span>➖ Deduct Fund</span>
                                </button>
                            </div>

                            {/* Action Buttons Box inside Profile Card */}
                            <div className="space-y-2 mt-3 pt-3 border-t border-gray-150">
                                <button
                                    onClick={() => setShowChangePassModal(true)}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2.5 rounded-2xl text-xs transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    <span>🔑 Change Password</span>
                                </button>

                                <button
                                    onClick={handleToggleBlock}
                                    disabled={statusUpdating}
                                    className={`w-full font-bold py-2.5 rounded-2xl text-xs transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                                        user.status === 'Blocked'
                                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    }`}
                                >
                                    <span>{user.status === 'Blocked' ? '🟢 Unblock Account' : '🚫 Block Account'}</span>
                                </button>

                                <button
                                    onClick={handleForceLogout}
                                    disabled={forceLogoutLoading}
                                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold py-2.5 rounded-2xl text-xs transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    <span>🚪 Force Logout User</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                            <span>👤</span> Personal Information
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</span>
                                <span className="text-xs font-bold text-gray-900">{user.name}</span>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile</span>
                                <span className="text-xs font-bold text-gray-900 font-mono flex items-center gap-1">
                                    {user.mobile}
                                </span>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Password</span>
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-gray-900 font-mono">
                                        {showRawPass ? (user.rawPassword ? user.rawPassword : 'Not Saved (Old Account)') : '••••••••'}
                                    </span>
                                    <button
                                        onClick={() => setShowRawPass(prev => !prev)}
                                        className="text-xs text-gray-400 hover:text-indigo-600 font-bold cursor-pointer transition-colors"
                                        title={showRawPass ? "Hide Password" : "Show Password"}
                                    >
                                        {showRawPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</span>
                                <span className="text-xs font-bold text-indigo-600 uppercase">{user.role || 'User'}</span>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Status</span>
                                <span className={`text-xs font-bold ${user.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {user.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                            <span>📡</span> Registration & Activity Logs
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                                <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Reg. Date & Time</span>
                                <span className="text-[11px] font-bold text-blue-950">
                                    {user.registrationDate || user.createdAt ? formatDate(user.registrationDate || user.createdAt) : 'N/A'}
                                </span>
                            </div>
                            <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                                <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Registration IP</span>
                                <span className="text-xs font-bold text-blue-950 font-mono">
                                    {user.registrationIp || '127.0.0.1'}
                                </span>
                            </div>
                            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Last Login Date</span>
                                <span className="text-[11px] font-bold text-emerald-950">
                                    {user.lastLoginDate || user.updatedAt ? formatDate(user.lastLoginDate || user.updatedAt) : 'N/A'}
                                </span>
                            </div>
                            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                                <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Last Login IP</span>
                                <span className="text-xs font-bold text-emerald-950 font-mono">
                                    {user.lastLoginIp || user.registrationIp || '127.0.0.1'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                            <span>🏦</span> Payment & Bank Details
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bank Name</span>
                                <span className="text-xs font-bold text-gray-900">
                                    {user.bankAccounts?.[0]?.bankName || user.paymentInfo?.bankName || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">A/c Holder Name</span>
                                <span className="text-xs font-bold text-gray-900">
                                    {user.bankAccounts?.[0]?.accountHolderName || user.paymentInfo?.accountHolderName || user.name || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">A/c Number</span>
                                <span className="text-xs font-bold text-gray-900 font-mono">
                                    {user.bankAccounts?.[0]?.accountNumber || user.paymentInfo?.accountNumber || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-150">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">IFSC Code</span>
                                <span className="text-xs font-bold text-gray-900 font-mono">
                                    {user.bankAccounts?.[0]?.ifscCode || user.paymentInfo?.ifscCode || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-100">
                                <span className="block text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">Primary UPI ID</span>
                                <span className="text-xs font-bold text-purple-900 font-mono">
                                    {user.upiIds?.[0]?.upiId || user.paymentInfo?.phonePeUpiId || 'N/A'}
                                </span>
                            </div>
                            <div className="bg-sky-50/80 p-3 rounded-2xl border border-sky-100">
                                <span className="block text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1">Paytm Mobile</span>
                                <span className="text-xs font-bold text-sky-900 font-mono">
                                    {user.paymentInfo?.paytmNumber || user.mobile || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Tab Slider Buttons */}
            <div className="mt-8 bg-white rounded shadow-[0_0_5px_rgba(0,0,0,0.05)] border border-gray-100 p-4">
                <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('deposits')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-3xs active:scale-95 ${
                            activeTab === 'deposits'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <span>📥 Add Fund Request List</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'deposits' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {depositsData.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('withdrawals')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-3xs active:scale-95 ${
                            activeTab === 'withdrawals'
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <span>📤 Withdraw Fund Request List</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'withdrawals' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {withdrawalsData.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('bids')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-3xs active:scale-95 ${
                            activeTab === 'bids'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <span>🎲 Bid History</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'bids' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {bidsData.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('winnings')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-3xs active:scale-95 ${
                            activeTab === 'winnings'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <span>🏆 Winning History List</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'winnings' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {winningsData.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-3xs active:scale-95 ${
                            activeTab === 'transactions'
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <span>📜 Passbook Transactions</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'transactions' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {transactionsData.length}
                        </span>
                    </button>
                </div>

                {/* Active Tab Content */}
                <div className="-mt-4">
                    {activeTab === 'deposits' && (
                        <DataTable
                            title="Add Fund Request List"
                            columns={["#", "Request Amount", "Request No.", "Date", "Status"]}
                            data={depositsData}
                            emptyMessage="No deposit requests found"
                        />
                    )}

                    {activeTab === 'withdrawals' && (
                        <DataTable
                            title="Withdraw Fund Request List"
                            columns={["#", "Request Amount", "Request No.", "Request Date", "Status", "Account details"]}
                            data={withdrawalsData}
                            emptyMessage="No withdrawal requests found"
                        />
                    )}

                    {activeTab === 'bids' && (
                        <DataTable
                            title="Bid History"
                            columns={["#", "Game Name", "Game Type", "Digits", "Points", "Date"]}
                            data={bidsData}
                            emptyMessage="No bids found"
                        />
                    )}

                    {activeTab === 'winnings' && (
                        <DataTable
                            title="Winning History List"
                            columns={["Id", "Tx Date", "Member Name", "Member Number", "Market Name", "Bet Number", "Game Name", "Amount"]}
                            data={winningsData}
                            emptyMessage="No winnings found"
                        />
                    )}

                    {activeTab === 'transactions' && (
                        <DataTable
                            title="Wallet Transaction History"
                            tabs="All"
                            columns={["#", "Tx Req. No.", "Amount", "Transaction Type", "Date", "Status"]}
                            data={transactionsData}
                            emptyMessage="No transactions found"
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded p-6 w-96 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-[#4b4b4b]">Add Fund to Wallet</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
                            <input
                                type="text"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                                placeholder="e.g. Added via Admin Panel"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowAddModal(false); setAmount(''); setRemark(''); }}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleManualTransaction('deposit')}
                                className="px-4 py-2 text-white bg-[#28c76f] rounded hover:bg-[#23af61] flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Add Fund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded p-6 w-96 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-[#4b4b4b]">Withdraw Fund from Wallet</h2>
                        <div className="mb-4">
                            <p className="text-sm border border-red-200 bg-red-50 text-red-600 px-3 py-2 rounded mb-3">
                                Max Available: ₹{user.wallet?.realBalance || 0}
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remark (Optional)</label>
                            <input
                                type="text"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
                                placeholder="e.g. Deducted by Admin"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowWithdrawModal(false); setAmount(''); setRemark(''); }}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleManualTransaction('withdraw')}
                                className="px-4 py-2 text-white bg-[#ff6b6b] rounded hover:bg-[#e85a5a] flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Withdraw Fund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-150 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                                <span>🔑</span> Change User Password
                            </h2>
                            <button
                                onClick={() => { setShowChangePassModal(false); setNewPassword(''); }}
                                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500 font-semibold mb-3">
                                Set a new password for <span className="font-bold text-gray-900">{user.name}</span> ({user.mobile}).
                            </p>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">New Password</label>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 text-xs font-semibold"
                                placeholder="Enter new password (min 4 characters)"
                            />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => { setShowChangePassModal(false); setNewPassword(''); }}
                                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                                disabled={changePassLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                                disabled={changePassLoading}
                            >
                                {changePassLoading ? 'Updating...' : 'Save Password 🔑'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};