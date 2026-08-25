import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Camera, Save, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AvatarCropperModal from '../components/AvatarCropperModal';

export default function Profile() {
  const { profile, updateProfileMock, logoutMock } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [rawImageToCrop, setRawImageToCrop] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCropperModal, setShowCropperModal] = useState(false);

  if (!profile) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRawImageToCrop(event.target.result as string);
          setShowCropperModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so selecting the same photo triggers onChange
    e.target.value = '';
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!displayName.trim()) {
      setErrorMsg('Username cannot be empty');
      return;
    }

    setIsSaving(true);
    const res = await updateProfileMock({
      displayName: displayName.trim(),
      photoURL,
    });
    setIsSaving(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logoutMock();
    navigate('/login');
  };

  return (
    <div className="p-5 space-y-6">
      {/* Hidden File Input (Opens Native Phone Gallery / Camera Roll directly) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

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
          <div 
            className="relative cursor-pointer active:scale-95 transition-transform group" 
            onClick={handleAvatarClick}
          >
            <div 
              className="w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/50 overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center backdrop-blur-md relative"
            >
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-primary" />
              )}
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-slate-950 p-2 rounded-full shadow-lg">
              <Camera className="w-4 h-4" />
            </div>
          </div>

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
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-left">
              <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-light">Username</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setErrorMsg(null); }}
              className="w-full bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-medium"
              placeholder="Enter your username"
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

      {/* Instagram-style Avatar Cropper Modal (Opens immediately with chosen photo) */}
      <AvatarCropperModal
        isOpen={showCropperModal}
        imageSrc={rawImageToCrop}
        onClose={() => {
          setShowCropperModal(false);
          setRawImageToCrop(null);
        }}
        onChangePhoto={() => {
          fileInputRef.current?.click();
        }}
        onCropComplete={(croppedUrl) => {
          setPhotoURL(croppedUrl);
          setShowCropperModal(false);
          setRawImageToCrop(null);
        }}
      />
    </div>
  );
}
