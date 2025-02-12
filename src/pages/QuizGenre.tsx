import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Film, Tv, Mic as Mix } from 'lucide-react';
import { motion } from 'framer-motion';

const genres = [
  {
    id: 'movies',
    name: 'Movies',
    icon: Film,
    description: 'Test your knowledge of cinema classics and blockbusters',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'music',
    name: 'Music',
    icon: Music,
    description: 'Challenge yourself with music history and trivia',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'pop-culture',
    name: 'Pop Culture',
    icon: Tv,
    description: 'Stay up to date with pop culture phenomena',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'mixed',
    name: 'Mixed Entertainment',
    icon: Mix,
    description: 'A mix of everything entertainment',
    color: 'from-emerald-500 to-teal-500'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function QuizGenre() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Quiz Genre</h1>
        <p className="text-xl text-gray-600">Select a category and test your knowledge!</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4"
      >
        {genres.map((genre) => (
          <motion.div
            key={genre.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-r ${genre.color} rounded-xl p-6 text-white cursor-pointer transform transition-all duration-300 hover:shadow-xl`}
            onClick={() => navigate(`/quiz/${genre.id}`)}
          >
            <div className="flex items-center space-x-4">
              <genre.icon className="w-12 h-12" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{genre.name}</h3>
                <p className="mt-2 text-white/90">{genre.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}