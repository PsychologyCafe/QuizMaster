import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Trophy, Timer, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Friend {
  username: string;
}

export default function TeamBattle() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('friend_username')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;

      if (data) {
        setFriends(data.map((friend) => ({
          username: friend.friend_username, // Mengubah key agar sesuai dengan tipe Friend[]
        })));
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    }
  };

  const startBattle = () => {
    if (!selectedFriend) {
      toast.error('Please select a friend to challenge');
      return;
    }

    if (!selectedGenre) {
      toast.error('Please select a quiz genre');
      return;
    }

    // Navigasi ke halaman battle dengan friend dan genre yang dipilih
    navigate(`/quiz/${selectedGenre}`, { 
      state: { 
        mode: 'challenge',
        opponent: selectedFriend
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <div className="flex items-center mb-8">
              <Trophy className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Challenge Friends</h1>
            </div>

            <div className="space-y-8">
              {/* Friend Selection */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="h-6 w-6 text-indigo-600 mr-2" />
                  Select Friend to Challenge
                </h2>
                <div className="grid gap-4">
                  {friends.length > 0 ? (
                    <select
                      value={selectedFriend}
                      onChange={(e) => setSelectedFriend(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select a friend</option>
                      {friends.map((friend) => (
                        <option key={friend.username} value={friend.username}>
                          {friend.username}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No friends found. Add some friends first!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Genre Selection */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Quiz Genre</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['movies', 'music', 'pop-culture', 'mixed'].map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedGenre === genre
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      <span className="capitalize">{genre.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Battle Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={startBattle}
                  disabled={loading || !selectedFriend || !selectedGenre}
                  className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Timer className="h-5 w-5" />
                  <span>Start Challenge</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
