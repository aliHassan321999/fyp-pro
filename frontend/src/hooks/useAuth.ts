import { useGetMeQuery, useLogoutMutation } from '@/features/auth/auth.api';

/**
 * Refactored modern useAuth hook wrapping pure RTK capabilities completely bypassing context hooks!
 * 
 * Components natively subscribing to this hook immediately re-render globally upon
 * Auth / getMe Cache Invalidation without manual prop drilling.
 */
export const useAuth = () => {
  // Query executes strictly securely across http-only routes
  const { data: response, isLoading, isFetching, isError, error } = useGetMeQuery();
  const [logoutMutation] = useLogoutMutation();

  const user = response?.data || null;
  const isAuthenticated = !!user;

  console.log('[useAuth Debugger]', { isAuthenticated, isLoading, isFetching, isError, user, error });

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      // On success, 'Auth' cache tags invalidate globally auto-purging user instances intuitively
      window.location.href = '/login'; // Failsafe redirect cleaning RAM
    } catch (error) {
      console.error('[RTK Auth Hook] Failed logout broadcast:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isFetching,
    logout
  };
};
