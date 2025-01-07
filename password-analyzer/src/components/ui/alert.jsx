import * as React from "react";

const Alert = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`
      relative w-full rounded-lg border p-4
      ${
        variant === "default"
          ? "bg-background text-foreground"
          : variant === "destructive"
          ? "border-destructive/50 text-destructive dark:border-destructive bg-destructive/10"
          : ""
      }
      ${className}`}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`mt-2 text-sm leading-relaxed text-muted-foreground ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
