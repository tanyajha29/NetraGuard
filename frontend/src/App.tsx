import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Targets from "./pages/Targets";
import Inventory from "./pages/Inventory";
import Findings from "./pages/Findings";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Workflows from "./pages/Workflows";
import ApiDetail from "./pages/ApiDetail";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/targets" element={<Targets />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<ApiDetail />} />
                  <Route path="/findings" element={<Findings />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/workflows" element={<Workflows />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
