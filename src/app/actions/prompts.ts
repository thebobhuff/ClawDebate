'use server';

/**
 * Prompt Server Actions
 * Server-side actions for prompt management operations
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { getAuthUser } from '@/lib/auth/session';
import { checkPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import {
  createPrompt as dbCreatePrompt,
  updatePrompt as dbUpdatePrompt,
  deletePrompt as dbDeletePrompt,
  activatePrompt,
  archivePrompt as dbArchivePrompt,
  getPromptById as dbGetPromptById,
  getAllPrompts,
} from '@/lib/supabase/prompts';
import {
  createPromptSchema,
  updatePromptSchema,
  deletePromptSchema,
  publishPromptSchema,
  archivePromptSchema,
  getPromptByIdSchema,
  getPromptsFilterSchema,
  type CreatePromptInput,
  type UpdatePromptInput,
  type DeletePromptInput,
  type PublishPromptInput,
  type ArchivePromptInput,
  type GetPromptByIdInput,
  type GetPromptsFilterInput,
} from '@/lib/validations/prompts';
import type { PromptActionResponse, PromptListResponse, PromptWithDetails } from '@/types/prompts';
import type { Prompt } from '@/types/database';

// ============================================================================
// CREATE PROMPT
// ============================================================================

/**
 * Create a new prompt (admin only)
 */
export async function createPrompt(formData: CreatePromptInput): Promise<PromptActionResponse<Prompt>> {
  try {
    // Validate input
    const validatedData = createPromptSchema.parse(formData);

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canCreate = await checkPermission(Permission.CREATE_PROMPTS);
    if (!canCreate) {
      return {
        success: false,
        error: 'Permission required to create prompts',
      };
    }

    const supabase = await createClient();

    // Create prompt using database helper
    const data = await dbCreatePrompt({
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      tags: validatedData.tags,
      status: validatedData.status || 'draft',
    });

    // Revalidate prompts pages
    revalidatePath('/admin/prompts');
    revalidatePath('/admin');

    return {
      success: true,
      data: data as Prompt,
      message: 'Prompt created successfully',
    };
  } catch (error: any) {
    console.error('Error in createPrompt:', error);
    return {
      success: false,
      error: error.message || 'Failed to create prompt',
    };
  }
}

// ============================================================================
// UPDATE PROMPT
// ============================================================================

/**
 * Update an existing prompt (admin only)
 */
export async function updatePrompt(id: string, formData: Partial<UpdatePromptInput>): Promise<PromptActionResponse<Prompt>> {
  try {
    // Validate input
    const validatedData = updatePromptSchema.parse({ id, ...formData });

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return {
        success: false,
        error: 'Permission required to manage prompts',
      };
    }

    const supabase = await createClient();

    // Remove id and non-database fields from update data
    const { id: _, word_limit, time_limit, ...updateData } = validatedData;

    // Update prompt using database helper
    const data = await dbUpdatePrompt(id, updateData);

    // Revalidate prompts pages
    revalidatePath('/admin/prompts');
    revalidatePath(`/admin/prompts/${id}`);
    revalidatePath('/admin');

    return {
      success: true,
      data: data as Prompt,
      message: 'Prompt updated successfully',
    };
  } catch (error: any) {
    console.error('Error in updatePrompt:', error);
    return {
      success: false,
      error: error.message || 'Failed to update prompt',
    };
  }
}

// ============================================================================
// DELETE PROMPT
// ============================================================================

/**
 * Delete a prompt (admin only)
 */
export async function deletePrompt(id: string): Promise<PromptActionResponse> {
  try {
    // Validate input
    deletePromptSchema.parse({ id });

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return {
        success: false,
        error: 'Permission required to manage prompts',
      };
    }

    const supabase = await createClient();

    // Check if prompt has debates
    const { data: debates } = await supabase
      .from('debates')
      .select('id')
      .eq('prompt_id', id)
      .limit(1);

    if (debates && debates.length > 0) {
      return {
        success: false,
        error: 'Cannot delete prompt with existing debates. Archive it instead.',
      };
    }

    // Delete prompt using database helper
    const success = await dbDeletePrompt(id);

    if (!success) {
      return {
        success: false,
        error: 'Failed to delete prompt',
      };
    }

    // Revalidate prompts pages
    revalidatePath('/admin/prompts');
    revalidatePath('/admin');

    return {
      success: true,
      message: 'Prompt deleted successfully',
    };
  } catch (error: any) {
    console.error('Error in deletePrompt:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete prompt',
    };
  }
}

// ============================================================================
// PUBLISH PROMPT
// ============================================================================

/**
 * Publish a prompt (change status to active) (admin only)
 */
export async function publishPrompt(id: string): Promise<PromptActionResponse<Prompt>> {
  try {
    // Validate input
    publishPromptSchema.parse({ id });

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return {
        success: false,
        error: 'Permission required to manage prompts',
      };
    }

    const supabase = await createClient();

    // Publish prompt using database helper
    const data = await activatePrompt(id);

    // Revalidate prompts pages
    revalidatePath('/admin/prompts');
    revalidatePath(`/admin/prompts/${id}`);
    revalidatePath('/admin');

    return {
      success: true,
      data: data as Prompt,
      message: 'Prompt published successfully',
    };
  } catch (error: any) {
    console.error('Error in publishPrompt:', error);
    return {
      success: false,
      error: error.message || 'Failed to publish prompt',
    };
  }
}

// ============================================================================
// ARCHIVE PROMPT
// ============================================================================

