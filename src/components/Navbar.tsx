import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, User, Users, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendRequest {
  id: string;
  from_username: string;
  created_at: string;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
      // Subscribe to real-time friend request updates
      const subscription = supabase
        .channel('friend_requests')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_requests',
          filter: `to_user_id=eq.${user.id}`,
        }, 
        (payload) => {
          fetchFriendRequests();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      const { data: requests, error: requestsError } = await supabase
        .from('friend_requests')
        .select(`
          id,
          from_user_id,
          created_at
        `)
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const formattedRequests = await Promise.all(
        requests.map(async (request) => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', request.from_user_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return {
              id: request.id,
              from_username: 'Unknown User',
              created_at: request.created_at,
            };
          }

          return {
            id: request.id,
            from_username: profile.username,
            created_at: request.created_at,
          };
        })
      );

      setFriendRequests(formattedRequests);
      setUnreadCount(formattedRequests.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await supabase
          .from('friend_requests')
          .update({ status: 'accepted' })
          .eq('id', requestId);

        // Add to friends table
        const request = friendRequests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('friends')
            .insert([
              {
                user_id: user?.id,
                friend_username: request.from_username
              }
            ]);
        }
      } else {
        await supabase
          .from('friend_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
      }

      // Refresh friend requests
      fetchFriendRequests();
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">QuizMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/quiz-genre"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Play Quiz
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/challenge-friends"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Challenge Friends
                </Link>
                <Link
                  to="/friends"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Users className="w-5 h-5 mr-1" />
                  Friends
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900">Friend Requests</h3>
                        </div>
                        {friendRequests.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No new friend requests
                          </div>
                        ) : (
                          friendRequests.map((request) => (
                            <div
                              key={request.id}
                              className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {request.from_username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleFriendRequest(request.id, 'accept')}
                                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleFriendRequest(request.id, 'reject')}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <User className="w-5 h-5 mr-1" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}