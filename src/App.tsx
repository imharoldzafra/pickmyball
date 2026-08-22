/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Layout from './components/layout/Layout';

// Placeholder Pages
import Home from './pages/Home';
import Play from './pages/Play';
import Profile from './pages/Profile';
import MatchLobby from './pages/MatchLobby';
import LiveMatch from './pages/LiveMatch';

import Friends from './pages/Friends';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function Login() {
  const { user, loginMock } = useAuth();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  if (user) return <Navigate to="/" />;
  
  const handleLogin = async () => {
    setErrorMsg(null);
    loginMock();
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="bg-card p-8 rounded-2xl shadow-sm border border-[#ffffff10] max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border border-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
          P
        </div>
        <h1 className="text-[10px] uppercase tracking-widest text-[#ffffff60] mb-2">Nexus Intelligence Systems</h1>
        <h2 className="text-3xl font-light tracking-tight text-text-main mb-2">Pickleball Core</h2>
        <p className="text-sm text-[#ffffff40] mb-8">Compete, track your progress, and connect.</p>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-left">
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
        )}
        
        <button 
          onClick={handleLogin}
          className="w-full bg-primary text-[#050a0a] py-3 rounded-xl font-bold hover:shadow-[0_0_15px_rgba(20,184,166,0.8)] transition-all uppercase tracking-widest text-xs"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="play" element={<Play />} />
            <Route path="profile" element={<Profile />} />
            <Route path="friends" element={<Friends />} />
            <Route path="match/:matchId/lobby" element={<MatchLobby />} />
            <Route path="match/:matchId/live" element={<LiveMatch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

