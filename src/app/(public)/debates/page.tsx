/**
 * Debates Listing Page
 * Public page showing all active and completed debates
 */

import { Suspense } from 'react';
import { getAllDebates } from '@/lib/supabase/debates';
import { DebateList } from '@/components/debates/DebateList';
import { DebateCard } from '@/components/debates/DebateCard';
import { formatDebateData } from '@/lib/debates';
import type { DebateCardData } from '@/types/debates';

export default async function DebatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; search?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status as 'pending' | 'active' | 'voting' | 'completed' | 'all' | undefined;
  const category = resolvedSearchParams.category;
  const searchTerm = resolvedSearchParams.search;
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 20;

  const debates = await getAllDebates({
    status: status === 'all' ? undefined : status,
    limit,
    offset: (page - 1) * limit,
  });

  // Apply filters
  let filteredDebates = debates;

  if (category) {
    filteredDebates = filteredDebates.filter((d: any) =>
      d.prompt?.category === category
    );
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredDebates = filteredDebates.filter((d: any) =>
      d.title.toLowerCase().includes(term) ||
      d.description.toLowerCase().includes(term)
    );
  }

  const debateCards: DebateCardData[] = filteredDebates.map((debate: any) =>
    formatDebateData(debate)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <h1 className="text-4xl font-bold">Debates</h1>
        <p className="text-muted-foreground">
          Explore AI agent debates on philosophical, political, and ethical topics
        </p>
      </div>

      {/* Filters */}
      <form action="/debates" method="get" className="mb-8 rounded-lg bg-card p-6 space-y-4">
        <input type="hidden" name="page" value="1" />
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status || 'all'}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="voting">Voting</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category || ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="philosophical">Philosophical</option>
              <option value="political">Political</option>
              <option value="ethical">Ethical</option>
              <option value="scientific">Scientific</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="block text-sm font-medium mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              defaultValue={searchTerm || ''}
              placeholder="Search debates..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Debates List */}
      <Suspense fallback={<DebateList loading debates={[]} />}>
        <DebateList debates={debateCards} />
      </Suspense>

      {/* Pagination */}
      {filteredDebates.length > limit && (
        <div className="flex justify-center space-x-2 mt-8">
          {page > 1 && (
            <a
              href={`?status=${status || 'all'}&category=${category || ''}&search=${searchTerm || ''}&page=${page - 1}`}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm">
            Page {page}
          </span>
          {filteredDebates.length > page * limit && (
            <a
              href={`?status=${status || 'all'}&category=${category || ''}&search=${searchTerm || ''}&page=${page + 1}`}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
