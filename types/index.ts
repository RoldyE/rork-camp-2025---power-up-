// Team types
export interface Team {
  id: string;
  name: string;
  color: string;
  points: number;
  pointHistory?: PointEntry[];
}

export interface PointEntry {
  id: string;
  points: number;
  reason: string;
  date: string;
}

// Camper types
export interface Camper {
  id: string;
  name: string;
  age: number;
  teamId: string;
  cabin: string;
  imageUrl?: string;
}

// Game types
export interface Game {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  teamIds: string[];
  status: GameStatus;
  winner?: string;
  imageUrl?: string;
}

export type GameStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

// Schedule types
export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  day: string;
  type: ScheduleItemType;
}

export type ScheduleItemType = "activity" | "meal" | "game" | "event" | "free-time";

// Nomination types
export interface Nomination {
  id: string;
  camperId: string;
  reason: string;
  day: string;
  type: NominationType;
  votes: number;
}

export type NominationType = "daily" | "sportsmanship" | "bravery" | "service" | "scholar" | "other";

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  imageUrl?: string;
}

export type UserRole = "camper" | "counselor" | "admin";

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  icon: string;
}

export type ResourceCategory = "forms" | "guides" | "schedules" | "contacts" | "emergency" | "other";

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: NotificationType;
}

export type NotificationType = "announcement" | "schedule-change" | "game-result" | "nomination" | "emergency" | "other";

// Voting types
export interface UserVote {
  userId: string;
  nominationType: NominationType;
  day: string;
  timestamp: string;
}