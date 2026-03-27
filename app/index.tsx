import React from 'react';
import { Redirect } from 'expo-router';

import { useAppSelector } from '@store/index';
import type { AuthUser } from '@store/authSlice';

function dashboardHref(role: AuthUser['role']): string {
  switch (role) {
    case 'admin':    return '/(admin)';
    case 'seller':   return '/(seller)';
    case 'tailor':   return '/(tailor-dash)';
    case 'delivery': return '/(delivery)';
    case 'customer': return '/(dashboard)';
  }
}

export default function Index(): React.JSX.Element {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <Redirect href={'/(tabs)' as never} />;
  }

  return <Redirect href={dashboardHref(user.role) as never} />;
}
