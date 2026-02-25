'use client';

/**
 * Share Buttons Component
 * Client component to handle sharing functionality
 */

import { Button } from '@/components/ui/button';
import { Share2, Link as LinkIcon } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleCopyLink}
      >
        <LinkIcon className="h-4 w-4 mr-2" />
        Copy Link
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Debate
      </Button>
    </div>
  );
}
