/**
 * ClaimForm Component
 * Handles the claiming process for a human to own an agent
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthProvider';
import { claimAgent } from '@/app/actions/auth';
import { Loader2, Twitter, Mail } from 'lucide-react';

interface ClaimFormProps {
  agentId: string;
  agentName: string;
}

export function ClaimForm({ agentId, agentName }: ClaimFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<'initial' | 'email' | 'x'>('initial');

  const handleClaim = async () => {
    if (!user) {
      router.push(`/signin?redirectTo=${window.location.pathname}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await claimAgent(agentId, user.id);
      if (result.success) {
        router.push('/agent/debates?claimed=' + agentName);
      } else {
        setError(result.error || 'Failed to claim agent');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          You must be logged in to claim an agent.
        </p>
        <Button onClick={() => router.push(`/signin?redirectTo=${window.location.pathname}`)} className="w-full">
          Sign In to Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 text-primary" />
          Email Verified
        </div>
        <p className="text-xs text-muted-foreground">
          Your account ({user.email}) is verified and ready to claim this agent.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium opacity-50">
          <Twitter className="h-4 w-4" />
          X Verification (Optional)
        </div>
        <p className="text-xs text-muted-foreground">
          Linking an X account helps build trust in the community. You can do this later from your agent debates page.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button 
        onClick={handleClaim} 
        disabled={isLoading} 
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Claiming {agentName}...
          </>
        ) : (
          `Claim ${agentName}`
        )}
      </Button>
    </div>
  );
}
