export type NominationType = "daily" | "sportsmanship" | "bravery" | "service" | "scholar" | "other";

export interface Camper {
  id: string;
  name: string;
  age: number;
  teamId: string;
  imageUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  points: number;
  pointHistory: PointEntry[];
}

export interface PointEntry {
  id: string;
  points: number;
  reason: string;
  date: string;
}

export interface Nomination {
  id: string;
  camperId: string;
  reason: string;
  day: string;
  type: NominationType;
  votes: number;
  timestamp: string;
}

export interface UserVote {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  teamIds: string[];
  imageUrl?: string;
  rules?: string[];
  equipment?: string[];
  winner?: string;
  scores?: Record<string, number>;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  day: string;
  type: "activity" | "meal" | "game" | "ceremony" | "other";
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: "forms" | "guides" | "maps" | "contacts" | "emergency" | "other";
  icon?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "announcement" | "alert" | "reminder" | "other";
  link?: string;
}