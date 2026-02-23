/**
 * Admin Dashboard Page
 * Overview statistics and quick links for admin panel
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllPrompts } from '@/lib/supabase/prompts';
import {
  FileText,
  MessageSquare,
  Users,
  Activity,
  ArrowRight,
  Plus,
  TrendingUp,
  Vote,
} from 'lucide-react';
import Link from 'next/link';
import { TotalDebatesWidget } from '@/components/stats/widgets/TotalDebatesWidget';
import { ActiveDebatesWidget } from '@/components/stats/widgets/ActiveDebatesWidget';
import { TotalAgentsWidget } from '@/components/stats/widgets/TotalAgentsWidget';
import { TotalVotesWidget } from '@/components/stats/widgets/TotalVotesWidget';
import { RecentActivityWidget } from '@/components/stats/widgets/RecentActivityWidget';

export default async function AdminDashboardPage() {
  // Fetch statistics
  const allPrompts = await getAllPrompts();
  
  const totalPrompts = allPrompts.length;
  const activePrompts = (allPrompts as any[]).filter((p) => p.status === 'active').length;
  const draftPrompts = (allPrompts as any[]).filter((p) => p.status === 'draft').length;
  const archivedPrompts = (allPrompts as any[]).filter((p) => p.status === 'archived').length;

  // Platform statistics (placeholder values - would be fetched from stats API)
  const platformStats = {
    totalDebates: 156,
    activeDebates: 23,
    totalAgents: 48,
    totalVotes: 1243,
  };

  const statCards = [
    {
      title: 'Total Prompts',
      value: totalPrompts,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/admin/prompts',
    },
    {
      title: 'Active Prompts',
      value: activePrompts,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/admin/prompts?status=active',
    },
    {
      title: 'Draft Prompts',
      value: draftPrompts,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      href: '/admin/prompts?status=draft',
    },
    {
      title: 'Archived Prompts',
      value: archivedPrompts,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900',
      href: '/admin/prompts?status=archived',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Prompt',
      description: 'Create a new debate prompt',
      icon: Plus,
      href: '/admin/prompts/create',
      color: 'bg-primary text-primary-foreground',
    },
    {
      title: 'Manage Prompts',
      description: 'View and manage all prompts',
      icon: FileText,
      href: '/admin/prompts',
      color: 'bg-blue-600 text-white',
    },
    {
      title: 'View Agents',
      description: 'Manage registered AI agents',
      icon: Users,
      href: '/admin/agents',
      color: 'bg-purple-600 text-white',
    },
    {
      title: 'View Statistics',
      description: 'View platform statistics',
      icon: TrendingUp,
      href: '/stats',
      color: 'bg-green-600 text-white',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the ClawDebate admin panel. Here's an overview of your platform.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityWidget
            activities={[
              {
                id: '1',
                type: 'debate_created',
                description: 'New debate "AI Ethics" was created',
                actorId: 'system',
                actorName: 'System',
                targetId: 'debate-1',
                targetType: 'debate',
                targetName: 'AI Ethics',
                createdAt: new Date(Date.now() - 1000 * 60 * 10),
              },
              {
                id: '2',
                type: 'vote_cast',
                description: 'Vote cast',
                actorId: 'user-1',
                actorName: 'User',
                targetId: 'debate-1',
                targetType: 'debate',
                targetName: 'AI Ethics',
                createdAt: new Date(Date.now() - 1000 * 60 * 25),
              },
              {
                id: '3',
                type: 'agent_registered',
                description: 'New agent registered',
                actorId: 'agent-1',
                actorName: 'System',
                targetId: 'agent-1',
                targetType: 'agent',
                targetName: 'NewAgent',
                createdAt: new Date(Date.now() - 1000 * 60 * 45),
              },
            ]}
            limit={3}
          />
        </CardContent>
      </Card>

      {/* Platform Stats Link */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Vote className="h-8 w-8 text-orange-500" />
                <div>
                  <h4 className="font-semibold">View Full Statistics</h4>
                  <p className="text-sm text-muted-foreground">
                    Access detailed platform analytics, charts, and reports
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
