import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Users, Search, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Friend {
  id?: string;
  username: string;
  status: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('id, friend_username, status')
        .eq('user_id', user?.id);

      if (error) throw error;
      setFriends(data?.map(friend => ({
        id: friend.id,
        username: friend.friend_username,
        status: friend.status
      })) || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    }
  };

  const searchUsers = async (username: string) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, email, created_at')
        .ilike('username', `%${username}%`)
        .limit(5);

      if (error) throw error;
      
      // Filter out current user and existing friends
      const filteredResults = (data || []).filter(profile => 
        profile.id !== user?.id && 
        !friends.some(friend => friend.username === profile.username)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchUsername(value);
    searchUsers(value);
  };

  const viewProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setSearchUsername('');
    setSearchResults([]);
  };

  const checkExistingFriendRequest = async (toUserId: string) => {
    try {
      const { data: sentRequest } = await supabase
        .from('friend_requests')
        .select()
        .eq('from_user_id', user?.id)
        .eq('to_user_id', toUserId)
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      const { data: receivedRequest } = await supabase
        .from('friend_requests')
        .select()
        .eq('from_user_id', toUserId)
        .eq('to_user_id', user?.id)
        .in('status', ['pending', 'accepted'])
        .maybeSingle();

      return sentRequest || receivedRequest;
    } catch (error) {
      console.error('Error checking friend request:', error);
      return null;
    }
  };

  const handleAddFriend = async (profileId: string, username: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Check for existing friend request in both directions
      const existingRequest = await checkExistingFriendRequest(profileId);

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast.error('A friend request already exists between you and this user');
        } else {
          toast.error('You are already friends with this user');
        }
        return;
      }

      // Send friend request
      const { error: insertError } = await supabase
        .from('friend_requests')
        .insert({
          from_user_id: user.id,
          to_user_id: profileId,
          status: 'pending'
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          toast.error('A friend request already exists');
        } else {
          throw insertError;
        }
        return;
      }

      toast.success('Friend request sent!');
      setSelectedProfile(null);
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Friends</h1>
            
            <div className="relative mb-8">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={handleSearch}
                    placeholder="Search users by username"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {searchLoading && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
                  {searchResults.map((profile) => (
                    <div
                      key={profile.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => viewProfile(profile)}
                    >
                      <div className="flex items-center">
                        <User className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{profile.username}</p>
                          <p className="text-sm text-gray-500">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-700">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedProfile && (
              <motion.div
                key={selectedProfile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-6 mb-8 relative"
              >
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedProfile.username}</h2>
                    <p className="text-gray-500">Member since {new Date(selectedProfile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFriend(selectedProfile.id, selectedProfile.username)}
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {loading ? 'Sending Request...' : 'Add Friend'}
                </button>
              </motion.div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Friends</h2>
              {friends.map((friend) => (
                <motion.div
                  key={friend.id || `friend-${Date.now()}-${Math.random()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{friend.username}</h3>
                      <p className="text-sm text-gray-500 capitalize">{friend.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {friends.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                  <p className="text-gray-500">Search for users to add them as friends!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}