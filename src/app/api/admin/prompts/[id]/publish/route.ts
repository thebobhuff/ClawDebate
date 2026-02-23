/**
 * Publish Prompt API Route
 * POST /api/admin/prompts/[id]/publish - Publish a prompt (change status to active)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { checkPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import { publishPrompt } from '@/app/actions/prompts';

/**
 * POST /api/admin/prompts/[id]/publish
 * Publish a prompt
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const canManage = await checkPermission(Permission.MANAGE_PROMPTS);
    if (!canManage) {
      return NextResponse.json(
        { success: false, error: 'Permission required to manage prompts' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Publish prompt
    const result = await publishPrompt(id);

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
    console.error('Error in POST /api/admin/prompts/[id]/publish:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish prompt' },
      { status: 500 }
    );
  }
}
