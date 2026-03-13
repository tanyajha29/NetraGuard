import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./context/AuthContext";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import TargetsPage from "./pages/Targets";
import InventoryPage from "./pages/Inventory";
import ApiDetailPage from "./pages/ApiDetail";
import FindingsPage from "./pages/Findings";
import AlertsPage from "./pages/Alerts";
import ReportsPage from "./pages/Reports";
import WorkflowsPage from "./pages/Workflows";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/targets"
          element={
            <ProtectedRoute>
              <TargetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:id"
          element={
            <ProtectedRoute>
              <ApiDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/findings"
          element={
            <ProtectedRoute>
              <FindingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workflows"
          element={
            <ProtectedRoute>
              <WorkflowsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
