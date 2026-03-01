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

function mapProfileToAuthUser(session: Session, profile: any): AuthUser {
  return {
    id: session.user.id,
    email: session.user.email || '',
    userType: profile.user_type,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    agentApiKey: profile.agent_api_key,
    agentCapabilities: profile.agent_capabilities as Record<string, any> | null,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

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
    const supabase = createClient();

    async function syncUser(nextSession: Session | null) {
      setSession(nextSession);

      if (!nextSession) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', nextSession.user.id)
          .single();

        if (profile) {
          setUser(mapProfileToAuthUser(nextSession, profile));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    async function bootstrapAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        await syncUser(data.session ?? initialSession);
      } catch (error) {
        console.error('Error bootstrapping auth state:', error);
        await syncUser(initialSession);
      }
    }

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      await syncUser(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialSession]);

  const refreshAuth = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setSession(null);
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
        setSession(session);
        setUser(mapProfileToAuthUser(session, profile));
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
