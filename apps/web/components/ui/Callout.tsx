import * as React from 'react';
import { cn } from './cn';

type CalloutVariant = 'info' | 'warning' | 'alert';

const variantStyles: Record<CalloutVariant, { shell: string; title: string; body: string; icon: React.ReactNode }> = {
  info: {
    shell: 'border-[#2b4d7d] bg-[rgba(53,94,150,0.16)]',
    title: 'text-[#d8ebff]',
    body: 'text-slate-200/85',
    icon: (
      <svg viewBox="0 0 20 20" className="h-5 w-5 text-[#8fc5ff]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" />
        <path d="M10 8v5M10 5.75h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    shell: 'border-[#8d6b1b] bg-[rgba(145,111,21,0.15)]',
    title: 'text-[#fff1bf]',
    body: 'text-slate-200/85',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#f3c969]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 4.5 3.5 19h17L12 4.5Z" />
        <path d="M12 9v4.5M12 17h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  alert: {
    shell: 'border-[#8d2b2b] bg-[rgba(145,43,43,0.16)]',
    title: 'text-[#ffd7d7]',
    body: 'text-slate-200/85',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#ff8f8f]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 8v5M12 17h.01" strokeLinecap="round" />
        <path d="M10.3 3.84 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.7 3.84a2 2 0 0 0-3.4 0Z" />
      </svg>
    ),
  },
};

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant;
  title: string;
  description: string;
}

export function Callout({ variant = 'info', title, description, className, ...props }: CalloutProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn('flex gap-4 rounded-2xl border px-5 py-4', styles.shell, className)} {...props}>
      <div className="pt-1">{styles.icon}</div>
      <div className="space-y-1">
        <h4 className={cn('text-sm font-semibold', styles.title)}>{title}</h4>
        <p className={cn('text-sm leading-6', styles.body)}>{description}</p>
      </div>
    </div>
  );
}
