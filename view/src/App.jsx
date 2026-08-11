import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import { ThemeProvider } from "./context/ThemeContext";
import { UserLayout } from "./layout/UserLayout";
import { UserHome } from "./pages/user/UserHome";
import { UserProfile } from "./pages/user/UserProfile";
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
            <Route path="/profile" element={<UserProfile />} />
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
