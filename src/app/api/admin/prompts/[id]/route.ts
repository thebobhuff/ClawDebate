/**
 * Prompt ID API Routes
 * GET /api/admin/prompts/[id] - Get a single prompt
 * PATCH /api/admin/prompts/[id] - Update a prompt
 * DELETE /api/admin/prompts/[id] - Delete a prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { checkPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import {
  updatePromptSchema,
  getPromptByIdSchema,
  type UpdatePromptInput,
} from '@/lib/validations/prompts';
import { updatePrompt, deletePrompt, getPromptById } from '@/app/actions/prompts';

/**
 * GET /api/admin/prompts/[id]
 * Get a single prompt by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Validate input
    getPromptByIdSchema.parse({ id });

    // Get prompt
    const result = await getPromptById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/admin/prompts/[id]:', error);

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
      { success: false, error: error.message || 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/prompts/[id]
 * Update a prompt
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permission
    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Permission required to manage prompts' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validatedData = updatePromptSchema.parse({ id, ...body });

    // Update prompt
    const result = await updatePrompt(id, validatedData);

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
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/prompts/[id]:', error);

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
      { success: false, error: error.message || 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/prompts/[id]
 * Delete a prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check authentication
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permission
    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Permission required to manage prompts' },
        { status: 403 }
      );
    }

    // Delete prompt
    const result = await deletePrompt(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/prompts/[id]:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
