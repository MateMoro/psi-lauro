import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  variant = 'default'
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          card: 'border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/30 backdrop-blur-sm',
          icon: 'text-blue-100',
          value: 'text-white',
          title: 'text-blue-50',
          description: 'text-blue-100/80'
        };
      case 'success':
        return {
          card: 'border-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white shadow-xl shadow-emerald-500/30 backdrop-blur-sm',
          icon: 'text-emerald-100',
          value: 'text-white',
          title: 'text-emerald-50',
          description: 'text-emerald-100/80'
        };
      case 'info':
        return {
          card: 'border-0 bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 text-white shadow-xl shadow-orange-500/30 backdrop-blur-sm',
          icon: 'text-orange-100',
          value: 'text-white',
          title: 'text-orange-50',
          description: 'text-orange-100/80'
        };
      case 'warning':
        return {
          card: 'border-0 bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 text-white shadow-xl shadow-red-500/30 backdrop-blur-sm',
          icon: 'text-red-100',
          value: 'text-white',
          title: 'text-red-50',
          description: 'text-red-100/80'
        };
      default:
        return {
          card: 'border-0 bg-gradient-to-br from-slate-50 to-gray-100 hover:shadow-lg shadow-gray-200/50 backdrop-blur-sm',
          icon: 'text-slate-600',
          value: 'text-slate-900',
          title: 'text-slate-700',
          description: 'text-slate-500'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={`transition-all duration-300 lg:hover:scale-[1.03] lg:hover:-translate-y-1 ${styles.card} rounded-xl lg:rounded-2xl overflow-hidden`}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-xs lg:text-sm font-semibold tracking-wide uppercase truncate ${styles.title}`}>
              {title}
            </p>
            <div className={`text-xl sm:text-2xl lg:text-3xl font-extrabold mt-1 lg:mt-2 tracking-tight ${styles.value}`}>
              {value}
            </div>
            {description && (
              <p className={`text-xs lg:text-sm mt-1 lg:mt-2 font-medium ${styles.description}`}>
                {description}
              </p>
            )}
            {trend && (
              <div className={`flex items-center text-xs lg:text-sm mt-2 lg:mt-3 ${
                trend.isPositive ? 'text-emerald-200' : 'text-red-200'
              }`}>
                <span className="font-bold flex items-center">
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                  <span className="ml-1 text-xs opacity-75 hidden sm:inline">vs anterior</span>
                </span>
              </div>
            )}
          </div>
          <div className={`ml-3 lg:ml-4 p-2 lg:p-3 rounded-lg lg:rounded-xl ${variant !== 'default' ? 'bg-white/15 backdrop-blur-sm' : 'bg-slate-200'} ring-1 ring-white/10`}>
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${styles.icon} drop-shadow-sm`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}