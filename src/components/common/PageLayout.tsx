import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  showNavigation?: boolean;
}

export function PageLayout({ 
  children, 
  className, 
  title, 
  description, 
  showNavigation = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      
      <div className={cn("container mx-auto px-4 py-6 pb-24 md:pb-6", className)}>
        {(title || description) && (
          <div className="text-center space-y-2 mb-8">
            {title && <h1 className="text-3xl font-bold">{title}</h1>}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}