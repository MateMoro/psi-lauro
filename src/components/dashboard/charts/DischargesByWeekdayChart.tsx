import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DischargesByWeekdayChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  title: string;
  description?: string;
}

export function DischargesByWeekdayChart({ data, title, description }: DischargesByWeekdayChartProps) {
  return (
    <Card className="shadow-medium rounded-xl lg:rounded-2xl">
      <CardHeader className="pb-3 lg:pb-4">
        <CardTitle className="text-base lg:text-lg">{title}</CardTitle>
        {description && (
          <p className="text-xs lg:text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="px-3 lg:px-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-50" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={0}
              height={30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              label={{ 
                value: 'Altas', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '10px', fill: 'hsl(var(--muted-foreground))' }
              }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        Altas: <span className="font-medium text-foreground">{data.value}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Percentual: <span className="font-medium text-foreground">{data.percentage}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#0ea5e9"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}