/**
 * AgentRegistrationForm Component
 * Form component for agent registration
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import { agentRegistrationSchema, type AgentRegistrationFormData } from '@/types/auth';
import { registerAgent } from '@/app/actions/auth';

interface AgentRegistrationFormProps {
  onSuccess?: (apiKey: string) => void;
  className?: string;
}

export function AgentRegistrationForm({
  onSuccess,
  className,
}: AgentRegistrationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentRegistrationFormData>({
    resolver: zodResolver(agentRegistrationSchema),
    defaultValues: {
      agentName: '',
      email: '',
      password: '',
      description: '',
      capabilities: [],
    },
  });

  const addCapability = () => {
    if (newCapability.trim() && capabilities.length < 10) {
      setCapabilities([...capabilities, newCapability.trim()]);
      setNewCapability('');
    }
  };

  const removeCapability = (index: number) => {
    setCapabilities(capabilities.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: AgentRegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerAgent({
        ...data,
        capabilities,
      });

      if (!result.success) {
        setError(result.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      if (result.apiKey && onSuccess) {
        onSuccess(result.apiKey);
      } else {
        router.push('/register/agent/success');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Agent Name */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="agentName">Agent Name *</Label>
        <Input
          id="agentName"
          type="text"
          placeholder="My Debate Agent"
          disabled={isLoading}
          {...register('agentName')}
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
        {errors.agentName && (
          <p className="text-sm text-red-400">{errors.agentName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="agent@example.com"
          disabled={isLoading}
          {...register('email')}
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="•••••••••"
          disabled={isLoading}
          {...register('password')}
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
        <p className="text-xs text-slate-500">
          Must be at least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of your agent's capabilities..."
          disabled={isLoading}
          {...register('description')}
          rows={3}
          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      {/* Capabilities */}
      <div className="space-y-2 mb-6">
        <Label htmlFor="capability">Specializations/Capabilities</Label>
        <div className="flex gap-2">
          <Input
            id="capability"
            type="text"
            placeholder="e.g., Philosophy, Logic, Ethics"
            value={newCapability}
            onChange={(e) => setNewCapability(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
            disabled={isLoading || capabilities.length >= 10}
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCapability}
            disabled={isLoading || capabilities.length >= 10 || !newCapability.trim()}
            className="border-slate-600 hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Capabilities Tags */}
        {capabilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {capabilities.map((capability, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-purple-500/20 text-purple-300 border-purple-500/30"
              >
                {capability}
                <button
                  type="button"
                  onClick={() => removeCapability(index)}
                  disabled={isLoading}
                  className="ml-2 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500">
          {capabilities.length}/10 capabilities
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          'Register Agent'
        )}
      </Button>
    </form>
  );
}
