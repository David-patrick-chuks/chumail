import "./index.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { AppPasswordGuide } from "./pages/AppPasswordGuide";


import { AuthCallback } from "./pages/AuthCallback";
import { authService, socketService } from "./services/index";

function LandingPageWrapper() {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/dashboard')} />;
}

function DashboardWrapper() {
  return <Dashboard onLogout={() => { }} />;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    authService.getSession().then(s => {
      setSession(s);
      if (s?.user?.id) {
        socketService.connect(s.user.id);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = authService.onAuthStateChange((session: any) => {
      setSession(session);
      if (session?.user?.id) {
        socketService.connect(session.user.id);
      } else {
        socketService.disconnect();
      }
    });

    return () => {
      subscription.unsubscribe();
      socketService.disconnect();
    };
  }, []);


  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-blue-500">BOOTING_ChuMail_OS...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={session ? <Navigate to="/dashboard" replace /> : <LandingPageWrapper />}
          />

          <Route path="/guide/google-app-password" element={<AppPasswordGuide />} />


          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard/*"
            element={session ? <DashboardWrapper /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
