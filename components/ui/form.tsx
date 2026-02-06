'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  htmlFor?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, htmlFor, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && <Label htmlFor={htmlFor}>{label}</Label>}
        {children}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };
