import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
  description?: string;
}

export function HorizontalBarChart({ data, title, description }: HorizontalBarChartProps) {
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{
              top: 20,
              right: 30,
              left: 80,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        Casos: <span className="font-medium text-foreground">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              fill="hsl(var(--chart-1))"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}