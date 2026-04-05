import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const variantClasses = {
    default: 'card',
    md: 'card-md',
    lg: 'card-lg',
  };

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
