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
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (Images only: JPEG, PNG, WebP)
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
        e.target.value = '';
        return;
      }

      // Restrict file size (Max 2.5 MB)
      const MAX_SIZE_BYTES = 2.5 * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        setErrorMsg('Image size must be less than 2.5MB.');
        e.target.value = '';
        return;
      }

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
    const trimmed = displayName.trim();
    if (!trimmed) {
      setErrorMsg('Username cannot be empty');
      return;
    }
    if (trimmed.length < 2) {
      setErrorMsg('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 25) {
      setErrorMsg('Username must be 25 characters or fewer');
      return;
    }

    setIsSaving(true);
    const res = await updateProfileMock({
      displayName: trimmed,
      photoURL,
    });
    setIsSaving(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      navigate('/');
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetStats = async () => {
    if (!window.confirm('Reset all match stats, CR rating, and match history to fresh Level 1?')) return;
    setIsResetting(true);
    localStorage.removeItem('matchHistory');
    localStorage.removeItem('mockProfile');
    await updateProfileMock({
      wins: 0,
      losses: 0,
      battles: 0,
      xp: 0,
      level: 1,
      rating: 0,
      rank: 'Rookie',
      currentStreak: 0,
      longestStreak: 0,
      highestRating: 0,
    });
    setIsResetting(false);
    navigate('/');
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
        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
        className="hidden"
      />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 text-white transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-white">Edit Profile</h1>
        <div className="w-10" />
      </motion.div>

      {/* Avatar Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center space-y-3"
      >
        <div 
          onClick={handleAvatarClick}
          className="relative cursor-pointer group"
        >
          <div className="w-28 h-28 rounded-full border-2 border-primary/50 overflow-hidden bg-white/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center transition-all group-hover:border-primary">
            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-text-light/50" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-[#050a0a] shadow-lg group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-text-light font-medium">Tap photo to choose & crop with camera/gallery</p>
      </motion.div>

      {/* Form Fields */}
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between pl-1">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">
              Display Name
            </label>
            <span className="text-[10px] text-text-light/60 font-medium">
              {displayName.length}/25
            </span>
          </div>
          <input
            type="text"
            value={displayName}
            maxLength={25}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your username"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-primary/50 transition-all text-sm"
          />
        </div>

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
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-[#050a0a] py-3.5 rounded-2xl font-extrabold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-70"
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
