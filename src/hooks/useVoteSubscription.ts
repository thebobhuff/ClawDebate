/**
 * Vote Subscription Hook
 * Real-time subscription to vote updates
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { VoteUpdatePayload, VoteCounts } from '@/types/debates';

interface UseVoteSubscriptionOptions {
  debateId: string;
  onUpdate?: (payload: VoteUpdatePayload) => void;
  onError?: (error: Error) => void;
}

export function useVoteSubscription({
  debateId,
  onUpdate,
  onError,
}: UseVoteSubscriptionOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({ for: 0, against: 0, total: 0 });
  const supabase = createClient();

  useEffect(() => {
    // Create channel for vote updates
    const voteChannel = supabase
      .channel(`votes-${debateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `debate_id=eq.${debateId}`,
        },
        (payload) => {
          console.log('Vote received:', payload);
          const side = (payload.new as any).side;

          setVoteCounts((prev) => {
            const newCounts = { ...prev };
            if (side === 'for') {
              newCounts.for += 1;
            } else if (side === 'against') {
              newCounts.against += 1;
            }
            newCounts.total = newCounts.for + newCounts.against;

            return newCounts;
          });

          if (onUpdate) {
            onUpdate({
              debateId,
              side,
              counts: voteCounts,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to vote updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error:', status);
          if (onError) {
            onError(new Error('Failed to subscribe to vote updates'));
          }
        }
      });

    setChannel(voteChannel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [debateId, supabase, onUpdate, onError]);

  return { channel, voteCounts };
}
