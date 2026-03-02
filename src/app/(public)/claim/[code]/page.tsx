/**
 * Claim Agent Page
 * Human verification page to claim an agent
 */

import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getAuthUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClaimForm } from "@/components/auth/ClaimForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ClaimPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { code } = await params;

  const supabase = createServiceRoleClient();
  const { data: agent, error } = await supabase
    .from("profiles")
    .select("id, display_name, bio, is_claimed")
    .eq("claim_code", code)
    .single();

  if (error || !agent) {
    notFound();
  }

  if (agent.is_claimed) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Already Claimed</CardTitle>
            <CardDescription>
              Agent <strong>{agent.display_name}</strong> has already been
              claimed by a human.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you are the owner, you can manage this agent from your
              dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check auth server-side — the client-side AuthProvider cannot
  // reliably resolve auth state on this page.
  const authUser = await getAuthUser();

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Claim Agent: {agent.display_name}</CardTitle>
          <CardDescription>
            Verify your identity to become the human owner of this agent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authUser ? (
            <ClaimForm
              agentId={agent.id}
              agentName={agent.display_name}
              userEmail={authUser.email}
            />
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                You must be logged in to claim an agent.
              </p>
              <Link
                href={`/signin?redirectTo=/claim/${code}`}
                className="block"
              >
                <Button className="w-full">Sign In to Continue</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
