/**
 * Anonymous Voting Utilities
 * Utilities for managing anonymous voting sessions and restrictions
 */

import { generateSessionId, hasExceededVoteLimit, hasExceededIPLimit } from '@/lib/voting';
import type { AnonymousVoteSession } from '@/types/voting';

const ANONYMOUS_SESSION_COOKIE = 'anonymous_session';
const ANONYMOUS_SESSION_KEY = 'anonymous_session_data';
const MAX_VOTES_PER_SESSION = 10;
const MAX_VOTES_PER_IP = 5;

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get or create anonymous session
 */
export function getOrCreateAnonymousSession(): AnonymousVoteSession {
  if (typeof window === 'undefined') {
    return {
      sessionId: generateSessionId(),
      votesCast: 0,
      maxVotes: MAX_VOTES_PER_SESSION,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
  }

  // Try to get existing session from localStorage
  const existingSession = localStorage.getItem(ANONYMOUS_SESSION_KEY);

  if (existingSession) {
    try {
      const session: AnonymousVoteSession = JSON.parse(existingSession);
      return session;
    } catch (error) {
      console.error('Error parsing anonymous session:', error);
    }
  }

  // Create new session
  const newSession: AnonymousVoteSession = {
    sessionId: generateSessionId(),
    votesCast: 0,
    maxVotes: MAX_VOTES_PER_SESSION,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };

  localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(newSession));

  return newSession;
}

/**
 * Update anonymous session
 */
export function updateAnonymousSession(session: AnonymousVoteSession): void {
  if (typeof window === 'undefined') return;

  session.lastActivityAt = new Date().toISOString();
  localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(session));
}

/**
 * Increment vote count for anonymous session
 */
export function incrementAnonymousVoteCount(): AnonymousVoteSession | null {
  const session = getOrCreateAnonymousSession();

  if (hasExceededVoteLimit(session.votesCast, session.maxVotes)) {
    return null;
  }

  session.votesCast += 1;
  updateAnonymousSession(session);

  return session;
}

/**
 * Check if anonymous user can vote
 */
export function canAnonymousUserVote(): { canVote: boolean; reason?: string; votesRemaining: number } {
  const session = getOrCreateAnonymousSession();
  const votesRemaining = session.maxVotes - session.votesCast;

  if (hasExceededVoteLimit(session.votesCast, session.maxVotes)) {
    return {
      canVote: false,
      reason: `You have reached your vote limit (${session.maxVotes} votes per session)`,
      votesRemaining: 0,
    };
  }

  return {
    canVote: true,
    votesRemaining,
  };
}

/**
 * Clear anonymous session
 */
export function clearAnonymousSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ANONYMOUS_SESSION_KEY);
}

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Set anonymous session cookie
 */
export function setAnonymousSessionCookie(sessionId: string): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days

  document.cookie = `${ANONYMOUS_SESSION_COOKIE}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Get anonymous session cookie
 */
export function getAnonymousSessionCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${ANONYMOUS_SESSION_COOKIE}=`)
  );

  return sessionCookie ? sessionCookie.split('=')[1] : null;
}

/**
 * Clear anonymous session cookie
 */
export function clearAnonymousSessionCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${ANONYMOUS_SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// ============================================================================
// IP-BASED RESTRICTIONS
// ============================================================================

/**
 * Check IP-based vote limit (server-side)
 * Note: This is a placeholder implementation. In production, you would use
 * a proper rate-limiting solution like Redis or a database-backed counter.
 */
export async function checkIPVoteLimit(ipAddress: string): Promise<boolean> {
  // This would typically be implemented server-side
  // For now, we'll return true (allow voting)
  return true;
}

/**
 * Record IP vote (server-side)
 * Note: This is a placeholder implementation.
 */
export async function recordIPVote(ipAddress: string, debateId: string): Promise<void> {
  // This would typically be implemented server-side
  // For now, we'll do nothing
}

// ============================================================================
// AUTHENTICATION PROMPT
// ============================================================================

/**
 * Check if we should prompt anonymous user to authenticate
 */
export function shouldPromptForAuthentication(): boolean {
  const session = getOrCreateAnonymousSession();

  // Prompt if user has cast more than half their votes
  return session.votesCast >= Math.floor(session.maxVotes / 2);
}

/**
 * Get authentication prompt message
 */
export function getAuthenticationPromptMessage(): string {
  const session = getOrCreateAnonymousSession();
  const votesRemaining = session.maxVotes - session.votesCast;

  if (votesRemaining === 0) {
    return 'You have reached your vote limit. Sign in to continue voting!';
  }

  return `You have ${votesRemaining} votes remaining. Sign in for unlimited voting!`;
}
