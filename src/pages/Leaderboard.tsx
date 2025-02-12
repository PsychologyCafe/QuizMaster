import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  score: number;
  quiz_type: string;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          score,
          quiz_type,
          users (email)
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedData = data.map(entry => ({
        username: entry.users.email.split('@')[0],
        score: entry.score,
        quiz_type: entry.quiz_type
      }));

      setLeaderboard(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 2:
        return <Award className="w-8 h-8 text-amber-700" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Global Leaderboard</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 text-center">
                  {getIcon(index) || <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{entry.username}</h3>
                  <p className="text-sm text-gray-500">{entry.quiz_type}</p>
                </div>
                <div className="text-2xl font-bold text-indigo-600">{entry.score}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}