/**
 * Archive a prompt (admin only)
 */
export async function archivePrompt(id: string): Promise<PromptActionResponse<Prompt>> {
  try {
    // Validate input
    archivePromptSchema.parse({ id });

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return {
        success: false,
        error: 'Permission required to manage prompts',
      };
    }

    const supabase = await createClient();

    // Archive prompt using database helper
    const data = await dbArchivePrompt(id);

    // Revalidate prompts pages
    revalidatePath('/admin/prompts');
    revalidatePath(`/admin/prompts/${id}`);
    revalidatePath('/admin');

    return {
      success: true,
      data: data as Prompt,
      message: 'Prompt archived successfully',
    };
  } catch (error: any) {
    console.error('Error in archivePrompt:', error);
    return {
      success: false,
      error: error.message || 'Failed to archive prompt',
    };
  }
}

// ============================================================================
// GET PROMPTS
// ============================================================================

/**
 * Get filtered list of prompts (admin only)
 */
export async function getPrompts(filters?: GetPromptsFilterInput): Promise<PromptActionResponse<PromptListResponse>> {
  try {
    // Validate filters
    const validatedFilters = getPromptsFilterSchema.parse(filters || {});

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canView = await checkPermission(Permission.VIEW_PROMPTS);
    if (!canView) {
      return {
        success: false,
        error: 'Permission required to view prompts',
      };
    }

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .order(validatedFilters.sortBy || 'created_at', { ascending: validatedFilters.sortOrder === 'asc' });

    // Apply filters
    if (validatedFilters.status && validatedFilters.status !== 'all') {
      query = query.eq('status', validatedFilters.status);
    }

    if (validatedFilters.category && validatedFilters.category !== 'all') {
      query = query.eq('category', validatedFilters.category);
    }

    if (validatedFilters.search) {
      query = query.or(`title.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`);
    }

    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      query = query.contains('tags', validatedFilters.tags);
    }

    // Get total count before pagination
    const { count: total, error: countError } = await query;

    if (countError) {
      console.error('Error counting prompts:', countError);
      return {
        success: false,
        error: countError.message || 'Failed to count prompts',
      };
    }

    // Apply pagination
    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 20;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching prompts:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch prompts',
      };
    }

    const totalPages = Math.ceil((total || 0) / limit);

    return {
      success: true,
      data: {
        prompts: (data || []) as Prompt[],
        total: total || 0,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error: any) {
    console.error('Error in getPrompts:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch prompts',
    };
  }
}

// ============================================================================
// GET PROMPT BY ID
// ============================================================================

/**
 * Get a single prompt by ID with details (admin only)
 */
export async function getPromptById(id: string): Promise<PromptActionResponse<PromptWithDetails>> {
  try {
    // Validate input
    getPromptByIdSchema.parse({ id });

    // Check admin permission
    const authUser = await getAuthUser();

    if (!authUser) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const canView = await checkPermission(Permission.VIEW_PROMPTS);
    if (!canView) {
      return {
        success: false,
        error: 'Permission required to view prompts',
      };
    }

    const supabase = await createClient();

    // Get prompt using database helper
    const prompt = await dbGetPromptById(id);

    if (!prompt) {
      return {
        success: false,
        error: 'Prompt not found',
      };
    }

    // Get prompt debates
    const { data: debates } = await supabase
      .from('debates')
      .select(`
        *,
        stats:debate_stats (for_votes, against_votes, total_arguments)
      `)
      .eq('prompt_id', id);

    // Calculate stats
    const totalDebates = (debates as any[])?.length || 0;
    const activeDebates = (debates as any[])?.filter((d: any) => d.status === 'active').length || 0;
    const completedDebates = (debates as any[])?.filter((d: any) => d.status === 'completed').length || 0;
    let totalArguments = 0;
    let totalVotes = 0;

    (debates as any[])?.forEach((debate: any) => {
      if (debate.stats) {
        totalArguments += debate.stats.total_arguments || 0;
        totalVotes += (debate.stats.for_votes || 0) + (debate.stats.against_votes || 0);
      }
    });

    const promptWithDetails: PromptWithDetails = {
      ...(prompt as Prompt),
      stats: {
        id,
        totalDebates,
        activeDebates,
        completedDebates,
        totalArguments,
        totalVotes,
      },
      createdAt: (prompt as any).created_at,
      updatedAt: (prompt as any).updated_at,
    };

    return {
      success: true,
      data: promptWithDetails,
    };
  } catch (error: any) {
    console.error('Error in getPromptById:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch prompt',
    };
  }
}

// ============================================================================
// HELPER ACTIONS
// ============================================================================

/**
 * Create prompt and redirect (for form submissions)
 */
export async function createPromptAndRedirect(formData: CreatePromptInput) {
  const result = await createPrompt(formData);

  if (!result.success) {
    return { error: result.error };
  }

  redirect('/admin/prompts');
}

/**
 * Update prompt and redirect (for form submissions)
 */
export async function updatePromptAndRedirect(id: string, formData: Partial<UpdatePromptInput>) {
  const result = await updatePrompt(id, formData);

  if (!result.success) {
    return { error: result.error };
  }

  redirect('/admin/prompts');
}

/**
 * Delete prompt and redirect (for form submissions)
 */
export async function deletePromptAndRedirect(id: string) {
  const result = await deletePrompt(id);

  if (!result.success) {
    return { error: result.error };
  }

  redirect('/admin/prompts');
}
