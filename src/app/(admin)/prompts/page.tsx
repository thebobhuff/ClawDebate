/**
 * Prompts Dashboard Page
 * List all prompts with filtering and search
 */

import { Suspense } from 'react';
import { PromptListComponent } from '@/components/admin/prompts/PromptList';
import { PromptFiltersComponent } from '@/components/admin/prompts/PromptFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getPrompts } from '@/app/actions/prompts';
import type { PromptFilters, PromptListResponse } from '@/types/prompts';

interface PromptsPageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  // Parse search params
  const resolvedSearchParams = await searchParams;
  const filters: PromptFilters = {
    status: (resolvedSearchParams.status as any) || 'all',
    category: (resolvedSearchParams.category as any) || 'all',
    search: resolvedSearchParams.search || undefined,
    page: parseInt(resolvedSearchParams.page || '1', 10),
    limit: parseInt(resolvedSearchParams.limit || '20', 10),
    sortBy: (resolvedSearchParams.sortBy as any) || 'created_at',
    sortOrder: (resolvedSearchParams.sortOrder as any) || 'desc',
  };

  // Fetch prompts
  const result = await getPrompts(filters);

  const promptsData: PromptListResponse = result.success
    ? result.data || { prompts: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    : { prompts: [], total: 0, page: 1, limit: 20, totalPages: 0 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground mt-2">
            Manage debate prompts for the platform
          </p>
        </div>
        <Link href="/admin/prompts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <PromptFiltersComponent
          filters={filters}
          onFiltersChange={(newFilters) => {
            // This will be handled by client-side navigation
            console.log('Filters changed:', newFilters);
          }}
        />
      </Suspense>

      {/* Prompt List */}
      <Suspense fallback={<div>Loading prompts...</div>}>
        <PromptListComponent
          prompts={promptsData.prompts}
          total={promptsData.total}
          page={promptsData.page}
          limit={promptsData.limit}
          totalPages={promptsData.totalPages}
          onPageChange={(page) => {
            // This will be handled by client-side navigation
            console.log('Page changed:', page);
          }}
          onEdit={(id) => {
            // Navigate to edit page
            window.location.href = `/admin/prompts/${id}`;
          }}
          onDelete={async (id) => {
            // Delete prompt
            if (confirm('Are you sure you want to delete this prompt?')) {
              const { deletePrompt } = await import('@/app/actions/prompts');
              const result = await deletePrompt(id);
              if (result.success) {
                window.location.reload();
              } else {
                alert(result.error || 'Failed to delete prompt');
              }
            }
          }}
          onPublish={async (id) => {
            // Publish prompt
            const { publishPrompt } = await import('@/app/actions/prompts');
            const result = await publishPrompt(id);
            if (result.success) {
              window.location.reload();
            } else {
              alert(result.error || 'Failed to publish prompt');
            }
          }}
          onArchive={async (id) => {
            // Archive prompt
            const { archivePrompt } = await import('@/app/actions/prompts');
            const result = await archivePrompt(id);
            if (result.success) {
              window.location.reload();
            } else {
              alert(result.error || 'Failed to archive prompt');
            }
          }}
          onView={(id) => {
            // Navigate to view page
            window.location.href = `/admin/prompts/${id}`;
          }}
        />
      </Suspense>
    </div>
  );
}
