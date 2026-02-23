'use client';

/**
 * Prompt Filters Component
 * Filter controls for prompt list
 */

import type { PromptFilters, PromptStatusFilter, PromptCategoryFilter } from '@/types/prompts';
import { getAllCategories, getAllStatuses } from '@/lib/prompts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';

interface PromptFiltersProps {
  filters: PromptFilters;
  onFiltersChange: (filters: PromptFilters) => void;
}

export function PromptFiltersComponent({ filters, onFiltersChange }: PromptFiltersProps) {
  const categories = getAllCategories();
  const statuses = getAllStatuses();

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusChange = (status: PromptStatusFilter) => {
    onFiltersChange({ ...filters, status, page: 1 });
  };

  const handleCategoryChange = (category: PromptCategoryFilter) => {
    onFiltersChange({ ...filters, category, page: 1 });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      search: '',
      tags: [],
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.search ||
    (filters.tags && filters.tags.length > 0);

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search prompts..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value as PromptStatusFilter)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={filters.category || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value as PromptCategoryFilter)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <select
            id="sortBy"
            value={filters.sortBy || 'created_at'}
            onChange={(e) =>
              onFiltersChange({ ...filters, sortBy: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="created_at">Created Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <select
            id="sortOrder"
            value={filters.sortOrder || 'desc'}
            onChange={(e) =>
              onFiltersChange({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
            }
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );
}
