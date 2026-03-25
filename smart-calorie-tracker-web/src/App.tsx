import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";

const GOOGLE_CLIENT_ID = "615059212619-cuenbnkaooglukhi5ibsh6b044ejkpiv.apps.googleusercontent.com";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Onboarding />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
