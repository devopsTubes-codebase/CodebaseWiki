import { GradientButton } from './ui/GradientButton';
import { LogoMark } from './ui/LogoMark';

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[rgba(8,15,23,0.8)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <LogoMark size="h-8 w-8" />
          <span className="text-xl font-bold text-white">Codebase Wiki</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-[#a1a1aa] transition-colors hover:text-white">
            Features
          </a>
          <a href="#docs" className="text-[#a1a1aa] transition-colors hover:text-white">
            Documentation
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <GradientButton variant="ghost" className="px-3 py-2">
            Log in
          </GradientButton>
          <GradientButton className="px-5 py-3">Get Started</GradientButton>
        </div>
      </div>
    </header>
  );
}
