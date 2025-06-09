export type Team = {
  id: string;
  name: string;
  color: string;
  points: number;
  pointHistory?: PointEntry[];
};

export type PointEntry = {
  id: string;
  points: number;
  reason: string;
  date: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  day: string;
};

export type GameScheduleItem = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  day: string;
  teams: string[];
  instructions: string;
};

export type Camper = {
  id: string;
  name: string;
  teamId: string;
  image?: string;
  facebookId?: string;
};

export type NominationType = 'daily' | 'sportsmanship' | 'bravery' | 'service' | 'scholar' | 'other';

export type Nomination = {
  id: string;
  camperId: string;
  reason: string;
  votes: number;
  day: string;
  type: NominationType;
};

export type Resource = {
  id: string;
  name: string;
  description: string;
  type: "pdf" | "doc" | "image" | "other" | "link";
  uri: string;
  size: number;
  dateAdded: string;
  category: "devotional" | "activity" | "general" | "scoring" | "communication";
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'schedule' | 'game' | 'nomination' | 'team' | 'general';
  link?: string;
};