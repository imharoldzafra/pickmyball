import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus } from 'lucide-react';

export default function Friends() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-main">Friends</h1>
        <button className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex bg-card p-1 rounded-xl mb-6 border border-gray-100">
        <button 
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'friends' ? 'bg-primary text-white' : 'text-text-light'}`}
        >
          My Friends
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'requests' ? 'bg-primary text-white' : 'text-text-light'}`}
        >
          Requests
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-gray-100 border-dashed">
          <Users className="w-12 h-12 text-text-light mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-text-main mb-1">No friends yet</h3>
          <p className="text-sm text-text-light">Start playing matches to meet new players!</p>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-gray-100 border-dashed">
          <h3 className="text-lg font-bold text-text-main mb-1">No pending requests</h3>
        </div>
      )}
    </div>
  );
}
