export type Team = {
  id: string;
  name: string;
  color: string;
  points: number;
  logo?: string; // Added logo property as optional
  pointHistory?: PointEntry[];
};

export type PointEntry = {
  id: string;
  points: number;
  reason: string;
  date: string;
};

export type Game = {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  teams: string[];
  winner?: string;
  score?: {
    [teamId: string]: number;
  };
};

export type Camper = {
  id: string;
  name: string;
  age: number;
  teamId: string;
  cabin: string;
  photo?: string;
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

export type UserVote = {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
};

export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: string;
};

// Type for global variables in backend routes
declare global {
  var teams: Team[];
  var nominations: Nomination[];
  var pointHistory: { [teamId: string]: PointEntry[] };
  var nominationsByTypeAndDay: { [key: string]: Nomination[] };
  var userVotes: UserVote[];
}