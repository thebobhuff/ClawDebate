'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/permissions';

type DebateStageStatus = 'pending' | 'active' | 'completed';

type DebateStageAdminInput = {
  debateId: string;
  name: string;
  description?: string;
  stageOrder: number;
  status: DebateStageStatus;
  startAt?: string | null;
  endAt?: string | null;
};

function toIsoOrNull(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function getDebateStagesAdmin(debateId: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await (supabase
      .from('debate_stages') as any)
      .select('*')
      .eq('debate_id', debateId)
      .order('stage_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message || 'Failed to fetch stages' };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Admin access required' };
  }
}

export async function createDebateStageAdmin(input: DebateStageAdminInput) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const name = input.name.trim();
    if (!name) {
      return { success: false, error: 'Stage name is required' };
    }

    if (input.stageOrder < 1) {
      return { success: false, error: 'Stage order must be at least 1' };
    }

    if (input.status === 'active') {
      await (supabase
        .from('debate_stages') as any)
        .update({ status: 'pending' })
        .eq('debate_id', input.debateId)
        .eq('status', 'active');
    }

    const { error } = await (supabase
      .from('debate_stages') as any)
      .insert({
        debate_id: input.debateId,
        name,
        description: input.description?.trim() || null,
        stage_order: input.stageOrder,
        status: input.status,
        start_at: toIsoOrNull(input.startAt),
        end_at: toIsoOrNull(input.endAt),
      });

    if (error) {
      return { success: false, error: error.message || 'Failed to create stage' };
    }

    revalidatePath('/admin/stages');
    revalidatePath('/admin');
    revalidatePath(`/agent/debates/${input.debateId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Admin access required' };
  }
}

export async function updateDebateStageAdmin(
  stageId: string,
  input: Omit<DebateStageAdminInput, 'debateId'> & { debateId: string }
) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const name = input.name.trim();
    if (!name) {
      return { success: false, error: 'Stage name is required' };
    }

    if (input.stageOrder < 1) {
      return { success: false, error: 'Stage order must be at least 1' };
    }

    if (input.status === 'active') {
      await (supabase
        .from('debate_stages') as any)
        .update({ status: 'pending' })
        .eq('debate_id', input.debateId)
        .eq('status', 'active')
        .neq('id', stageId);
    }

    const { error } = await (supabase
      .from('debate_stages') as any)
      .update({
        name,
        description: input.description?.trim() || null,
        stage_order: input.stageOrder,
        status: input.status,
        start_at: toIsoOrNull(input.startAt),
        end_at: toIsoOrNull(input.endAt),
      })
      .eq('id', stageId);

    if (error) {
      return { success: false, error: error.message || 'Failed to update stage' };
    }

    revalidatePath('/admin/stages');
    revalidatePath('/admin');
    revalidatePath(`/agent/debates/${input.debateId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Admin access required' };
  }
}

export async function deleteDebateStageAdmin(stageId: string, debateId: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await (supabase
      .from('debate_stages') as any)
      .delete()
      .eq('id', stageId);

    if (error) {
      return { success: false, error: error.message || 'Failed to delete stage' };
    }

    revalidatePath('/admin/stages');
    revalidatePath('/admin');
    revalidatePath(`/agent/debates/${debateId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Admin access required' };
  }
}

export async function setDebateStageStatusAdmin(
  stageId: string,
  debateId: string,
  status: DebateStageStatus
) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    if (status === 'active') {
      await (supabase
        .from('debate_stages') as any)
        .update({ status: 'pending' })
        .eq('debate_id', debateId)
        .eq('status', 'active')
        .neq('id', stageId);
    }

    const { error } = await (supabase
      .from('debate_stages') as any)
      .update({ status })
      .eq('id', stageId);

    if (error) {
      return { success: false, error: error.message || 'Failed to update stage status' };
    }

    revalidatePath('/admin/stages');
    revalidatePath('/admin');
    revalidatePath(`/agent/debates/${debateId}`);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Admin access required' };
  }
}
