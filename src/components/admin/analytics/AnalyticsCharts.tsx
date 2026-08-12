import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Point {
  label: string;
  value: number;
}

const axis = { fontSize: 12, stroke: "var(--color-muted-foreground)" };
const tooltipStyle = { borderRadius: 8, border: "1px solid var(--color-border)" };

export function NoData({ label = "No Data Yet" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function ChartCard({
  title,
  isLoading,
  hasData,
  children,
  height = "h-64",
}: {
  title: string;
  isLoading: boolean;
  hasData: boolean;
  children: ReactNode;
  height?: string;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={height}>
          {isLoading ? <Skeleton className="h-full w-full" /> : !hasData ? <NoData /> : children}
        </div>
      </CardContent>
    </Card>
  );
}

export function AreaChartView({ data, name }: { data: Point[]; name: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={24} {...axis} />
        <YAxis allowDecimals={false} {...axis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="value"
          name={name}
          stroke="var(--color-primary)"
          fill="url(#analyticsFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartView({
  data,
  name,
  horizontal = false,
}: {
  data: Point[];
  name: string;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} {...axis} />
            <YAxis type="category" dataKey="label" width={140} {...axis} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={16} {...axis} />
            <YAxis allowDecimals={false} {...axis} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          dataKey="value"
          name={name}
          fill="var(--color-primary)"
          radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartView({ data, name }: { data: Point[]; name: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={24} {...axis} />
        <YAxis allowDecimals={false} {...axis} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          name={name}
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
