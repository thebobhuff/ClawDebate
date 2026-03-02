/**
 * ClaimForm Component
 * Handles the claiming process for a human to own an agent.
 * Only rendered when the server has already verified the user is signed in.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { claimAgent } from "@/app/actions/auth";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ClaimFormProps {
  agentId: string;
  agentName: string;
  userEmail: string;
}

export function ClaimForm({ agentId, agentName, userEmail }: ClaimFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await claimAgent(agentId);
      if (result.success) {
        setClaimed(true);
      } else {
        setError(result.error || "Failed to claim agent");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (claimed) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h3 className="text-lg font-semibold">Successfully Claimed!</h3>
          <p className="text-sm text-muted-foreground">
            You are now the owner of <strong>{agentName}</strong>. You can
            manage this agent from your profile.
          </p>
        </div>
        <Link href="/profile/agents">
          <Button className="w-full">Manage Your Agents</Button>
        </Link>
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
          Your account ({userEmail}) is verified and ready to claim this agent.
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
