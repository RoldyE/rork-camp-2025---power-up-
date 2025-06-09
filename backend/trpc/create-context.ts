import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Create a new instance of tRPC
const t = initTRPC.create();

// Export the router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;