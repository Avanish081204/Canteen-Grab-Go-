import { LucideIcon } from 'lucide-react';

interface OrderTypeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  onClick: () => void;
  color: 'blue' | 'green' | 'purple';
}

const colorClasses = {
  blue: 'from-sky-500 to-blue-600',
  green: 'from-emerald-500 to-green-600',
  purple: 'from-purple-500 to-violet-600',
};

const glowClasses = {
  blue: 'group-hover:shadow-[0_20px_40px_-12px_rgba(14,165,233,0.4)]',
  green: 'group-hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)]',
  purple: 'group-hover:shadow-[0_20px_40px_-12px_rgba(139,92,246,0.4)]',
};

export default function OrderTypeCard({ title, description, icon: Icon, emoji, onClick, color }: OrderTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`card-order-type group w-full text-left !p-3.5 sm:!p-6 ${glowClasses[color]}`}
    >
      {/* Icon Container */}
      <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-2.5 sm:mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}
        style={{ boxShadow: '0 6px 20px -6px rgba(0,0,0,0.25)' }}
      >
        <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
      </div>
      
      {/* Content */}
      <h3 className="text-base sm:text-2xl font-bold text-foreground mb-1 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
        {title}
        <span className="text-lg sm:text-2xl group-hover:scale-125 transition-transform duration-300">{emoji}</span>
      </h3>
      
      <p className="text-muted-foreground text-xs sm:text-base group-hover:text-foreground/70 transition-colors duration-300">{description}</p>
      
      {/* Arrow indicator — desktop only */}
      <div className="mt-3 sm:mt-5 hidden sm:flex items-center gap-2 text-primary font-medium text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-2">
        <span>Get Started</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
}
