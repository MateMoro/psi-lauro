import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = "" 
}: EmptyStateProps) {
  return (
    <Card className={`shadow-medium ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 p-3 rounded-full bg-muted/50">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
        {action && (
          <Button 
            onClick={action.onClick} 
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}