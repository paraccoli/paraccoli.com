// src/components/shared/NotificationBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';

const NotificationBadge = ({ count, size = 'md', className = '' }) => {
  if (!count || count <= 0) return null;
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs -top-1 -right-1',
    md: 'px-2 py-1 text-xs -top-1 -right-1',
    lg: 'px-2.5 py-1.5 text-sm -top-2 -right-2'
  };
  
  return (
    <span className={`absolute inline-flex items-center justify-center font-bold leading-none text-red-100 bg-red-600 rounded-full ${sizeClasses[size]} ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

NotificationBadge.propTypes = {
  count: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default NotificationBadge;