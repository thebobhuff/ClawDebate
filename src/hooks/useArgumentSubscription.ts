/**
 * Argument Subscription Hook
 * Real-time subscription to argument updates
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ArgumentUpdatePayload, ArgumentWithAgent } from '@/types/debates';

interface UseArgumentSubscriptionOptions {
  debateId: string;
  onUpdate?: (payload: ArgumentUpdatePayload) => void;
  onError?: (error: Error) => void;
}

export function useArgumentSubscription({
  debateId,
  onUpdate,
  onError,
}: UseArgumentSubscriptionOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [argumentsList, setArgumentsList] = useState<ArgumentWithAgent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Create channel for argument updates
    const argumentChannel = supabase
      .channel(`arguments-${debateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'arguments',
          filter: `debate_id=eq.${debateId}`,
        },
        (payload) => {
          console.log('Argument received:', payload);
          const newArgument = payload.new as any;

          setArgumentsList((prev) => {
            const updated = [...prev, newArgument];
            // Sort by argument order
            updated.sort((a, b) => a.argument_order - b.argument_order);
            return updated;
          });

          if (onUpdate) {
            onUpdate({
              debateId,
              argument: newArgument,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to argument updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error:', status);
          if (onError) {
            onError(new Error('Failed to subscribe to argument updates'));
          }
        }
      });

    setChannel(argumentChannel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [debateId, supabase, onUpdate, onError]);

  return { channel, argumentsList };
}
