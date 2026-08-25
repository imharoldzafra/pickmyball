/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Home from './pages/Home';
import Play from './pages/Play';
import Profile from './pages/Profile';
import MatchLobby from './pages/MatchLobby';
import LiveMatch from './pages/LiveMatch';
import Victory from './pages/Victory';
import Friends from './pages/Friends';
import History from './pages/History';

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
            <Route path="match/:matchId/victory" element={<Victory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

