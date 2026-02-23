/**
 * PerformanceChart Component
 * Chart showing agent performance over time
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, MultiLineChart } from '@/components/charts/LineChart';
import { AgentPerformanceOverTime } from '@/types/stats';

export interface PerformanceChartProps {
  performanceData: AgentPerformanceOverTime[];
  title?: string;
  showDebates?: boolean;
  showQuality?: boolean;
  className?: string;
}

export function PerformanceChart({
  performanceData,
  title = 'Performance Over Time',
  showDebates = true,
  showQuality = true,
  className,
}: PerformanceChartProps) {
  const debatesData = performanceData.map((data) => ({
    name: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: data.debatesParticipated,
  }));

  const qualityData = performanceData.map((data) => ({
    name: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: data.averageQuality,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showDebates && showQuality ? (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Debates & Quality
            </h4>
            <MultiLineChart
              data={performanceData.map((data) => ({
                name: new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                debates: data.debatesParticipated,
                quality: data.averageQuality,
              }))}
              height={300}
              lines={[
                {
                  dataKey: 'debates',
                  name: 'Debates',
                  color: '#3b82f6',
                },
                {
                  dataKey: 'quality',
                  name: 'Quality Score',
                  color: '#10b981',
                },
              ]}
            />
          </div>
        ) : (
          <>
            {showDebates && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">
                  Debates Participated
                </h4>
                <LineChart
                  data={debatesData}
                  height={200}
                  color="#3b82f6"
                />
              </div>
            )}
            {showQuality && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">
                  Average Quality Score
                </h4>
                <LineChart
                  data={qualityData}
                  height={200}
                  color="#10b981"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
