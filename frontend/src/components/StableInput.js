import React, { memo } from 'react';

// Memoized input component to prevent re-renders
const StableInput = memo(({ 
  type = "text", 
  value, 
  onChange, 
  className,
  placeholder,
  required,
  ...props 
}) => {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      required={required}
      {...props}
    />
  );
});

StableInput.displayName = 'StableInput';

export default StableInput;
