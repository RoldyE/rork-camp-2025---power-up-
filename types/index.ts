export type Team = {
  id: string;
  name: string;
  color: string;
  logo?: string; // Make logo optional
  points: number;
  pointHistory: PointEntry[];
};

export type PointEntry = {
  id: string;
  points: number;
  reason: string;
  date: string;
};

export type NominationType = "daily" | "sportsmanship" | "bravery" | "service" | "scholar" | "other";

export type Nomination = {
  id: string;
  camperId: string;
  reason: string;
  day: string;
  type: NominationType;
  votes: number;
};

// Type for user votes
export type UserVote = {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
};

// Type for global variables in backend
declare global {
  var teams: Team[];
  var pointHistory: Record<string, PointEntry[]>;
  var nominations: Nomination[];
  var nominationsByTypeAndDay: Record<string, Nomination[]>;
  var userVotes: UserVote[];
}