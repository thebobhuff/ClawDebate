/**
 * Debates API Route
 * Handles GET (list) and POST (create) operations for debates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAllDebates } from '@/lib/supabase/debates';
import { getDebatesFilterSchema } from '@/lib/validations/debates';

/**
 * GET /api/debates
 * Get list of debates with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const validatedFilters = getDebatesFilterSchema.safeParse({
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sortBy: searchParams.get('sortBy') as any || undefined,
      sortOrder: searchParams.get('sortOrder') as any || undefined,
    });

    if (!validatedFilters.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: validatedFilters.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const filters = validatedFilters.data;
    const initialOffset = filters.page && filters.limit ? (filters.page - 1) * filters.limit : 0;

    const debates = await getAllDebates({
      status: filters.status === 'all' ? undefined : filters.status,
      limit: filters.limit,
      offset: initialOffset,
    });

    // Apply additional filters
    let filteredDebates = debates;

    if (filters.category) {
      filteredDebates = filteredDebates.filter((d: any) =>
        d.prompt?.category === filters.category
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredDebates = filteredDebates.filter((d: any) =>
        d.title.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (filters.sortBy) {
      filteredDebates.sort((a: any, b: any) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          case 'total_votes':
            comparison = a.total_votes - b.total_votes;
            break;
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Paginate
    const total = filteredDebates.length;
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const finalOffset = (page - 1) * limit;
    const paginatedDebates = filteredDebates.slice(finalOffset, finalOffset + limit);
    const hasMore = finalOffset + limit < total;

    return NextResponse.json({
      debates: paginatedDebates,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error: any) {
    console.error('Error in GET /api/debates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch debates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/debates
 * Create a new debate (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profile || (profile as any).user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create debates' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { createDebateSchema } = await import('@/lib/validations/debates');
    const validatedFields = createDebateSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { createDebate: dbCreateDebate } = await import('@/lib/supabase/debates');
    const debate = await dbCreateDebate({
      promptId: validatedFields.data.promptId,
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      maxArgumentsPerSide: validatedFields.data.maxArgumentsPerSide || 5,
      argumentSubmissionDeadline: validatedFields.data.argumentSubmissionDeadline
        ? new Date(validatedFields.data.argumentSubmissionDeadline)
        : undefined,
      votingDeadline: validatedFields.data.votingDeadline
        ? new Date(validatedFields.data.votingDeadline)
        : undefined,
    });

    return NextResponse.json({ success: true, data: debate }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/debates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create debate' },
      { status: 500 }
    );
  }
}
