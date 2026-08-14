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
import { UserBidsHub } from "./pages/user/UserBidsHub";
import { UserBidsHistory } from "./pages/user/UserBidsHistory";
import { UserCasino } from "./pages/user/UserCasino";
import { UserCharts } from "./pages/user/UserCharts";
import { UserHowToPlay } from "./pages/user/UserHowToPlay";
import { UserMpinSettings } from "./pages/user/UserMpinSettings";
import { UserContactUs } from "./pages/user/UserContactUs";
import { UserNotificationSettings } from "./pages/user/UserNotificationSettings";
import { UserWithdrawalsFeed } from "./pages/user/UserWithdrawalsFeed";
import { UserGameModes } from "./pages/user/UserGameModes";
import { UserBetPage } from "./pages/user/UserBetPage";
import { UserJackpotGali } from "./pages/user/UserJackpotGali";
import { UserJackpot } from "./pages/user/UserJackpot";
import { UserStarline } from "./pages/user/UserStarline";
import Aviator from "./services/aviator/pages/Aviator";
import { AviatorAdminControl } from "./pages/admin/AviatorAdminControl";
import { AdminLayout } from "./layout/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { AddGame } from "./pages/admin/AddGame";
import { AdminBid } from "./components/admin/AdminBid";
import { MatkaResults } from "./pages/admin/MatkaResults";
import { ThemeSettings } from "./pages/admin/ThemeSettings";
import { AdminAccessManager } from "./pages/admin/AdminAccessManager";
import { WelcomePopupAdmin } from "./pages/admin/WelcomePopupAdmin";
import { AdminHowToPlay } from "./pages/admin/AdminHowToPlay";
import { ContactManagement } from "./pages/admin/ContactManagement";
import { UpiSettings } from "./pages/admin/UpiSettings";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { AccountDeletionRequests } from "./pages/admin/AccountDeletionRequests";
import { TipsAdmin } from "./pages/admin/TipsAdmin";
import { WinnersHistory } from "./pages/admin/WinnersHistory";
import { UsersList } from "./pages/admin/UsersList";
import { ViewUser } from "./pages/admin/ViewUser";
import { BonusManagementPage } from "./pages/admin/BonusManagementPage";
import { AdminReferralsPage } from "./pages/admin/AdminReferralsPage";
import { CommissionManagement } from "./pages/admin/CommissionManagement";
import { WithdrawalManagement } from "./pages/admin/WithdrawalManagement";
import { WithdrawalRequestsPage } from "./pages/admin/WithdrawalRequestsPage";
import { DepositRequestsManagement } from "./pages/admin/DepositRequestsManagement";
import { JackpotGaliBids } from "./pages/admin/JackpotGaliBids";
import { JackpotGaliResults } from "./pages/admin/JackpotGaliResults";
import { StarLineAdmin } from "./pages/admin/StarLineAdmin";
import { GameRatesAdmin } from "./pages/admin/GameRatesAdmin";
import { ResultAdmin } from "./pages/admin/ResultAdmin";
import { MatkaResultPage } from "./pages/admin/MatkaResultPage";
import { AdminPanel } from "./pages/admin/AdminPanel";
import { NotificationSender } from "./pages/admin/NotificationSender";
import { AdminNotificationSettings } from "./pages/admin/AdminNotificationSettings";
import { AdminChat } from "./pages/admin/AdminChat";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { UserAuth } from "./pages/user/UserAuth";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminProtectedRoute, UserProtectedRoute } from "./components/routes/ProtectedRoute";
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* USER AUTH ROUTES */}
          <Route path="/login" element={<UserAuth />} />
          <Route path="/register" element={<UserAuth />} />
          <Route path="/signup" element={<UserAuth />} />

          {/* 1. PROTECTED USER APP ROUTES */}
          <Route element={<UserProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/" element={<UserHome />} />
              <Route path="/home" element={<UserHome />} />
              <Route path="/wallet" element={<UserWallet />} />
              <Route path="/deposit" element={<UserDeposit />} />
              <Route path="/add-fund" element={<UserDeposit />} />
              <Route path="/withdraw" element={<UserWithdraw />} />
              <Route path="/bank-details" element={<UserBankDetails />} />
              <Route path="/my-bids" element={<UserBids />} />
              <Route path="/mybids" element={<UserBids />} />
              <Route path="/bids" element={<UserBids />} />
              <Route path="/game-history" element={<UserBidsHub />} />
              <Route path="/gamehistory" element={<UserBidsHub />} />
              <Route path="/bids-hub" element={<UserBidsHub />} />
              <Route path="/bids-menu" element={<UserBidsHub />} />
              <Route path="/bids-history" element={<UserBidsHistory />} />
              <Route path="/casino" element={<UserCasino />} />
              <Route path="/play-game/:marketName" element={<UserGameModes />} />
              <Route path="/game-modes/:marketName" element={<UserGameModes />} />
              <Route path="/market-games/:marketName" element={<UserGameModes />} />
              <Route path="/bet/:marketName/:gameMode" element={<UserBetPage />} />
              <Route path="/bet/:marketName" element={<UserBetPage />} />
              <Route path="/charts" element={<UserCharts />} />
              <Route path="/charts-list" element={<UserCharts />} />
              <Route path="/how-to-play" element={<UserHowToPlay />} />
              <Route path="/mpin-settings" element={<UserMpinSettings />} />
              <Route path="/security-settings" element={<UserMpinSettings />} />
              <Route path="/contact-us" element={<UserContactUs />} />
              <Route path="/support" element={<UserContactUs />} />
              <Route path="/notifications" element={<UserNotificationSettings />} />
              <Route path="/notification-settings" element={<UserNotificationSettings />} />
              <Route path="/all-withdrawals" element={<UserWithdrawalsFeed />} />
              <Route path="/live-withdrawals" element={<UserWithdrawalsFeed />} />
              <Route path="/withdrawals-feed" element={<UserWithdrawalsFeed />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/tips" element={<UserWinningTips />} />
              <Route path="/winning-tips" element={<UserWinningTips />} />
              <Route path="/passbook" element={<UserPassbook />} />
              <Route path="/transaction-history" element={<UserPassbook />} />
              <Route path="/game-rates" element={<UserGameRates />} />
              <Route path="/JackpotGali" element={<UserJackpotGali />} />
              <Route path="/jackpot-gali" element={<UserJackpotGali />} />
              <Route path="/gali-bazar" element={<UserJackpotGali />} />
              <Route path="/starline" element={<UserStarline />} />
              <Route path="/starline-markets" element={<UserStarline />} />
              <Route path="/Jackpot" element={<UserJackpot />} />
              <Route path="/jackpot" element={<UserJackpot />} />
            </Route>

            {/* 2. STANDALONE FULLSCREEN AVIATOR GAME ROUTE */}
            <Route path="/aviator" element={<Aviator />} />
            <Route path="/game/aviator" element={<Aviator />} />
          </Route>

          {/* 3. ADMIN LOGIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/systum/login" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* 4. ADMIN PANEL ROUTES (PROTECTED BY ADMIN MIDDLEWARE) */}
          <Route path="/systum" element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="AddGame" element={<AdminPanel />} />
              <Route path="AdminBid" element={<AdminBid />} />
              <Route path="matka-results" element={<MatkaResultPage />} />
              <Route path="MatkaResultPage" element={<MatkaResultPage />} />
              <Route path="ResultDecleare" element={<ResultAdmin />} />
              <Route path="AdminPanel" element={<AdminPanel />} />
              <Route path="mechanics" element={<AdminPanel />} />
              <Route path="theme-settings" element={<ThemeSettings />} />
              <Route path="AdminAccessManager" element={<AdminAccessManager />} />
              <Route path="admin-access" element={<AdminAccessManager />} />
              <Route path="welcome-popup" element={<WelcomePopupAdmin />} />
              <Route path="WelcomePopupAdmin" element={<WelcomePopupAdmin />} />
              <Route path="NotificationSender" element={<NotificationSender />} />
              <Route path="notification-sender" element={<NotificationSender />} />
              <Route path="notification-settings" element={<AdminNotificationSettings />} />
              <Route path="AdminNotificationSettings" element={<AdminNotificationSettings />} />
              <Route path="admin-chat" element={<AdminChat />} />
              <Route path="AdminChat" element={<AdminChat />} />
              <Route path="how-to-play" element={<AdminHowToPlay />} />
              <Route path="AdminHowToPlay" element={<AdminHowToPlay />} />
              <Route path="contact-management" element={<ContactManagement />} />
              <Route path="aviator" element={<AviatorAdminControl />} />
              <Route path="ContactManagement" element={<ContactManagement />} />
              <Route path="contact" element={<ContactManagement />} />
              <Route path="upi" element={<UpiSettings />} />
              <Route path="upi-settings" element={<UpiSettings />} />
              <Route path="AdminUpiSettings" element={<UpiSettings />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="ReportsPage" element={<ReportsPage />} />
              <Route path="reports-history" element={<ReportsPage />} />
              <Route path="delete-requests" element={<AccountDeletionRequests />} />
              <Route path="AccountDeletionRequests" element={<AccountDeletionRequests />} />
              <Route path="tips-panel" element={<TipsAdmin />} />
              <Route path="TipsAdmin" element={<TipsAdmin />} />
              <Route path="WinnersHistory" element={<WinnersHistory />} />
              <Route path="WinnersLosersHistory" element={<WinnersHistory />} />
              <Route path="users" element={<UsersList />} />
              <Route path="view-user/:id" element={<ViewUser />} />
              <Route path="view-user" element={<Navigate to="/systum/users" replace />} />
              <Route path="bonus" element={<BonusManagementPage />} />
              <Route path="referal" element={<AdminReferralsPage />} />
              <Route path="AdminReferralsPage" element={<AdminReferralsPage />} />
              <Route path="commission" element={<CommissionManagement />} />
              <Route path="admin-comission" element={<CommissionManagement />} />
              <Route path="all-withdrawals" element={<WithdrawalRequestsPage />} />
              <Route path="allfw" element={<WithdrawalRequestsPage />} />
              <Route path="Payment" element={<DepositRequestsManagement />} />
              <Route path="payment" element={<DepositRequestsManagement />} />
              <Route path="deposit-requests" element={<DepositRequestsManagement />} />
              <Route path="Withdraw" element={<WithdrawalRequestsPage />} />
              <Route path="withdraw" element={<WithdrawalRequestsPage />} />
              <Route path="withdrawal-requests" element={<WithdrawalRequestsPage />} />
              <Route path="jackpot-gali-bids" element={<JackpotGaliBids />} />
              <Route path="jackpotgali-bids" element={<JackpotGaliBids />} />
              <Route path="jackpot-gali-results" element={<JackpotGaliResults />} />
              <Route path="jackpotgaliResult" element={<JackpotGaliResults />} />
              <Route path="starline" element={<StarLineAdmin />} />
              <Route path="jackpotgali" element={<StarLineAdmin />} />
              <Route path="jackpot-gali" element={<StarLineAdmin />} />
              <Route path="GameRatesAdmin" element={<GameRatesAdmin />} />
              <Route path="game-rates" element={<GameRatesAdmin />} />
              <Route path="ResultAdmin" element={<ResultAdmin />} />
              <Route path="results" element={<ResultAdmin />} />
            </Route>
          </Route>

          {/* 5. CATCH-ALL 404 PAGE NOT FOUND ROUTE */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
