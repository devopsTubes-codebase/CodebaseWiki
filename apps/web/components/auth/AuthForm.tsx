'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { signIn } from 'next-auth/react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/components/ui/cn';
import type { AuthPageCopy } from './authPageContent';

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up';
  copy: AuthPageCopy;
}

type SubmitState = 'idle' | 'success';

export function AuthForm({ mode, copy }: AuthFormProps) {
  const [submitState, setSubmitState] = React.useState<SubmitState>('idle');
  const router = useRouter();

  function getRedirectTarget() {
    if (typeof window === 'undefined') return '/dashboard';
    return new URLSearchParams(window.location.search).get('callbackUrl') || '/dashboard';
  }

  const handleCredentialsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '').trim();
    const name = String(formData.get('name') || '').trim();

    if (!email || !password) {
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      userId: email.toLowerCase(),
      email,
      name: name || (mode === 'sign-up' ? email.split('@')[0] : 'Codebase Wiki User'),
    });

    if (result?.ok) {
      setSubmitState('success');
      router.push(getRedirectTarget());
      router.refresh();
    }
  };

  return (
    <GlassCard
      insetGlow
      className="mx-auto w-full max-w-[560px] rounded-[32px] border-white/10 bg-[rgba(10,15,24,0.82)] p-6 shadow-[0_32px_80px_rgba(15,23,42,0.52)] sm:p-8"
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200/85">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300/80 sm:text-base">{copy.description}</p>
      </div>

      <form className="space-y-5" onSubmit={handleCredentialsSubmit}>
        {mode === 'sign-up' ? (
          <Field label="Full name" htmlFor="name">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={inputClassName}
              placeholder="Ada Lovelace"
            />
          </Field>
        ) : null}

        <Field label="Email address" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="you@company.com"
            required
          />
        </Field>

        <Field label="Password" htmlFor="password" trailing={mode === 'sign-in' ? <Link href="#" className="text-sm text-violet-200 transition hover:text-white">Forgot password?</Link> : null}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            className={inputClassName}
            placeholder="Enter your password"
            required
          />
        </Field>

        <GradientButton type="submit" className="h-12 w-full justify-center text-base font-semibold">
          {copy.submitLabel}
        </GradientButton>
      </form>

      <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {copy.alternatePrompt}{' '}
          <Link href={copy.alternateHref} className="font-medium text-violet-200 transition hover:text-white">
            {copy.alternateLabel}
          </Link>
        </p>
        <StatusPill state={submitState} />
      </div>
    </GlassCard>
  );
}

function Field({
  label,
  htmlFor,
  children,
  trailing,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-slate-200">
        <span>{label}</span>
        {trailing}
      </span>
      {children}
    </label>
  );
}

function StatusPill({ state }: { state: SubmitState }) {
  if (state !== 'success') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition',
        'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      )}
      aria-live="polite"
    >
      Email auth connected
    </span>
  );
}

const inputClassName =
  'h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-300/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/20';
