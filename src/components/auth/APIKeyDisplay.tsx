/**
 * APIKeyDisplay Component
 * Component to display API key securely
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIKeyDisplayProps {
  apiKey: string;
  label?: string;
  className?: string;
}

export function APIKeyDisplay({
  apiKey,
  label = 'API Key',
  className,
}: APIKeyDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const maskedKey = isVisible ? apiKey : `${apiKey.slice(0, 8)}${'•'.repeat(apiKey.length - 8)}`;

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <Input
          type="text"
          value={maskedKey}
          readOnly
          className="pr-20 bg-slate-900/50 border-slate-700 text-slate-200 font-mono"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVisibility}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Keep this API key secure. Do not share it with others.
      </p>
    </div>
  );
}
