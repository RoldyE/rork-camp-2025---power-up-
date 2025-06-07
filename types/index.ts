// Team types
export interface Team {
  id: string;
  name: string;
  color: string;
  logo?: string;
  points: number;
  pointHistory?: PointEntry[];
}

export interface PointEntry {
  id: string;
  points: number;
  reason: string;
  date: string;
}

// Nomination types
export type NominationType = "daily" | "sportsmanship" | "bravery" | "service" | "scholar" | "other";

export interface Nomination {
  id: string;
  camperId: string;
  reason: string;
  day: string;
  type: NominationType;
  votes: number;
}

export interface UserVote {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}

// Add any other types needed for the application