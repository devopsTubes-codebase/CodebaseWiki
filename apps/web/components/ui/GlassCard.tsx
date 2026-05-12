import * as React from 'react';
import { cn } from './cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  insetGlow?: boolean;
}

export function GlassCard({ className, insetGlow = false, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-[rgba(24,24,27,0.4)] backdrop-blur-xl',
        insetGlow && 'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_26px_80px_rgba(99,102,241,0.11)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
