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
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
        e.target.value = '';
        return;
      }

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

  const handleLogout = async () => {
    await logoutMock();
    navigate('/login');
  };

  return (
    <div className="p-5 space-y-6">
      {/* Hidden File Input */}
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
          className="p-2.5 rounded-2xl bg-white border border-[#E2DDD4] hover:bg-[#F3F1EB] text-[#18281E] transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight text-[#18281E]">Edit Profile</h1>
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
          <div className="w-28 h-28 rounded-full border-2 border-[#244434] overflow-hidden bg-[#EBF2EC] shadow-md flex items-center justify-center transition-all group-hover:scale-105">
            {photoURL ? (
              <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-[#3B6B50]" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 p-2 rounded-full bg-[#244434] text-white shadow-md group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-[#6B7E72] font-medium">Tap photo to choose & crop with camera/gallery</p>
      </motion.div>

      {/* Form Fields */}
      <div className="space-y-4">
        {errorMsg && (
          <div className="w-[84%] max-w-[290px] mx-auto p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <div className="w-[84%] max-w-[290px] mx-auto space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs font-bold text-[#3A4C40] uppercase tracking-wider">
              Display Name
            </label>
            <span className="text-[10px] text-[#6B7E72] font-medium">
              {displayName.length}/25
            </span>
          </div>
          <input
            type="text"
            value={displayName}
            maxLength={25}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your username"
            className="w-full bg-[#F8F7F3] border border-[#E2DDD4] rounded-2xl px-4 py-3 text-[#18281E] font-medium focus:outline-none focus:border-[#244434] focus:bg-white transition-all text-sm"
          />
        </div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-3 pt-2 flex flex-col items-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-[72%] max-w-[250px] flex items-center justify-center gap-2 bg-[#244434] hover:bg-[#1A3326] text-white py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 text-[#8C3B30] hover:text-[#743128] font-bold uppercase tracking-wider text-xs py-2 px-4 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Avatar Cropper Modal */}
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
