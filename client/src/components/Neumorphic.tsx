import React, { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- NeuCard ---
interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}
export const NeuCard: React.FC<NeuCardProps> = ({ children, className, inset, ...props }) => {
  return (
    <div
      className={cn(
        "bg-neu-base transition-all duration-300",
        inset ? "rounded-xl shadow-neu-pressed" : "rounded-3xl shadow-neu-flat",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// --- NeuButton ---
interface NeuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default' | 'danger' | 'icon';
  active?: boolean;
}
export const NeuButton: React.FC<NeuButtonProps> = ({ 
  children, 
  className, 
  variant = 'default',
  active = false,
  ...props 
}) => {
  const baseStyles = "transition-all duration-200 outline-none select-none flex items-center justify-center gap-2 active:scale-[0.97]";
  
  const variants = {
    default: cn(
      "px-6 py-3 rounded-xl font-semibold text-neu-text bg-neu-base", 
      active ? "shadow-neu-pressed text-neu-primary" : "shadow-neu-flat hover:text-neu-dark"
    ),
    primary: "px-6 py-3 rounded-xl font-semibold bg-neu-primary text-white shadow-neu-flat hover:brightness-110 active:shadow-neu-pressed",
    danger: "px-6 py-3 rounded-xl font-semibold text-neu-danger bg-neu-base shadow-neu-flat hover:text-red-600 active:shadow-neu-pressed",
    icon: cn(
      "p-3 rounded-full bg-neu-base text-neu-text",
      active ? "shadow-neu-pressed text-neu-primary" : "shadow-neu-flat hover:text-neu-dark"
    )
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- NeuInput ---
interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}
export const NeuInput: React.FC<NeuInputProps> = ({ label, className, icon, ...props }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {label && <label className="text-sm font-bold text-neu-text ml-2 uppercase tracking-wide text-[11px]">{label}</label>}
      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-5 text-neu-text/50 transition-colors group-focus-within:text-neu-primary">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full bg-neu-base rounded-2xl px-6 py-4 outline-none text-neu-dark placeholder-neu-text/30 shadow-neu-pressed-sm transition-all focus:ring-1 focus:ring-neu-primary/20",
            icon && "pl-12",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

// --- NeuToggle ---
// REFINED: Mechanical look. Sunken Track + Floating Knob. No glow.
interface NeuToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
export const NeuToggle: React.FC<NeuToggleProps> = ({ checked, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className="w-12 h-6 rounded-full cursor-pointer relative shadow-neu-pressed bg-neu-base transition-colors duration-300"
    >
      <div 
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full shadow-neu-flat transition-all duration-300 transform",
          checked ? "translate-x-7 bg-neu-primary" : "translate-x-1 bg-neu-text/30"
        )} 
      />
    </div>
  );
};

// --- NeuAvatar ---
export const NeuAvatar: React.FC<{ src?: string; fallback: string; size?: 'sm' | 'md' | 'lg' }> = ({ src, fallback, size = 'md' }) => {
  const sizes = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' };
  return (
    <div className={cn("rounded-full bg-neu-base shadow-neu-flat flex items-center justify-center overflow-hidden border-4 border-neu-base", sizes[size])}>
      {src ? (
        <img src={src} alt="User" className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-neu-text text-xl">{fallback}</span>
      )}
    </div>
  );
};