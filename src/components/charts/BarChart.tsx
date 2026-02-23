/**
 * Bar Chart Component
 * Reusable bar chart component using Recharts
 */

'use client';

import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

export interface BarChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartData[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

export function BarChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#3b82f6',
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  className,
  layout = 'vertical',
}: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          {showXAxis && (
            <XAxis
              dataKey={layout === 'vertical' ? xAxisKey : dataKey}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              className="text-muted-foreground"
            />
          )}
          {showYAxis && (
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              className="text-muted-foreground"
            />
          )}
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
          )}
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface MultiBarChartProps extends Omit<BarChartProps, 'color'> {
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
}

export function MultiBarChart({
  data,
  bars,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  className,
  layout = 'vertical',
}: MultiBarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          {showXAxis && (
            <XAxis
              dataKey={layout === 'vertical' ? xAxisKey : bars[0].dataKey}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              className="text-muted-foreground"
            />
          )}
          {showYAxis && (
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'currentColor' }}
              className="text-muted-foreground"
            />
          )}
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
          )}
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} radius={[4, 4, 0, 0]} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
