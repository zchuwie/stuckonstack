import { clerkMiddleware, requireAuth } from '@clerk/express';

// Export middleware to be used in the main Express app
export const authMiddleware = clerkMiddleware();
export const protectedRoute = requireAuth();
