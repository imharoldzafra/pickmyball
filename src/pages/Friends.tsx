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
          <h1 className="text-2xl font-bold tracking-tight text-white">Player Network</h1>
          <p className="text-xs text-text-light">Connect, challenge, and play with friends.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" /> Add Friend
        </motion.button>
      </motion.div>

      {/* Glass Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex bg-white/[0.06] backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-sm"
      >
        <button 
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'friends' 
              ? 'bg-primary text-[#050a0a] shadow-sm font-extrabold' 
              : 'text-text-light hover:text-text-main'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> My Friends
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'requests' 
              ? 'bg-primary text-[#050a0a] shadow-sm font-extrabold' 
              : 'text-text-light hover:text-text-main'
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Requests
        </button>
      </motion.div>

      {activeTab === 'friends' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center justify-center text-center p-10 bg-white/[0.03] backdrop-blur-md rounded-3xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm backdrop-blur-md">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-xs">
            <h3 className="text-lg font-bold text-white">No friends added yet</h3>
            <p className="text-xs text-text-light leading-relaxed">
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
          className="flex flex-col items-center justify-center text-center p-10 bg-white/[0.03] backdrop-blur-md rounded-3xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-text-light mb-2 border border-white/10 backdrop-blur-md">
            <Bell className="w-6 h-6 opacity-70" />
          </div>
          <h3 className="text-base font-bold text-white">No pending requests</h3>
          <p className="text-xs text-text-light">You're all caught up!</p>
        </motion.div>
      )}
    </div>
  );
}
