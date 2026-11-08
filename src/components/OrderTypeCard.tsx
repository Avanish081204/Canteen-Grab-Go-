import { LucideIcon, ArrowRight } from 'lucide-react';

interface OrderTypeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  emoji?: string;
  onClick: () => void;
  color: 'blue' | 'green' | 'purple';
}

const colorConfig = {
  blue: {
    gradient: 'from-sky-500 to-blue-600',
    border: 'border-sky-500/20 group-hover:border-sky-500/60',
    bgLight: 'group-hover:bg-sky-500/5',
    glow: 'group-hover:shadow-[0_15px_30px_-10px_rgba(14,165,233,0.35)]',
    tag: 'Instant Counter Token',
    tagBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
  green: {
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/20 group-hover:border-emerald-500/60',
    bgLight: 'group-hover:bg-emerald-500/5',
    glow: 'group-hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.35)]',
    tag: 'Eco-Packed Takeaway',
    tagBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-600',
    border: 'border-purple-500/20 group-hover:border-purple-500/60',
    bgLight: 'group-hover:bg-purple-500/5',
    glow: 'group-hover:shadow-[0_15px_30px_-10px_rgba(139,92,246,0.35)]',
    tag: 'Campus Desk Delivery',
    tagBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
};

export default function OrderTypeCard({
  title,
  description,
  icon: Icon,
  onClick,
  color,
}: OrderTypeCardProps) {
  const conf = colorConfig[color];

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left p-4 sm:p-7 rounded-3xl bg-card border ${conf.border} ${conf.bgLight} transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${conf.glow} shadow-sm overflow-hidden flex flex-col justify-between`}
    >
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Top bar with icon & pill */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${conf.gradient} flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300 flex-shrink-0`}
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          <span
            className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${conf.tagBg} whitespace-nowrap`}
          >
            {conf.tag}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-2xl font-extrabold text-foreground mb-1.5 group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom CTA with arrow */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
        <span>Order Now</span>
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1 transition-all duration-300">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
}
