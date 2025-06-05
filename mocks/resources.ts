import { Resource } from "@/types";

export const scoringRubric: string = `
LEVEL UP POINT SYSTEM
Category | Points | Description
---------|--------|------------
1st Place in Game | 10 pts | Winning team of a competitive event or challenge
2nd Place | 7 pts | Runner-up in timed or score-based events
3rd Place | 5 pts | Third place or participation credit (if applicable)
Completion / Effort | 3 pts | For teams who finish a challenge but didn't place
Bonus Objective | 2–5 pts | Finding Kingdom Coins, bonus items, completing extra challenges
Team Spirit Award | 5 pts | For best team chant, encouragement, attitude, or costume
Memory Verse Award | 5 pts/team | Optional: for completing or reciting the Power-Up Verse of the Day
Leader's Pick | 3 pts/team | For groups that showed exceptional teamwork or helped another team

Day 1
• Capture the Flag:
  ○ 1st = 10, 2nd = 7, 3rd = 5
  ○ +2 pts per Kingdom Coin found
  ○ +5 for best team cheer
• Frisbee Race Alternative:
  ○ Fastest = 10, Cooperation = +5
  ○ Relay completion = 3 pts

Day 2
• Ultimate Dodgeball:
  ○ Team wins = 10
  ○ Best effort or strategy = 5
  ○ Spirit points = 5
• Relay Challenge:
  ○ Time-based scoring or completion = 10/7/5
  ○ Memory Verse Challenge = +5 (if added)

Day 3
• Water Olympics Games (each game):
  ○ Watermelon Push, Tug of War, Ping Pong Toss
    ▪ 1st = 10, 2nd = 7, 3rd = 5
    ▪ Extra 2 pts for cheering or creative teamwork
• Jet Fuel Fill Up & Foam Quest:
  ○ Completion = 3
  ○ Most water/most tokens = 10
  ○ Bonus item = 2–5 pts
• King of the Watermelon:
  ○ Winning team = 10
  ○ Most supportive = 5

Day 4
• Lake Gauntlet Challenge:
  ○ 1st to finish = 10
  ○ Completion = 5
  ○ Bonus for creative station completion = +3
• Cannonball or Sponge Toss:
  ○ Best splash/catch = 10
  ○ Crowd reaction = 5

TRIVIA, PUZZLES & NON-PHYSICAL GAMES
Type | Points
-----|-------
Correct Answer (Team Round) | +5 pts
Correct Answer (Individual Round) | +1 pt (goes to team total)
Fastest Correct Answer | +2 pts
Bonus or Challenge Question | +10 pts
Puzzle Race or Scavenger Hunt | 10 / 7 / 5 / 3 (place-based)

TEAM SPIRIT + CHARACTER BONUS
Category | Points
---------|-------
Best Team Chant or Spirit | +5 pts
Memory Verse Recited as a Team | +5 pts
Leader's Pick (Encouragement, Helpfulness, Leadership) | +3 pts
Most Creative or Themed Outfit | +2–3 pts (optional)
`;

export const resources: Resource[] = [
  {
    id: "1",
    name: "Small Group Leader Guide",
    description: "Complete guide for small group leaders with discussion questions and activities",
    type: "pdf",
    uri: "https://example.com/small-group-guide.pdf",
    size: 2500000,
    dateAdded: new Date().toISOString(),
    category: "activity",
  },
  {
    id: "2",
    name: "Camp Photos",
    description: "Link to Google Photos album with camp pictures",
    type: "link",
    uri: "https://photos.app.goo.gl/VS9U2QYpH8LajXpj6",
    size: 0,
    dateAdded: new Date().toISOString(),
    category: "general",
  },
  {
    id: "3",
    name: "Parent Communication",
    description: "Facebook group for parent updates and communication",
    type: "link",
    uri: "https://www.facebook.com/share/g/18iEFxESNt/",
    size: 0,
    dateAdded: new Date().toISOString(),
    category: "communication",
  },
  {
    id: "4",
    name: "GroupMe Chat",
    description: "Link to GroupMe chat for camp communication",
    type: "link",
    uri: "https://groupme.com/join_group/107824904/NcJ6RyHB",
    size: 0,
    dateAdded: new Date().toISOString(),
    category: "communication",
  },
  {
    id: "5",
    name: "Team Scoring Rubric",
    description: "Detailed guide on how team points are awarded",
    type: "pdf",
    uri: "https://example.com/scoring-guide.pdf",
    size: 1200000,
    dateAdded: new Date().toISOString(),
    category: "scoring",
  },
  {
    id: "6",
    name: "Morning Devotionals",
    description: "Daily devotional materials for morning sessions",
    type: "pdf",
    uri: "https://example.com/devotionals.pdf",
    size: 1800000,
    dateAdded: new Date().toISOString(),
    category: "devotional",
  },
  {
    id: "7",
    name: "Level Up Point System",
    description: "Detailed scoring rubric for all camp activities",
    type: "pdf",
    uri: "https://example.com/level-up-points.pdf",
    size: 1500000,
    dateAdded: new Date().toISOString(),
    category: "scoring",
  },
];