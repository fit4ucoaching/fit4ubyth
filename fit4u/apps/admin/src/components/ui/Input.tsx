import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "./utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-textSecondary">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-10 rounded-md border bg-surface px-3 text-textPrimary placeholder:text-textTertiary",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          error ? "border-danger" : "border-border",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-danger">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-textTertiary">{helperText}</span>
      ) : null}
    </div>
  );
});
