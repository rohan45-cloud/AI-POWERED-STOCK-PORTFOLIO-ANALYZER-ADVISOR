import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import StockDetailPage from "./pages/StockDetailPage.jsx";
import InsightsPage from "./pages/InsightsPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import TransactionHistoryPage from "./pages/TransactionHistoryPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { useAuthStore } from "./store/authStore.js";

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-surface-2)",
            color: "var(--color-ink-1)",
            border: "1px solid var(--color-line)",
            fontSize: "14px",
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock/:symbol"
          element={
            <ProtectedRoute>
              <StockDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
