
import React from 'react';

export const GangchillLogo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="48" stroke="#1E3A8A" strokeWidth="4" />
    <path d="M50 10 L50 90 M10 50 L90 50" stroke="#1E3A8A" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M20 50 C20 30 35 20 50 20 C65 20 80 30 80 50 C80 70 65 80 50 80 C35 80 20 70 20 50Z" fill="#1E3A8A" fillOpacity="0.1" />
    <path d="M30 40 L70 40 L70 45 L52 45 L52 70 L48 70 L48 45 L30 45 Z" fill="#1E3A8A" />
    <path d="M35 55 L45 55 L45 60 L40 60 L40 65 L35 65 Z" fill="#E11D48" />
    <circle cx="50" cy="50" r="4" fill="#FDE047" />
  </svg>
);

export const TKingLogo: React.FC<{ height?: number; className?: string }> = ({ height = 60, className = "" }) => (
  <svg height={height} viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="0" y="10" width="240" height="60" rx="4" fill="#F1F5F9" />
    <path d="M20 20 L220 20 L220 60 L20 60 Z" fill="white" stroke="#1E40AF" strokeWidth="2" />
    <text x="120" y="48" textAnchor="middle" fill="#1E40AF" style={{ font: '900 32px Inter, sans-serif', letterSpacing: '4px' }}>T•KING</text>
    <text x="120" y="68" textAnchor="middle" fill="#EF4444" style={{ font: 'bold 10px Inter, sans-serif', letterSpacing: '1px' }}>TRUCKS & LOGISTICS</text>
  </svg>
);
