import React from 'react';

const BADGE_URLS = {
  admin: 'https://static.vecteezy.com/system/resources/thumbnails/027/291/525/small/3d-rendered-medal-reward-rating-rank-verified-quality-badge-icon-png.png',
  vip: 'https://static.vecteezy.com/system/resources/thumbnails/011/047/464/small_2x/3d-rendering-of-mvp-badge-game-icon-illustration-for-winner-png.png',
  free: 'https://static.vecteezy.com/system/resources/thumbnails/011/047/442/small/3d-rendering-of-game-winner-badge-icon-illustration-png.png'
};

export default function MemberBadge({ tier, size = 'sm', className = '' }) {
  if (!tier) return null;
  
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <img 
      src={BADGE_URLS[tier] || BADGE_URLS.free}
      className={`${sizeClasses[size]} ${className}`}
      alt={`${tier} badge`}
      title={tier.toUpperCase()}
    />
  );
}
