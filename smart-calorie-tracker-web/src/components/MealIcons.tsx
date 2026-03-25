import React from 'react';

interface IconProps {
  className?: string;
}

export const BreakfastIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#d1fae5" />
    <path d="M18 42C18 30 24 22 32 22C40 22 46 30 46 42H18Z" fill="#ffffff" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M46 30C52 30 54 36 50 40H46" fill="#ffffff" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M12 46H52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
    <path d="M26 14v4M38 14v4" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const LunchIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#e0f2fe" />
    <path d="M16 38C16 28 22 18 32 18C42 18 48 28 48 38H16Z" fill="#ffffff" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M12 42H52" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
    <path d="M16 46C16 50 24 54 32 54C40 54 48 50 48 46H16Z" fill="#ffedd5" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="28" cy="28" r="2" fill="#1e293b" />
    <circle cx="38" cy="30" r="2" fill="#1e293b" />
    <circle cx="26" cy="34" r="2" fill="#1e293b" />
  </svg>
);

export const DinnerIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#eef2ff" />
    <path d="M20 48L16 28C16 22 22 16 32 16C42 16 48 22 48 28L44 48" fill="#ffffff" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M16 48C16 54 24 56 32 56C40 56 48 54 48 48H16Z" fill="#ffffff" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M24 16v-6M32 16v-8M40 16v-6" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const SnackIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#ffedd5" />
    <path d="M32 18C20 18 14 26 14 38C14 50 22 54 32 54C42 54 50 50 50 38C50 26 44 18 32 18Z" fill="#ffffff" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M32 18C32 18 38 10 44 14C48 16 46 8 38 6C32 4 32 18 32 18Z" fill="#22c55e" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
