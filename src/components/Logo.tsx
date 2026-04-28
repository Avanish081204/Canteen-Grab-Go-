import logoImg from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizes[size]} ${className} group`}>
      <img 
        src={logoImg} 
        alt="Campus Canteen Logo" 
        className="w-full h-full object-contain rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
