import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function usePermissions(userEmail) {
  const [permissions, setPermissions] = useState({
    isAdmin: false,
    isMod: false,
    isVIP: false,
    loading: true
  });

  useEffect(() => {
    if (!userEmail) {
      setPermissions({ isAdmin: false, isMod: false, isVIP: false, loading: false });
      return;
    }
    
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list({ 
          query: { user_email: userEmail } 
        });
        const tier = profiles[0]?.membership_tier;
        setPermissions({
          isAdmin: tier === 'admin',
          isMod: tier === 'moderator',
          isVIP: tier === 'vip',
          loading: false
        });
      } catch (error) {
        console.error('Failed to load permissions:', error);
        setPermissions({ isAdmin: false, isMod: false, isVIP: false, loading: false });
      }
    };
    
    load();
  }, [userEmail]);

  return permissions;
}

export function canEdit(item, user, permissions) {
  if (!user || !item) return false;
  return item.author_email === user.email || permissions.isAdmin || permissions.isMod;
}
