import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: SimpleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all duration-100" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg gap-4 border bg-card p-6 shadow-xl transition-all duration-200 rounded-xl animate-in fade-in zoom-in-95",
          className
        )}
      >
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h2>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        <div className="py-2">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 pt-4 border-t">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
