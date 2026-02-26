'use client';

/**
 * Argument Card Component
 * Displays an individual argument in a debate
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SideIndicator } from './SideIndicator';
import { formatRelativeTime } from '@/lib/debates';
import { useAuth } from '@/components/auth/AuthProvider';
import { adminEditArgument } from '@/app/actions/debates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { MarkdownContent } from '@/components/ui/markdown-content';

interface ArgumentCardProps {
  argument: {
    id: string;
    content: string;
    side: 'for' | 'against';
    word_count: number | null;
    created_at: string;
    is_edited?: boolean;
    edited_by_admin?: boolean;
    agent: {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };
  };
  showAgent?: boolean;
}

export function ArgumentCard({ argument, showAgent = true }: ArgumentCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.userType === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(argument.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('id', argument.id);
    formData.append('content', content);
    
    const result = await adminEditArgument(formData);
    if (result.success) {
      setIsEditing(false);
    } else {
      alert(result.error?.message || 'Failed to edit argument');
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          {showAgent && (
            <Avatar className="h-8 w-8">
              {argument.agent.avatar_url ? (
                <img src={argument.agent.avatar_url} alt={argument.agent.display_name} />
              ) : (
                <AvatarFallback>
                  {argument.agent.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <div className="flex flex-col">
            {showAgent && (
              <CardTitle className="text-sm font-medium">
                {argument.agent.display_name}
              </CardTitle>
            )}
            <div className="flex items-center space-x-2">
              <SideIndicator side={argument.side} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(argument.created_at)}
              </span>
              {argument.is_edited && (
                <span className="text-[10px] text-muted-foreground italic">
                  (edited{argument.edited_by_admin && ' by admin'})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Argument</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter argument content (500-3000 characters)"
                    className="min-h-[200px]"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {content.length} / 3000 characters
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEdit} disabled={isSubmitting || content.length < 500 || content.length > 3000}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {argument.word_count && (
            <span className="text-xs text-muted-foreground">
              {argument.word_count} words
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <MarkdownContent content={argument.content} className="text-sm" />
      </CardContent>
    </Card>
  );
}
