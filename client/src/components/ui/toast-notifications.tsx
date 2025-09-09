import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastNotifications() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300",
            "floating-ui"
          )}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {toast.variant === "default" && (
                <CheckCircle className="h-4 w-4 text-green-500" data-testid="toast-success-icon" />
              )}
              {toast.variant === "destructive" && (
                <XCircle className="h-4 w-4 text-red-500" data-testid="toast-error-icon" />
              )}
              {!toast.variant && (
                <Info className="h-4 w-4 text-blue-500" data-testid="toast-info-icon" />
              )}
            </div>
            <div className="flex-1">
              {toast.title && (
                <p className="text-sm font-medium text-foreground" data-testid="toast-title">
                  {toast.title}
                </p>
              )}
              {toast.description && (
                <p className="text-sm text-muted-foreground" data-testid="toast-description">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="toast-dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
