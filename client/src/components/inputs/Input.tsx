import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className = '', required, ...rest }, ref) => {
  return (
    <label className="w-full flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <input
        ref={ref}
        className={`py-[7px] px-4 font-normal placeholder:!font-light  placeholder:text-[13px] text-[14px] flex items-center w-full rounded-lg border-[1.5px] border-secondary border-opacity-50 outline-none focus:outline-none focus:border-[1.6px] focus:border-primary ease-in-out duration-50 ${className}`}
        required={required}
        {...rest}
      />
    </label>
  );
});

Input.displayName = 'Input';

export default Input;
