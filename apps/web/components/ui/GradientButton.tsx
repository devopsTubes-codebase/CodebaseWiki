import * as React from 'react';
import { cn } from './cn';

type GradientButtonVariant = 'primary' | 'secondary' | 'search' | 'ask' | 'ghost';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GradientButtonVariant;
  leadingIcon?: React.ReactNode;
}

const variantClasses: Record<GradientButtonVariant, string> = {
  primary:
    'rounded-lg bg-gradient-to-r from-[#7b82ff] to-[#6618d8] text-white shadow-[0_18px_34px_rgba(93,33,216,0.32)] hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(93,33,216,0.42)]',
  secondary:
    'rounded-xl border border-white/10 bg-[rgba(24,24,27,0.4)] text-white backdrop-blur-md hover:border-white/20 hover:text-white',
  search:
    'rounded-xl border border-white/10 bg-[rgba(24,24,27,0.4)] text-slate-200 backdrop-blur-md hover:border-white/20 hover:text-white',
  ask:
    'rounded-xl border border-white/10 bg-gradient-to-r from-[#28224d] to-[#1a1231] text-white shadow-[0_22px_45px_rgba(99,102,241,0.18)] hover:border-white/20 hover:brightness-110',
  ghost:
    'rounded-lg bg-transparent text-[#a1a1aa] hover:bg-white/5 hover:text-white',
};

export function GradientButton({
  variant = 'primary',
  className,
  leadingIcon,
  children,
  type = 'button',
  ...props
}: GradientButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-3 px-6 py-3 text-base font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-[#080f17]',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
