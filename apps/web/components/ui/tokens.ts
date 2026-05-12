export const uiTokens = {
  color: {
    pageBg: 'bg-[#080f17]',
    pageSurface: 'bg-[rgba(24,24,27,0.4)]',
    pageSurfaceStrong: 'bg-[rgba(10,15,24,0.78)]',
    border: 'border-white/10',
    borderStrong: 'border-slate-500/35',
    textPrimary: 'text-white',
    textSecondary: 'text-[#a1a1aa]',
    textMuted: 'text-slate-300/80',
    info: 'text-[#d8ebff]',
    warning: 'text-[#fff1bf]',
    danger: 'text-[#ffd7d7]',
  },
  gradient: {
    primary: 'bg-gradient-to-r from-[#7b82ff] to-[#6618d8]',
    hero: 'bg-gradient-to-br from-[#7667ff] to-[#a855f7]',
    glow: 'bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),rgba(8,15,23,0)_66%)]',
  },
  shadow: {
    primary: 'shadow-[0_18px_34px_rgba(93,33,216,0.32)]',
    primaryHover: 'hover:shadow-[0_22px_40px_rgba(93,33,216,0.42)]',
    glass: 'shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_26px_80px_rgba(99,102,241,0.11)]',
    panel: 'shadow-[0_10px_24px_rgba(124,92,255,0.32)]',
  },
  radius: {
    panel: 'rounded-2xl',
    control: 'rounded-xl',
    button: 'rounded-lg',
  },
} as const;
