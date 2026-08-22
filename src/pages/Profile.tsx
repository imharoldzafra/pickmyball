import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Camera, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile, updateProfileMock, logoutMock } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!profile) return null;

  const handleSave = () => {
    setIsSaving(true);
    updateProfileMock({
      displayName,
      photoURL,
    });
    setTimeout(() => {
      setIsSaving(false);
      navigate('/');
    }, 500);
  };

  const handleLogout = () => {
    logoutMock();
    navigate('/');
  };

  return (
    <div className="p-6 pb-24 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-[#0a1111] border border-[#ffffff10] flex items-center justify-center text-primary hover:bg-[#ffffff05] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-light tracking-tight text-text-main">Edit Profile</h1>
      </div>

      <div className="flex-1 max-w-sm w-full mx-auto space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-[#0a1111] border-2 border-primary overflow-hidden shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center justify-center mb-4">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-primary opacity-50" />
              )}
            </div>
            <div className="absolute inset-0 bg-[#050a0a]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#ffffff60] text-center">
            Avatar Preview
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 bg-card p-6 rounded-2xl border border-[#ffffff10] shadow-lg">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-primary mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#0a1111] border border-[#ffffff20] rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(20,184,166,0.2)] transition-all"
              placeholder="Enter your name"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-[#050a0a] py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(20,184,166,0.8)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-transparent text-accent-terra border border-accent-terra/30 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent-terra/10 transition-all active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
