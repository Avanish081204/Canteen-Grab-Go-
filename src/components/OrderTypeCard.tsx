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
      className={`card-order-type group w-full text-left ${glowClasses[color]}`}
    >
      {/* Icon Container */}
      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}
        style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' }}
      >
        <Icon className="w-10 h-10 text-white" />
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3 group-hover:text-primary transition-colors duration-300">
        {title}
        <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{emoji}</span>
      </h3>
      
      <p className="text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">{description}</p>
      
      {/* Arrow indicator */}
      <div className="mt-6 flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-2">
        <span>Get Started</span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
}
