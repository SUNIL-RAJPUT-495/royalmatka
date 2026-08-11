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
import { UserBidsHistory } from "./pages/user/UserBidsHistory";
import { UserCasino } from "./pages/user/UserCasino";
import { UserCharts } from "./pages/user/UserCharts";
import { UserHowToPlay } from "./pages/user/UserHowToPlay";
import { UserMpinSettings } from "./pages/user/UserMpinSettings";
import { UserContactUs } from "./pages/user/UserContactUs";
import { UserNotificationSettings } from "./pages/user/UserNotificationSettings";
import { UserWithdrawalsFeed } from "./pages/user/UserWithdrawalsFeed";
import { UserGameModes } from "./pages/user/UserGameModes";
import Aviator from "./services/aviator/pages/Aviator";
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
            <Route path="/bids-history" element={<UserBidsHistory />} />
            <Route path="/casino" element={<UserCasino />} />
            <Route path="/play-game/:marketName" element={<UserGameModes />} />
            <Route path="/game-modes/:marketName" element={<UserGameModes />} />
            <Route path="/market-games/:marketName" element={<UserGameModes />} />
            <Route path="/charts" element={<UserCharts />} />
            <Route path="/charts-list" element={<UserCharts />} />
            <Route path="/how-to-play" element={<UserHowToPlay />} />
            <Route path="/mpin-settings" element={<UserMpinSettings />} />
            <Route path="/security-settings" element={<UserMpinSettings />} />
            <Route path="/contact-us" element={<UserContactUs />} />
            <Route path="/support" element={<UserContactUs />} />
            <Route path="/notifications" element={<UserNotificationSettings />} />
            <Route path="/notification-settings" element={<UserNotificationSettings />} />
            <Route path="/live-withdrawals" element={<UserWithdrawalsFeed />} />
            <Route path="/withdrawals-feed" element={<UserWithdrawalsFeed />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/tips" element={<UserWinningTips />} />
            <Route path="/winning-tips" element={<UserWinningTips />} />
            <Route path="/passbook" element={<UserPassbook />} />
            <Route path="/transaction-history" element={<UserPassbook />} />
            <Route path="/game-rates" element={<UserGameRates />} />
          </Route>

          {/* 2. STANDALONE FULLSCREEN AVIATOR GAME ROUTE */}
          <Route path="/aviator" element={<Aviator />} />
          <Route path="/game/aviator" element={<Aviator />} />

          {/* 3. ADMIN PANEL ROUTES */}
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
