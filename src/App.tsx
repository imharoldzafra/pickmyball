/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Home from './pages/Home';
import Play from './pages/Play';
import Profile from './pages/Profile';
import MatchLobby from './pages/MatchLobby';
import LiveMatch from './pages/LiveMatch';
import Friends from './pages/Friends';
import History from './pages/History';
import WinnerProfile from './pages/WinnerProfile';

import Pickleball3DSphere from './components/Pickleball3DSphere';
import { motion } from 'framer-motion';

function ArenaSplashLoader() {
  return (
    <div className="min-h-screen bg-[#040709] flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Ambient Court Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />

      {/* 🎾 Centered 3D Rotating Pickleball Ball */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex flex-col items-center space-y-4 text-center"
      >
        <Pickleball3DSphere size={84} />

        <div className="space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pick<span className="text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.4)]">MyBall</span>
          </h1>

          <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            <span>Entering Arena</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ...
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <ArenaSplashLoader />;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
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
            <Route path="history" element={<History />} />
            <Route path="match/:matchId/lobby" element={<MatchLobby />} />
            <Route path="match/:matchId/live" element={<LiveMatch />} />
            <Route path="match/:matchId/winner" element={<WinnerProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

