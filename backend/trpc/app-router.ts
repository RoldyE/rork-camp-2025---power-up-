import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getTeamsRoute from "./routes/teams/getTeams/route";
import getNominationsRoute from "./routes/nominations/getNominations/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  teams: createTRPCRouter({
    getTeams: getTeamsRoute,
  }),
  nominations: createTRPCRouter({
    getNominations: getNominationsRoute,
  }),
});

export type AppRouter = typeof appRouter;