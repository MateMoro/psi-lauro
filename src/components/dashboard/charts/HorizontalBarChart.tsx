import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
  description?: string;
}

export function HorizontalBarChart({ data, title, description }: HorizontalBarChartProps) {
  console.log('HorizontalBarChart data:', data); // Debug log
  
  return (
    <Card className="shadow-lg rounded-xl lg:rounded-2xl border-0 bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm ring-1 ring-slate-200/50">
      <CardHeader className="pb-3 lg:pb-4">
        <CardTitle className="text-base lg:text-lg font-bold text-slate-800">{title}</CardTitle>
        {description && (
          <p className="text-xs lg:text-sm text-slate-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="px-3 lg:px-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{
              top: 20,
              right: 40,
              left: 180,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis 
              type="number" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 55]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={170}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9", opacity: 0.1 }}
              formatter={(value) => [`${value}%`, 'Percentual']}
              labelStyle={{ color: '#1f2937' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              fill="#0ea5e9"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}