import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getTeamsRoute from "./routes/teams/getTeams/route";
import updatePointsRoute from "./routes/teams/updatePoints/route";
import resetPointsRoute from "./routes/teams/resetPoints/route";
import getNominationsRoute from "./routes/nominations/getNominations/route";
import addNominationRoute from "./routes/nominations/addNomination/route";
import voteForNominationRoute from "./routes/nominations/voteForNomination/route";
import resetVotesRoute from "./routes/nominations/resetVotes/route";
import getUserVotesRoute from "./routes/nominations/getUserVotes/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  teams: createTRPCRouter({
    getTeams: getTeamsRoute,
    updatePoints: updatePointsRoute,
    resetPoints: resetPointsRoute,
  }),
  nominations: createTRPCRouter({
    getNominations: getNominationsRoute,
    addNomination: addNominationRoute,
    voteForNomination: voteForNominationRoute,
    resetVotes: resetVotesRoute,
    getUserVotes: getUserVotesRoute,
  }),
});

export type AppRouter = typeof appRouter;