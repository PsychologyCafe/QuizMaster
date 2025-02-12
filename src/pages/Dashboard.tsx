import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Clock, Trophy } from 'lucide-react';

interface QuizHistory {
  id: string;
  quiz_type: string;
  score: number;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
  });

  useEffect(() => {
    fetchQuizHistory();
  }, [user]);

  const fetchQuizHistory = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizHistory(data);
      
      // Calculate stats
      if (data.length > 0) {
        const totalQuizzes = data.length;
        const totalScore = data.reduce((sum, quiz) => sum + quiz.score, 0);
        const bestScore = Math.max(...data.map(quiz => quiz.score));
        
        setStats({
          totalQuizzes,
          averageScore: Math.round((totalScore / totalQuizzes) * 10) / 10,
          bestScore,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      setLoading(false);
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
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Dashboard</h1>
          <p className="text-xl text-gray-600">Track your quiz performance and history</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <BarChart className="w-12 h-12 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Quizzes</h3>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <Clock className="w-12 h-12 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <Trophy className="w-12 h-12 text-pink-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Best Score</h3>
                <p className="text-3xl font-bold text-pink-600">{stats.bestScore}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <h2 className="text-2xl font-bold p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            Quiz History
          </h2>
          <div className="divide-y divide-gray-200">
            {quizHistory.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {quiz.quiz_type} Quiz
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {quiz.score}
                </div>
              </motion.div>
            ))}
            {quizHistory.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                You haven't taken any quizzes yet. Start one now to see your history!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}