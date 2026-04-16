import React, { useState } from 'react';

const EyeIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M2.04 12.32a1 1 0 0 1 0-.64C3.42 7.51 7.36 4.5 12 4.5s8.58 3.01 9.96 7.18a1 1 0 0 1 0 .64C20.58 16.49 16.64 19.5 12 19.5S3.42 16.49 2.04 12.32Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M3 3l18 18" />
    <path d="M10.58 10.58A2 2 0 0 0 12 14a1.99 1.99 0 0 0 1.42-.58" />
    <path d="M6.61 6.61a11.96 11.96 0 0 0-4.57 5.07 1 1 0 0 0 0 .64C3.42 16.49 7.36 19.5 12 19.5a11.4 11.4 0 0 0 4.02-.72" />
    <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.5c4.64 0 8.58 3.01 9.96 7.18a1 1 0 0 1 0 .64 11.9 11.9 0 0 1-4.33 5.46" />
  </svg>
);

const PasswordField = ({ label, inputClassName = '', ...inputProps }) => {
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = `${isVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      <div className="relative">
        <input
          {...inputProps}
          type={isVisible ? 'text' : 'password'}
          className={`field-control pr-12 ${inputClassName}`.trim()}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={toggleLabel}
          aria-pressed={isVisible}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-transparent bg-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
};

export default PasswordField;
