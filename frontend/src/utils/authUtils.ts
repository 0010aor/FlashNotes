// Utility for guest mode detection outside React context
// Use this ONLY in non-React code (services, router guards, etc).
// In React components/hooks, use useAuthContext() instead.

export const isGuest = () => localStorage.getItem('guest_mode') === 'true'
