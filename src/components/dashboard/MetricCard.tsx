import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          card: 'border-primary/20 bg-gradient-primary text-white',
          icon: 'text-white',
          value: 'text-white',
          title: 'text-white/90',
          description: 'text-white/80'
        };
      case 'success':
        return {
          card: 'border-success/20 bg-gradient-secondary text-white',
          icon: 'text-white',
          value: 'text-white',
          title: 'text-white/90',
          description: 'text-white/80'
        };
      case 'warning':
        return {
          card: 'border-warning/20 bg-warning/10',
          icon: 'text-warning',
          value: 'text-foreground',
          title: 'text-foreground',
          description: 'text-muted-foreground'
        };
      case 'info':
        return {
          card: 'border-info/20 bg-info/10',
          icon: 'text-info',
          value: 'text-foreground',
          title: 'text-foreground',
          description: 'text-muted-foreground'
        };
      default:
        return {
          card: 'border-border',
          icon: 'text-primary',
          value: 'text-foreground',
          title: 'text-foreground',
          description: 'text-muted-foreground'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={`shadow-medium hover:shadow-large transition-shadow duration-200 ${styles.card}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${styles.title}`}>
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${styles.icon}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${styles.value}`}>
          {value}
        </div>
        {description && (
          <p className={`text-sm mt-1 ${styles.description}`}>
            {description}
          </p>
        )}
        {trend && (
          <div className={`flex items-center text-sm mt-2 ${
            trend.isPositive ? 'text-success' : 'text-destructive'
          }`}>
            <span className="font-medium">
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className={`ml-1 ${styles.description}`}>
              vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}