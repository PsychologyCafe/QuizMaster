import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, History, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  username: string;
  email: string;
  created_at: string;
}

interface GameHistory {
  id: string;
  quiz_type: string;
  score: number;
  created_at: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchGameHistory();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, email, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        toast.error('Profile not found');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchGameHistory = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGameHistory(data || []);
    } catch (error) {
      console.error('Error fetching game history:', error);
      toast.error('Failed to load game history');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your profile information.</p>
          <button
            onClick={handleSignOut}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="p-8">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                <p className="text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <History className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Recent Games</h2>
            </div>
            <div className="space-y-4">
              {gameHistory.slice(0, 5).map((game) => (
                <div key={game.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{game.quiz_type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(game.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {game.score}
                  </div>
                </div>
              ))}
              {gameHistory.length === 0 && (
                <p className="text-gray-500 text-center py-4">No games played yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">Account Settings</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}