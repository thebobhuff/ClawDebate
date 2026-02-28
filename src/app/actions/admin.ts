'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { requireAdmin } from '@/lib/auth/permissions';
import {
  adminEditArgument as updateArgumentByAdminAction,
  completeDebate as completeDebateAction,
  deleteArgument as deleteArgumentAction,
  openVoting as openVotingAction,
  updateDebate as updateDebateAction,
  updateDebateStatus as updateDebateStatusAction,
} from '@/app/actions/debates';

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function banAgent(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
    const agentId = getFormString(formData, 'agentId');

    if (!agentId) {
      return;
    }

    const supabase = createServiceRoleClient();
    const { error } = await (supabase.from('profiles') as any)
      .update({
        verification_status: 'flagged',
      })
      .eq('id', agentId)
      .eq('user_type', 'agent');

    if (error) {
      console.error('Error banning agent:', error);
      return;
    }

    revalidatePath('/admin/agents');
    revalidatePath('/admin/debates');
    revalidatePath('/agent/debates');
  } catch (error) {
    console.error('Error in banAgent:', error);
  }
}

export async function unbanAgent(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
    const agentId = getFormString(formData, 'agentId');

    if (!agentId) {
      return;
    }

    const supabase = createServiceRoleClient();
    const { error } = await (supabase.from('profiles') as any)
      .update({
        verification_status: 'verified',
      })
      .eq('id', agentId)
      .eq('user_type', 'agent');

    if (error) {
      console.error('Error unbanning agent:', error);
      return;
    }

    revalidatePath('/admin/agents');
    revalidatePath('/admin/debates');
    revalidatePath('/agent/debates');
  } catch (error) {
    console.error('Error in unbanAgent:', error);
  }
}

export async function flagAgent(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
    const agentId = getFormString(formData, 'agentId');

    if (!agentId) {
      return;
    }

    const supabase = createServiceRoleClient();
    const { error } = await (supabase.from('profiles') as any)
      .update({
        verification_status: 'flagged',
      })
      .eq('id', agentId)
      .eq('user_type', 'agent');

    if (error) {
      console.error('Error flagging agent:', error);
      return;
    }

    revalidatePath('/admin/agents');
  } catch (error) {
    console.error('Error in flagAgent:', error);
  }
}

export async function removeParticipant(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
    const debateId = getFormString(formData, 'debateId');
    const participantId = getFormString(formData, 'participantId');

    if (!debateId || !participantId) {
      return;
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from('debate_participants')
      .delete()
      .eq('debate_id', debateId)
      .eq('id', participantId);

    if (error) {
      console.error('Error removing participant:', error);
      return;
    }

    revalidatePath(`/admin/debates/${debateId}`);
    revalidatePath('/admin/debates');
  } catch (error) {
    console.error('Error in removeParticipant:', error);
  }
}

export async function adminUpdateDebate(formData: FormData): Promise<void> {
  await requireAdmin();
  await updateDebateAction(formData);
}

export async function adminUpdateDebateStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  await updateDebateStatusAction(formData);
}

export async function adminOpenVoting(formData: FormData): Promise<void> {
  await requireAdmin();
  await openVotingAction(formData);
}

export async function adminCompleteDebate(formData: FormData): Promise<void> {
  await requireAdmin();
  await completeDebateAction(formData);
}

export async function adminDeleteArgument(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteArgumentAction(formData);
}

export async function adminEditArgumentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await updateArgumentByAdminAction(formData);
}
