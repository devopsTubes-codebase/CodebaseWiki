import { cn } from './cn';

export function LogoMark({ size = 'h-7 w-7', className = '' }: { size?: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br from-[#7667ff] to-[#9b5cff] text-white shadow-[0_10px_24px_rgba(124,92,255,0.45)]',
        size,
        className
      )}
    >
      <svg viewBox="0 0 18 18" className="h-[54%] w-[54%]" fill="none" aria-hidden="true">
        <path
          d="M4.35 3.2h7.55c.78 0 1.4.63 1.4 1.4v8.8c0 .78-.62 1.4-1.4 1.4H4.35c-.78 0-1.4-.62-1.4-1.4V4.6c0-.77.62-1.4 1.4-1.4Z"
          stroke="currentColor"
          strokeWidth="1.45"
        />
        <path
          d="M6.1 3.2v11.6M9.05 5.45h2.35M9.05 8.95h2.35"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
