import React from 'react';

const Card = ({ 
  children, 
  className = '',
  padding = true,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md 
        ${padding ? 'p-6' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;