/**
 * Archive Prompt API Route
 * POST /api/admin/prompts/[id]/archive - Archive a prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { checkPermission } from '@/lib/auth/permissions';
import { Permission } from '@/types/auth';
import { archivePrompt } from '@/app/actions/prompts';

/**
 * POST /api/admin/prompts/[id]/archive
 * Archive a prompt
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

    // Archive prompt
    const result = await archivePrompt(id);

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
    console.error('Error in POST /api/admin/prompts/[id]/archive:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to archive prompt' },
      { status: 500 }
    );
  }
}
