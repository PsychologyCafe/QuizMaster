import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Share2, Home, RefreshCw } from 'lucide-react';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
}

export default function Quiz() {
  const { genre } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [genre]);

  const fetchQuestions = async () => {
    try {
      // Convert genre to category ID for Open Trivia DB
      const categoryId = getCategoryId(genre);
      const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`
      );
      const data = await response.json();

      if (data.response_code === 0) {
        const questionsWithShuffledAnswers = data.results.map((q: Question) => ({
          ...q,
          all_answers: shuffleArray([q.correct_answer, ...q.incorrect_answers])
        }));
        setQuestions(questionsWithShuffledAnswers);
      } else {
        throw new Error('Failed to fetch questions');
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load questions');
      setLoading(false);
    }
  };

  const getCategoryId = (genre: string | undefined) => {
    switch (genre) {
      case 'movies':
        return 11; // Entertainment: Film
      case 'music':
        return 12; // Entertainment: Music
      case 'pop-culture':
        return 14; // Entertainment: Television
      default:
        return 9; // General Knowledge (for mixed)
    }
  };

  const handleAnswerClick = async (answer: string) => {
    const correct = answer === questions[currentQuestion].correct_answer;
    if (correct) {
      setScore(score + 1);
      toast.success('Correct!');
    } else {
      toast.error('Wrong answer!');
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
      if (user) {
        try {
          await supabase.from('scores').insert([
            {
              user_id: user.id,
              score: score + (correct ? 1 : 0),
              quiz_type: genre
            }
          ]);
        } catch (error) {
          console.error('Error saving score:', error);
        }
      }
    }
  };

  const shareScore = () => {
    const shareText = `I scored ${score} out of ${questions.length} in the ${genre} quiz on QuizMaster! Can you beat my score?`;
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Score',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Score copied to clipboard!');
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
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!showScore ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl p-8 shadow-lg"
            >
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-600">
                    Question {currentQuestion + 1}/{questions.length}
                  </span>
                  <span className="text-lg font-semibold text-indigo-600">
                    Score: {score}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {questions[currentQuestion].question}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestion].all_answers?.map((answer, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 text-left rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-transparent hover:border-indigo-200 transition-all duration-200"
                    onClick={() => handleAnswerClick(answer)}
                  >
                    {answer}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="score"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-8 shadow-lg text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Quiz Complete!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You scored {score} out of {questions.length}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  onClick={() => navigate('/quiz-genre')}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Play Again</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  onClick={shareScore}
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Score</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper function to shuffle array
function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}