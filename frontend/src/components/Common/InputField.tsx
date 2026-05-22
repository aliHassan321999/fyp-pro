import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  error,
  required,
  helperText,
  icon,
  id,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-field">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={id}
          className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''} ${icon ? 'pl-10' : ''} ${className}`}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
