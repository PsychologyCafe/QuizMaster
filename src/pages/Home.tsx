import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Trophy, Users, Gamepad2, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-indigo-900 mb-6">
          Welcome to QuizMaster
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Test your knowledge in movies, music, and pop culture with our engaging quizzes!
        </p>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300"
          >
            <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quick Play</h3>
            <p className="text-gray-600 mb-4">Start a solo quiz and test your knowledge</p>
            <Link
              to="/quiz-genre"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Play Now
            </Link>
          </motion.div>
          
          <motion.div
            variants={item}
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300"
          >
            <Trophy className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Global Leaderboard</h3>
            <p className="text-gray-600 mb-4">Compete with players worldwide</p>
            <Link
              to="/leaderboard"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              View Rankings
            </Link>
          </motion.div>
          
          {user ? (
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300"
            >
              <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Challenge Friends</h3>
              <p className="text-gray-600 mb-4">Battle with friends in real-time</p>
              <Link
                to="/challenge-friends"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                Start Challenge
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-lg shadow-lg transform transition-all duration-300"
            >
              <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Join Community</h3>
              <p className="text-gray-600 mb-4">Create an account to unlock more features</p>
              <Link
                to="/register"
                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                Sign Up Now
              </Link>
            </motion.div>
          )}
        </motion.div>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 p-8 rounded-lg text-white"
            >
              <Gamepad2 className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Daily Challenge</h3>
              <p className="mb-4">Complete daily quizzes to earn bonus points</p>
              <Link
                to="/quiz-genre"
                className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Start Daily Quiz
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-lg text-white"
            >
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Team Battle</h3>
              <p className="mb-4">Create or join a team to compete together</p>
              <Link
                to="/friends"
                className="inline-block bg-white text-rose-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Find Team
              </Link>
            </motion.div>
          </div>
        ) : (
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Get Started
          </Link>
        )}
      </motion.div>
    </div>
  );
}