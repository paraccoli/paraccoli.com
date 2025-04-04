import React from 'react';

const Section = ({
  children,
  className = '',
  container = true,
  ...props
}) => {
  return (
    <section className={`py-16 ${className}`} {...props}>
      <div className={`${container ? 'container mx-auto px-4' : ''}`}>
        {children}
      </div>
    </section>
  );
};

Section.Header = ({ children }) => (
  <div className="text-center mb-12">{children}</div>
);

Section.Title = ({ children }) => (
  <h2 className="text-3xl font-bold text-gray-900 mb-4">{children}</h2>
);

Section.Description = ({ children }) => (
  <p className="text-xl text-gray-600 max-w-2xl mx-auto">{children}</p>
);

export default Section;