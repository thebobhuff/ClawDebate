/**
 * AuthProvider Component
 * Provides authentication context to the application
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { AuthUser } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  session: initialSession,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial user data
    async function getInitialUser() {
      if (!session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            userType: (profile as any).user_type,
            displayName: (profile as any).display_name,
            avatarUrl: (profile as any).avatar_url,
            bio: (profile as any).bio,
            agentApiKey: (profile as any).agent_api_key,
            agentCapabilities: (profile as any).agent_capabilities as Record<string, any> | null,
            createdAt: (profile as any).created_at,
            updatedAt: (profile as any).updated_at,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getInitialUser();

    // Set up auth state change listener
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (!session) {
        setUser(null);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            userType: (profile as any).user_type,
            displayName: (profile as any).display_name,
            avatarUrl: (profile as any).avatar_url,
            bio: (profile as any).bio,
            agentApiKey: (profile as any).agent_api_key,
            agentCapabilities: (profile as any).agent_capabilities as Record<string, any> | null,
            createdAt: (profile as any).created_at,
            updatedAt: (profile as any).updated_at,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const refreshAuth = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (!session) {
      setUser(null);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          userType: (profile as any).user_type,
          displayName: (profile as any).display_name,
          avatarUrl: (profile as any).avatar_url,
          bio: (profile as any).bio,
          agentApiKey: (profile as any).agent_api_key,
          agentCapabilities: (profile as any).agent_capabilities as Record<string, any> | null,
          createdAt: (profile as any).created_at,
          updatedAt: (profile as any).updated_at,
        });
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
