import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Camera, Save, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, updateProfileMock, logoutMock } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!profile) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size is small enough to fit in localStorage (e.g. < 1.5MB)
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Please choose a smaller image (under 1.5MB) to save to your local profile.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    updateProfileMock({
      displayName,
      photoURL,
    });
    setTimeout(() => {
      setIsSaving(false);
      navigate('/');
    }, 400);
  };

  const handleLogout = () => {
    logoutMock();
    navigate('/login');
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-primary backdrop-blur-md transition-colors shadow-md"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Player Profile</h1>
          <p className="text-xs text-text-light">Customize your player identity & avatar.</p>
        </div>
      </motion.div>

      <div className="space-y-6 max-w-sm mx-auto">
        {/* Avatar Section Glass Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white/[0.05] backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] flex flex-col items-center text-center space-y-3"
        >
          <div className="relative cursor-pointer active:scale-95 transition-transform" onClick={() => fileInputRef.current?.click()}>
            <div 
              className="w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/50 overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center backdrop-blur-md"
            >
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-primary" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-slate-950 p-2 rounded-full shadow-lg">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div>
            <h3 className="text-base font-bold text-white">{displayName || 'Player'}</h3>
            <p className="text-xs text-primary font-semibold">Level {profile.level} • {profile.rank}</p>
          </div>
        </motion.div>

        {/* Form Fields Glass Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-4 bg-white/[0.05] backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-light">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
              placeholder="Enter your player name"
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-3 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-[#050a0a] py-3.5 rounded-2xl font-extrabold uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/15 text-red-400 border border-red-500/30 backdrop-blur-md py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-red-500/25 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
