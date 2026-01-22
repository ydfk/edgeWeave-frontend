import { LucideIcon } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{title} 正在建设中</h2>
          <p className="text-muted-foreground max-w-md">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
