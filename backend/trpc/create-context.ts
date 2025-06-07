import { initTRPC } from '@trpc/server';

// Create a new instance of tRPC
const t = initTRPC.create();

// Export the router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure; // Add auth middleware if needed later