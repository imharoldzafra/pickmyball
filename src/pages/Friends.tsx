import React, { useState } from 'react';
import { Users, UserPlus, HeartHandshake, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Friends() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#18281E]">Player Network</h1>
          <p className="text-xs text-[#6B7E72]">Connect, challenge, and play with friends.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 bg-[#244434] hover:bg-[#1A3326] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-white" /> Add Friend
        </motion.button>
      </motion.div>

      {/* Tabs with Smooth Sliding Fill Pill */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex bg-[#EBF2EC] p-1.5 rounded-full border border-[#D1DDD3] shadow-sm relative"
      >
        <button 
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`relative flex-1 py-2 text-xs font-bold rounded-full transition-colors duration-200 flex items-center justify-center gap-1.5 z-10 cursor-pointer select-none active:scale-95 ${
            activeTab === 'friends' 
              ? 'text-white font-black' 
              : 'text-[#6B7E72] hover:text-[#18281E]'
          }`}
        >
          {activeTab === 'friends' && (
            <motion.div
              layoutId="activeFriendTabPill"
              className="absolute inset-0 bg-[#244434] rounded-full shadow-sm -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Users className="w-3.5 h-3.5" /> My Friends
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`relative flex-1 py-2 text-xs font-bold rounded-full transition-colors duration-200 flex items-center justify-center gap-1.5 z-10 cursor-pointer select-none active:scale-95 ${
            activeTab === 'requests' 
              ? 'text-white font-black' 
              : 'text-[#6B7E72] hover:text-[#18281E]'
          }`}
        >
          {activeTab === 'requests' && (
            <motion.div
              layoutId="activeFriendTabPill"
              className="absolute inset-0 bg-[#244434] rounded-full shadow-sm -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Bell className="w-3.5 h-3.5" /> Requests
        </button>
      </motion.div>

      {activeTab === 'friends' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.04)] space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-[#EBF2EC] border border-[#D1DDD3] flex items-center justify-center text-[#244434] shadow-sm">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h3 className="text-lg font-black text-[#18281E]">No friends added yet</h3>
            <p className="text-xs text-[#6B7E72] leading-relaxed">
              Create a match and invite local players to build your Pickleball network!
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === 'requests' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.04)] space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-[#EBF2EC] flex items-center justify-center text-[#244434] mb-2 border border-[#D1DDD3]">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#18281E]">No pending requests</h3>
          <p className="text-xs text-[#6B7E72]">You're all caught up!</p>
        </motion.div>
      )}
    </div>
  );
}
