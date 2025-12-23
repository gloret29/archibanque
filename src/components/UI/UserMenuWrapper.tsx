'use client';

import { UserMenu } from './UserMenu';
import { useState, useEffect } from 'react';

interface UserMenuWrapperProps {
  user?: {
    name: string | null;
    email: string;
  } | null;
}

export function UserMenuWrapper({ user: initialUser }: UserMenuWrapperProps) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    // Si l'utilisateur n'a pas été fourni (cas des composants clients purs), le récupérer via API
    if (!initialUser) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [initialUser]);

  if (loading) {
    return (
      <div style={{ padding: '8px 16px', fontSize: '14px', color: '#999' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '8px 16px', fontSize: '14px', color: '#999' }}>
        NOT LOGGED IN
      </div>
    );
  }

  return <UserMenu user={user} />;
}

