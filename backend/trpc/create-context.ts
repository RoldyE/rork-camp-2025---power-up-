import { initTRPC } from '@trpc/server';

// Create context
export const createContext = () => ({});

// Initialize tRPC
const t = initTRPC.context<typeof createContext>().create();

// Export procedures and router
export const router = t.router;
export const publicProcedure = t.procedure;