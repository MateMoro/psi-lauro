import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HorizontalBarChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title: string;
  description?: string;
}

export function HorizontalBarChart({ data, title, description }: HorizontalBarChartProps) {
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              width={70}
            />
            <Tooltip 
              formatter={(value) => [value, 'Pacientes']}
              labelFormatter={(label) => `Diagnóstico: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}