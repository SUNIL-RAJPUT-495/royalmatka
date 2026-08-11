import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import { ThemeProvider } from "./context/ThemeContext";
import { UserLayout } from "./layout/UserLayout";
import { UserHome } from "./pages/user/UserHome";
import { UserProfile } from "./pages/user/UserProfile";
import { UserWallet } from "./pages/user/UserWallet";
import { UserDeposit } from "./pages/user/UserDeposit";
import { UserWinningTips } from "./pages/user/UserWinningTips";
import { UserPassbook } from "./pages/user/UserPassbook";
import { UserGameRates } from "./pages/user/UserGameRates";
import { UserWithdraw } from "./pages/user/UserWithdraw";
import { UserBankDetails } from "./pages/user/UserBankDetails";
import { UserBids } from "./pages/user/UserBids";
import { AdminLayout } from "./layout/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { AddGame } from "./pages/admin/AddGame";
import { AdminBid } from "./components/admin/AdminBid";
import { MatkaResults } from "./pages/admin/MatkaResults";
import { ThemeSettings } from "./pages/admin/ThemeSettings";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. USER APP ROUTES (WRAPPED IN USER LAYOUT) */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<UserHome />} />
            <Route path="/home" element={<UserHome />} />
            <Route path="/wallet" element={<UserWallet />} />
            <Route path="/deposit" element={<UserDeposit />} />
            <Route path="/add-fund" element={<UserDeposit />} />
            <Route path="/withdraw" element={<UserWithdraw />} />
            <Route path="/bank-details" element={<UserBankDetails />} />
            <Route path="/payment-methods" element={<UserBankDetails />} />
            <Route path="/my-bids" element={<UserBids />} />
            <Route path="/bids" element={<UserBids />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/tips" element={<UserWinningTips />} />
            <Route path="/winning-tips" element={<UserWinningTips />} />
            <Route path="/passbook" element={<UserPassbook />} />
            <Route path="/transaction-history" element={<UserPassbook />} />
            <Route path="/game-rates" element={<UserGameRates />} />
          </Route>

          {/* 2. ADMIN PANEL ROUTES */}
          <Route path="/systum" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="AddGame" element={<AddGame />} />
            <Route path="AdminBid" element={<AdminBid />} />
            <Route path="matka-results" element={<MatkaResults />} />
            <Route path="ResultDecleare" element={<MatkaResults />} />
            <Route path="theme-settings" element={<ThemeSettings />} />
          </Route>

          {/* Top level alias redirects */}
          <Route path="/matka-results" element={<Navigate to="/systum/matka-results" replace />} />
          <Route path="/theme-settings" element={<Navigate to="/systum/theme-settings" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
