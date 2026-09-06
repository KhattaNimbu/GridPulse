import { Zap } from 'lucide-react';

/**
 * Footer rule is a hairline Mist Gray divider; type is 14px muted gray.
 * No color, no elevation — the page ends quietly.
 */
export default function SiteFooter({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`flex flex-col gap-4 border-t border-mist-gray pt-8 text-[14px] text-muted-gray sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mint-green">
          <Zap className="h-3.5 w-3.5 fill-paper-white text-paper-white" />
        </span>
        <span>© {new Date().getFullYear()} GridPulse. All rights reserved.</span>
      </div>
      <div className="flex flex-wrap gap-6">
        {['Privacy', 'Terms', 'Security', 'Status'].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </footer>
  );
}
