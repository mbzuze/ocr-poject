import React, { ReactNode, MouseEventHandler } from "react";

// Define the allowed variants and types as a union type
type ButtonVariant = "primary" | "secondary";
type ButtonType = 'button' | 'submit' | 'reset';

// Define the props interface for the Button component
interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: ButtonType;
}

// Functional component with typed props
export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  type = "button",
}: ButtonProps) {

  // Base styles applied to all variants
  const baseStyles = "cursor-pointer px-6 py-2 min-w-[120px] text-center border border-violet-600 rounded focus:outline-none focus:ring";

  // Variant-specific styles
  const variants: Record<ButtonVariant, string> = {
    primary: "text-white bg-violet-600 hover:bg-transparent hover:text-violet-600",
    secondary: "text-violet-600 hover:bg-violet-600 hover:text-white active:bg-indigo-500",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}