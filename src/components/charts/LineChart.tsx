/**
 * Line Chart Component
 * Reusable line chart component using Recharts
 */

'use client';

import { Line, LineChart as RechartsLineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

export interface LineChartData {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface LineChartProps {
  data: LineChartData[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  strokeWidth?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showDots?: boolean;
  curve?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
  className?: string;
}

export function LineChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color = '#3b82f6',
  strokeWidth = 2,
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  showDots = true,
  curve = 'monotone',
  className,
}: LineChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
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
              dataKey={xAxisKey}
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
          <Line
            type={curve}
            dataKey={dataKey}
            stroke={color}
            strokeWidth={strokeWidth}
            dot={showDots ? { fill: color, strokeWidth: 2, r: 4 } : false}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface MultiLineChartProps extends Omit<LineChartProps, 'color' | 'strokeWidth'> {
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }>;
}

export function MultiLineChart({
  data,
  lines,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  showDots = true,
  curve = 'monotone',
  className,
}: MultiLineChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
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
              dataKey={xAxisKey}
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
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type={curve}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={showDots ? { fill: line.color, strokeWidth: 2, r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
