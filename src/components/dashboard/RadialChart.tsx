import { ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RadialChartData {
  name: string;
  value: number;
  fill: string;
}

interface RadialChartProps {
  data: RadialChartData[];
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  centerValue?: string;
  centerLabel?: string;
  className?: string;
}

export function RadialChart({ 
  data, 
  title, 
  subtitle, 
  icon: Icon,
  centerValue,
  centerLabel,
  className = ""
}: RadialChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  const chartData = data.map((item, index) => ({
    ...item,
    // Convert to percentage of max for proper radial display
    uv: (item.value / maxValue) * 100,
    // Add unique key for each bar
    barKey: `bar-${index}`
  }));

  return (
    <Card className={`transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${className} rounded-2xl border-0 bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <Icon className="h-4 w-4 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-wide">{title}</h3>
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="45%" outerRadius="80%" data={chartData}>
              {chartData.map((entry, index) => (
                <RadialBar
                  key={entry.barKey}
                  dataKey="uv"
                  cornerRadius={4}
                  fill={entry.fill}
                  data={[entry]}
                />
              ))}
            </RadialBarChart>
          </ResponsiveContainer>
          
          {centerValue && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-sm border border-slate-200/50">
                <div className="text-xl font-black text-slate-800">{centerValue}</div>
                {centerLabel && (
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{centerLabel}</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          {data.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs font-semibold text-slate-700 truncate max-w-20">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
          {data.length > 3 && (
            <div className="text-xs text-slate-400 text-center font-medium pt-1">
              +{data.length - 3} itens adicionais
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}