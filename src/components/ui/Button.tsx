import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  iconOnly?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-400 hover:to-sky-400 shadow-lg shadow-cyan-500/20 border border-cyan-400/30',
  secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600',
  ghost: 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent',
  danger: 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-800 hover:border-red-700',
  outline: 'bg-transparent text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10',
};

const SIZES: Record<Size, string> = {
  xs: 'px-2 py-1 text-xs rounded-md gap-1',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    icon,
    children,
    iconOnly = false,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const variantClass = VARIANTS[variant];
  const sizeClass = SIZES[size];

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center font-medium 
        transition-all duration-200 cursor-pointer select-none
        active:scale-95 hover:scale-[1.02]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${variantClass} ${sizeClass} ${iconOnly ? '!px-2 aspect-square' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin flex-shrink-0" size={size === 'xs' || size === 'sm' ? 12 : 14} />
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center">{icon}</span>
      ) : null}
      {!iconOnly && children && <span>{children}</span>}
    </button>
  );
});

export default Button;
