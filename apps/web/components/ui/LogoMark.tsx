import Image from 'next/image';
import { cn } from './cn';

export function LogoMark({ size = 'h-7 w-7', className = '' }: { size?: string; className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-transparent',
        size,
        className
      )}
    >
      <Image
        src="/Logo%20Codebase%20Wiki.png"
        alt="Codebase Wiki"
        fill
        priority
        sizes="64px"
        className="object-contain"
      />
    </div>
  );
}
