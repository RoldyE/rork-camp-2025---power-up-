import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nominations as initialNominations } from "@/mocks/nominations";
import { Nomination, NominationType } from "@/types";

// Define types for global storage
interface GlobalStorage {
  nominations?: Nomination[];
  nominationsByTypeAndDay?: Record<string, Nomination[]>;
}

// Get the global object
const globalObj = global as unknown as GlobalStorage;

// In-memory database for nominations - make it global for persistence
if (!globalObj.nominations) {
  globalObj.nominations = [...initialNominations];
}

// Export the global reference
export let nominations = globalObj.nominations;

// Create a map to store nominations by type and day for faster lookups
if (!globalObj.nominationsByTypeAndDay) {
  globalObj.nominationsByTypeAndDay = {};
}

export let nominationsByTypeAndDay = globalObj.nominationsByTypeAndDay;

// Initialize the map if it's empty
if (Object.keys(nominationsByTypeAndDay).length === 0) {
  initialNominations.forEach((nom: Nomination) => {
    const key = `${nom.type}-${nom.day}`;
    if (!nominationsByTypeAndDay[key]) {
      nominationsByTypeAndDay[key] = [];
    }
    nominationsByTypeAndDay[key].push(nom);
  });
}

export default publicProcedure
  .input(
    z.object({
      camperId: z.string(),
      reason: z.string(),
      day: z.string(),
      type: z.enum(["daily", "sportsmanship", "bravery", "service", "scholar", "other"]),
    })
  )
  .mutation(({ input }) => {
    const { camperId, reason, day, type } = input;
    
    // Create a new nomination
    const newNomination: Nomination = {
      id: Date.now().toString(),
      camperId,
      reason,
      day,
      type,
      votes: 0,
      timestamp: new Date().toISOString(),
    };
    
    // Add to the main nominations array
    nominations.push(newNomination);
    
    // Add to the type-day map
    const key = `${type}-${day}`;
    if (!nominationsByTypeAndDay[key]) {
      nominationsByTypeAndDay[key] = [];
    }
    nominationsByTypeAndDay[key].push(newNomination);
    
    console.log(`Added new nomination for camper ${camperId} of type ${type} for day ${day}`);
    
    return {
      success: true,
      nomination: newNomination,
      timestamp: new Date(),
    };
  });