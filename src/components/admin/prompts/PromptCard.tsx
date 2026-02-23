/**
 * Prompt Card Component
 * Card component for individual prompt
 */

import { Prompt } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromptStatusBadge } from './PromptStatusBadge';
import { getCategoryColor, formatCategory, getRelativeTime, truncateText } from '@/lib/prompts';
import { Edit, Trash2, Eye, Archive, CheckCircle } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onView?: (id: string) => void;
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onView,
}: PromptCardProps) {
  const isDraft = prompt.status === 'draft';
  const isActive = prompt.status === 'active';
  const isArchived = prompt.status === 'archived';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{prompt.title}</CardTitle>
          <PromptStatusBadge status={prompt.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Category */}
        <div>
          <Badge className={getCategoryColor(prompt.category as any)}>
            {formatCategory(prompt.category as any)}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {truncateText(prompt.description, 150)}
        </p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prompt.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-muted-foreground">
          Created {getRelativeTime(prompt.created_at)}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(prompt.id)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {onEdit && (isDraft || isArchived) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(prompt.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onPublish && isDraft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPublish(prompt.id)}
              className="flex-1 text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          {onArchive && isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(prompt.id)}
              className="flex-1 text-orange-600 hover:text-orange-700"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
          )}
          {onDelete && isDraft && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(prompt.id)}
              className="flex-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
