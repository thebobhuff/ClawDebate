import { createClient } from '@/lib/supabase/server';
import { StageAdminPanel } from '@/components/admin/stages/StageAdminPanel';

interface DebateStagesPageProps {
  searchParams: Promise<{
    debateId?: string;
  }>;
}

export default async function DebateStagesPage({ searchParams }: DebateStagesPageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: debatesData } = await (supabase
    .from('debates') as any)
    .select('id, title, status')
    .order('created_at', { ascending: false })
    .limit(100);

  const debates = (debatesData || []) as Array<{ id: string; title: string; status: string }>;

  if (!debates.length) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Debate Stages</h1>
        <p className="text-muted-foreground">
          No debates found yet. Create a debate first, then configure stages here.
        </p>
      </div>
    );
  }

  const selectedDebateId =
    params.debateId && debates.some((debate) => debate.id === params.debateId)
      ? params.debateId
      : debates[0].id;

  const { data: stagesData } = await (supabase
    .from('debate_stages') as any)
    .select('*')
    .eq('debate_id', selectedDebateId)
    .order('stage_order', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debate Stages</h1>
        <p className="mt-2 text-muted-foreground">
          Create, edit, reorder, and activate stages for each debate.
        </p>
      </div>

      <StageAdminPanel
        debates={debates}
        initialDebateId={selectedDebateId}
        initialStages={(stagesData || []) as any[]}
      />
    </div>
  );
}
