import { router } from "./create-context";
import hiProcedure from "./routes/example/hi/route";
import getTeams from "./routes/teams/getTeams/route";
import updatePoints from "./routes/teams/updatePoints/route";
import resetPoints from "./routes/teams/resetPoints/route";
import getNominations from "./routes/nominations/getNominations/route";
import addNomination from "./routes/nominations/addNomination/route";
import voteForNomination from "./routes/nominations/voteForNomination/route";
import getUserVotes from "./routes/nominations/getUserVotes/route";
import resetVotes from "./routes/nominations/resetVotes/route";

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  teams: router({
    getTeams,
    updatePoints,
    resetPoints,
  }),
  nominations: router({
    getNominations,
    addNomination,
    voteForNomination,
    getUserVotes,
    resetVotes,
  }),
});

export type AppRouter = typeof appRouter;