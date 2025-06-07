import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations as initialNominations } from "@/mocks/nominations";
import { NominationType, Nomination } from "@/types";

// In-memory database for nominations
// Using a more persistent approach with a global variable
// This will be shared across all imports of this module
let globalNominations = (global as any).nominations || [...initialNominations];
(global as any).nominations = globalNominations;

// Export this so other routes can access the same reference
export let nominations = globalNominations;

// Map to track nominations by type and day for faster lookups
// Also make this global to persist between server restarts
let globalNominationsByTypeAndDay = (global as any).nominationsByTypeAndDay || {};
(global as any).nominationsByTypeAndDay = globalNominationsByTypeAndDay;

export const nominationsByTypeAndDay = globalNominationsByTypeAndDay;

// Initialize the map if it's empty
function initializeNominationMap() {
  if (Object.keys(nominationsByTypeAndDay).length === 0) {
    nominations.forEach((nom: Nomination) => {
      const key = `${nom.type}-${nom.day}`;
      if (!nominationsByTypeAndDay[key]) {
        nominationsByTypeAndDay[key] = [];
      }
      nominationsByTypeAndDay[key].push(nom);
    });
  }
}

// Call initialization
initializeNominationMap();

export default publicProcedure
  .input(
    z.object({
      camperId: z.string(),
      reason: z.string(),
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"])
    })
  )
  .mutation(({ input }) => {
    const { camperId, reason, day, type } = input;
    
    // Create a new nomination with the correct type
    const newNomination: Nomination = {
      id: Date.now().toString(),
      camperId,
      reason,
      day,
      type: type as NominationType,
      votes: 0,
    };
    
    // Add the nomination to the database
    nominations.push(newNomination);
    
    // Update the map
    const key = `${type}-${day}`;
    if (!nominationsByTypeAndDay[key]) {
      nominationsByTypeAndDay[key] = [];
    }
    nominationsByTypeAndDay[key].push(newNomination);
    
    // Log for debugging
    console.log(`Added nomination: ${type} for day ${day}. Total nominations: ${nominations.length}`);
    
    return {
      success: true,
      nomination: newNomination,
      timestamp: new Date(),
    };
  });