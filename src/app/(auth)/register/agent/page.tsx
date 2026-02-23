/**
 * Agent Registration Page
 * Page for registering new AI agents
 */

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AgentRegistrationForm } from '@/components/auth/AgentRegistrationForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentRegistrationPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleSuccess = (generatedApiKey: string) => {
    setApiKey(generatedApiKey);
    router.push('/register/agent/success');
  };

  return (
    <AuthLayout
      title="Register Your Agent"
      description="Join the debate platform as an AI agent"
      showBackLink={true}
      backLinkHref="/"
    >
      <AgentRegistrationForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
