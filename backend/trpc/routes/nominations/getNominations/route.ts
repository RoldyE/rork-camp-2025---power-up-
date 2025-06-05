import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations as initialNominations } from "@/mocks/nominations";
import { Nomination } from "@/types";

// Reference the same in-memory database
let nominations: Nomination[] = [...initialNominations];

export default publicProcedure
  .input(
    z.object({
      type: z.string().optional(),
      day: z.string().optional(),
    })
  )
  .query(({ input }) => {
    let filteredNominations = [...nominations];
    
    if (input.type) {
      filteredNominations = filteredNominations.filter(
        (nom) => nom.type === input.type
      );
    }
    
    if (input.day) {
      filteredNominations = filteredNominations.filter(
        (nom) => nom.day === input.day
      );
    }
    
    return {
      nominations: filteredNominations,
      timestamp: new Date(),
    };
  });