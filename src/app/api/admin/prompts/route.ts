/**
 * Prompts API Routes
 * GET /api/admin/prompts - List all prompts
 * POST /api/admin/prompts - Create a new prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { checkPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import {
  createPromptSchema,
  getPromptsFilterSchema,
  type CreatePromptInput,
  type GetPromptsFilterInput,
} from '@/lib/validations/prompts';
import { createPrompt, getPrompts } from '@/app/actions/prompts';

/**
 * GET /api/admin/prompts
 * List all prompts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permission
    const canView = await checkPermission(Permission.VIEW_PROMPTS);
    if (!canView) {
      return NextResponse.json(
        { success: false, error: 'Permission required to view prompts' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: GetPromptsFilterInput = {
      status: (searchParams.get('status') as any) || 'all',
      category: (searchParams.get('category') as any) || 'all',
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
      sortBy: (searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    // Parse tags if provided
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam.split(',').map((t) => t.trim());
    }

    // Validate filters
    const validatedFilters = getPromptsFilterSchema.parse(filters);

    // Get prompts
    const result = await getPrompts(validatedFilters);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/admin/prompts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/prompts
 * Create a new prompt
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permission
    const canCreate = await checkPermission(Permission.CREATE_PROMPTS);
    if (!canCreate) {
      return NextResponse.json(
        { success: false, error: 'Permission required to create prompts' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = createPromptSchema.parse(body);

    // Create prompt
    const result = await createPrompt(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/admin/prompts:', error);

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
