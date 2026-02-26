/**
 * Donut Chart Component
 * Reusable donut chart component using Recharts
 */

'use client';

import { Pie, PieChart as RechartsPieChart, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { PieChartData, PieChartProps } from './PieChart';

export interface DonutChartProps extends Omit<PieChartProps, 'innerRadius'> {
  innerRadius?: number;
  centerText?: {
    value: string | number;
    label?: string;
  };
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

export function DonutChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  innerRadius = 60,
  outerRadius = 80,
  height = 300,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  colors = DEFAULT_COLORS,
  centerText,
  className,
}: DonutChartProps) {
  return (
    <div className={cn('w-full relative', className)} style={{ height }}>
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
              formatter={(value: any, name: any) => [value || 0, name || '']}
            />
          )}
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
      {centerText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-foreground">{centerText.value}</span>
          {centerText.label && (
            <span className="text-sm text-muted-foreground mt-1">{centerText.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
