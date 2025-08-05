import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useState } from 'react';

interface MiniChartData {
  name: string;
  value: number;
  color?: string;
}

interface MiniChartProps {
  data: MiniChartData[];
  title: string;
  subtitle?: string;
  type: 'bar' | 'pie';
  icon?: LucideIcon;
  total?: number;
  className?: string;
}

export function MiniChart({ 
  data, 
  title, 
  subtitle, 
  type, 
  icon: Icon,
  total,
  className = ""
}: MiniChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [hoveredData, setHoveredData] = useState<{name: string, value: number, x: number, y: number} | null>(null);
  const defaultColors = [
    '#0ea5e9', // sky blue
    '#10b981', // emerald green  
    '#f97316', // orange
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#e11d48', // rose
    '#7c3aed', // violet
    '#dc2626', // red
    '#059669', // green
    '#0284c7', // blue
    '#ca8a04', // yellow
    '#be185d', // pink
    '#7c2d12', // brown
    '#374151', // gray
    '#1f2937', // dark gray
    '#991b1b', // dark red
    '#166534', // dark green
    '#1e40af', // dark blue
    '#a21caf', // fuchsia
    '#ea580c', // amber
  ];

  // Helper function to capitalize first letter
  const capitalizeFirst = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const chartData = data.map((item, index) => ({
    ...item,
    name: capitalizeFirst(item.name),
    color: item.color || defaultColors[index % defaultColors.length]
  }));

  return (
    <Card className={`transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${className} rounded-2xl border-0 bg-gradient-to-br from-slate-50 to-white shadow-lg backdrop-blur-sm ring-1 ring-slate-200/50`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
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
          {total && (
            <div className="text-right">
              <div className="text-2xl font-black text-slate-800 tracking-tight">{total}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">total</div>
            </div>
          )}
        </div>
        
        <div className={`${type === 'pie' ? 'h-36' : 'h-40'} bg-gradient-to-r from-slate-50/50 to-white/50 rounded-xl p-2 backdrop-blur-sm relative`}
             onMouseMove={(e) => {
               if (type === 'pie' && hoveredData) {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 const y = e.clientY - rect.top;
                 setHoveredData(prev => prev ? {...prev, x, y} : null);
               }
             }}>
          {type === 'pie' && hoveredData && (
            <div 
              className="absolute pointer-events-none z-10"
              style={{
                left: `${Math.min(Math.max(hoveredData.x + 10, 0), 250)}px`,
                top: `${Math.min(Math.max(hoveredData.y - 40, 0), 100)}px`,
                transform: hoveredData.x > 200 ? 'translateX(-100%)' : 'none'
              }}
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-slate-200/50 max-w-[200px]">
                <div className="text-sm font-bold text-slate-800 text-center leading-tight mb-1">
                  {hoveredData.name}
                </div>
                <div className="text-lg font-black text-blue-600 text-center">
                  {hoveredData.value}%
                </div>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={false}
                  axisLine={false}
                  height={0}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    backdropFilter: 'blur(8px)',
                    maxWidth: '250px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal'
                  }}
                  labelStyle={{ 
                    color: '#475569', 
                    fontWeight: '700',
                    marginBottom: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '230px'
                  }}
                  formatter={(value: any, name: any) => [
                    `${value}${typeof value === 'number' && value <= 100 ? '%' : ''}`, 
                    'Valor'
                  ]}
                  labelFormatter={(label: any) => label}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(data, index, e) => {
                    setActiveIndex(index);
                    setHoveredData({
                      name: chartData[index]?.name || '',
                      value: chartData[index]?.value || 0,
                      x: 0,
                      y: 0
                    });
                  }}
                  onMouseLeave={() => {
                    setActiveIndex(null);
                    setHoveredData(null);
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={activeIndex === index ? '#1e293b' : 'none'}
                      strokeWidth={activeIndex === index ? 3 : 0}
                      style={{
                        filter: activeIndex !== null && activeIndex !== index ? 'opacity(0.6)' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {(showAllCategories ? chartData : chartData.slice(0, 3)).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-700">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-800">{item.value}%</span>
            </div>
          ))}
          {chartData.length > 3 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full text-xs text-slate-500 hover:text-slate-700 text-center font-medium pt-1 transition-colors duration-200 hover:bg-slate-100/50 rounded-lg py-2"
            >
              {showAllCategories 
                ? `Mostrar menos` 
                : `+${chartData.length - 3} categorias adicionais - clique para expandir`
              }
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}