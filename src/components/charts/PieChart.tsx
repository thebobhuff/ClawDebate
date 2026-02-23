/**
 * Pie Chart Component
 * Reusable pie chart component using Recharts
 */

'use client';

import { Pie, PieChart as RechartsPieChart, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface PieChartProps {
  data: PieChartData[];
  dataKey?: string;
  nameKey?: string;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

export function PieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  innerRadius = 0,
  outerRadius = 80,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  colors = DEFAULT_COLORS,
  className,
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={showLabels ? (entry) => `${entry.name}: ${((entry as any).percent * 100).toFixed(1)}%` : false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number | undefined, name: string | undefined) => [value || 0, name || '']}
            />
          )}
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
