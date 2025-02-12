import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('No user data returned');

    // Create profile after successful signup
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: authData.user.id, 
        username, 
        email 
      }]);
    
    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }
  };

  const signIn = async (identifier: string, password: string) => {
    // Try email login first
    const { error: emailError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (emailError) {
      // If email login fails, try username login
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

      if (profileError) throw emailError; // Use original error if username not found

      // Try login with found email
      const { error: finalError } = await supabase.auth.signInWithPassword({
        email: profiles.email,
        password,
      });

      if (finalError) throw finalError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}