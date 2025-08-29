import { useState } from 'react';

export function useAuth() {
  const [loading] = useState(false);

  // Mock user for no-auth mode
  const user = { id: '1', email: 'demo@example.com' };
  const session = null;
  const profile = null;

  const signIn = async () => {
    return { data: { user }, error: null };
  };

  const signUp = async () => {
    return { data: { user }, error: null };
  };

  const signOut = async () => {
    // No-op for no-auth mode
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };
}