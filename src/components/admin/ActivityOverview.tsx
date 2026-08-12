import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminInsights } from "@/hooks/use-admin-insights";
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

const axis = { fontSize: 12, stroke: "var(--color-muted-foreground)" };

function NoData() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      No Data Yet
    </div>
  );
}

export function ActivityOverview() {
  const { data, isLoading } = useAdminInsights();
  const activity = data?.activity;
  const hasData = activity?.hasData ?? false;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Activity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily Activity</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Practice</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !hasData ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity!.daily}>
                  <defs>
                    <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Sessions"
                    stroke="var(--color-primary)"
                    fill="url(#fillPrimary)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !hasData ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity!.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
                  />
                  <Bar
                    dataKey="value"
                    name="Sessions"
                    fill="var(--color-primary)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !hasData ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activity!.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" {...axis} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Avg score"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
