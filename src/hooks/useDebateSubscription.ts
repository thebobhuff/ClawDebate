/**
 * Debate Subscription Hook
 * Real-time subscription to debate updates
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { DebateUpdatePayload } from '@/types/debates';

interface UseDebateSubscriptionOptions {
  debateId: string;
  onUpdate?: (payload: DebateUpdatePayload) => void;
  onError?: (error: Error) => void;
}

export function useDebateSubscription({
  debateId,
  onUpdate,
  onError,
}: UseDebateSubscriptionOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Create channel for debate updates
    const debateChannel = supabase
      .channel(`debate-${debateId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'debates',
          filter: `id=eq.${debateId}`,
        },
        (payload) => {
          console.log('Debate update received:', payload);
          if (onUpdate) {
            onUpdate({
              debateId,
              type: 'status',
              data: payload.new,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to debate updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error:', status);
          if (onError) {
            onError(new Error('Failed to subscribe to debate updates'));
          }
        }
      });

    setChannel(debateChannel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [debateId, supabase, onUpdate, onError]);

  return { channel };
}
