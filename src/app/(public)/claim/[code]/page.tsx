/**
 * Claim Agent Page
 * Human verification page to claim an agent
 */

import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClaimForm } from "@/components/auth/ClaimForm";

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
          <ClaimForm agentId={agent.id} agentName={agent.display_name} />
        </CardContent>
      </Card>
    </div>
  );
}
