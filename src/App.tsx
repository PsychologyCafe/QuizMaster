import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import QuizGenre from './pages/QuizGenre';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';
import Friends from './pages/Friends';
import TeamBattle from './pages/TeamBattle';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return session ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
          <Navbar />
          <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quiz-genre" element={<QuizGenre />} />
            <Route path="/quiz/:genre" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <PrivateRoute>
                  <Friends />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenge-friends"
              element={
                <PrivateRoute>
                  <TeamBattle />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;