import * as React from 'react';
import { cn } from './cn';
import { GradientButton } from './GradientButton';
import { LogoMark } from './LogoMark';

interface AppShellProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  nav?: React.ReactNode;
  className?: string;
}

export function AppShell({ title = 'Codebase Wiki', children, actions, nav, className }: AppShellProps) {
  return (
    <main className={cn('min-h-screen bg-[#080f17] text-slate-100', className)}>
      <header className="flex h-16 items-center border-b border-slate-500/35 px-6 md:px-12">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <LogoMark size="h-8 w-8" />
            <span className="text-xl font-bold tracking-[-0.03em] text-[#dddfff]">{title}</span>
          </div>
          {nav ? <div className="hidden flex-1 justify-center md:flex">{nav}</div> : null}
          <div className="flex items-center gap-3">
            {actions ?? (
              <>
                <GradientButton variant="ghost" className="hidden px-3 py-2 sm:inline-flex">
                  Log in
                </GradientButton>
                <GradientButton className="px-5 py-3">Get Started</GradientButton>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
