import React from 'react';
import { Badge } from '@/Components/ui/badge';

const BADGE_CONFIG = {
  admin: {
    icon: 'https://img.icons8.com/3d-fluency/94/crown.png',
    label: 'ADMIN',
    bgColor: 'bg-gradient-to-r from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  },
  moderator: {
    icon: 'https://img.icons8.com/3d-fluency/94/shield.png',
    label: 'MODERATOR',
    bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
  },
  vip: {
    icon: 'https://img.icons8.com/3d-fluency/94/star.png',
    label: 'VIP',
    bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]'
  },
  free: {
    icon: 'https://img.icons8.com/3d-fluency/94/user-male-circle.png',
    label: 'MEMBER',
    bgColor: 'bg-gradient-to-r from-zinc-700/20 to-zinc-600/20',
    borderColor: 'border-zinc-600/50',
    textColor: 'text-zinc-400',
    glowColor: ''
  }
};

export default function MemberBadge({ tier, size = 'md', showLabel = true, className = '' }) {
  if (!tier) return null;
  
  const config = BADGE_CONFIG[tier] || BADGE_CONFIG.free;
  
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const textSizeClasses = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  if (!showLabel) {
    return (
      <img 
        src={config.icon}
        className={`${sizeClasses[size]} ${className}`}
        alt={config.label}
        title={config.label}
      />
    );
  }

  return (
    <Badge 
      className={`
        ${config.bgColor} 
        ${config.borderColor} 
        ${config.textColor} 
        ${config.glowColor}
        border-2 
        font-bold 
        ${textSizeClasses[size]}
        px-2 py-1 
        flex items-center gap-1.5
        hover:scale-105 
        transition-all 
        duration-200
        ${className}
      `}
    >
      <img src={config.icon} className={sizeClasses[size]} alt="" />
      {config.label}
    </Badge>
  );
}
