import { GameScheduleItem } from "@/types";

export const games: GameScheduleItem[] = [
  // Tuesday
  {
    id: "1",
    title: "Color Team Hype",
    description: "• Team chant warm-up\n• Wave team flags\n• Leader intro & scoreboard kickoff",
    startTime: "19:00",
    endTime: "19:20",
    location: "Field",
    day: "Tuesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will gather in their designated areas. Each team will practice and perform their team chant. Team leaders will introduce themselves and explain the scoring system for the week."
  },
  {
    id: "2",
    title: "Capture the Flag w/Kingdom Coin Search",
    description: "Classic version with a twist: opposing team gets extra points for finding coins + capturing flag",
    startTime: "19:20",
    endTime: "20:00",
    location: "Field",
    day: "Tuesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Classic capture the flag rules apply. Each team defends their flag while trying to capture other teams' flags. Special twist: Kingdom Coins are hidden throughout the playing field. Teams earn 2 extra points for each coin found in addition to points for capturing flags."
  },
  {
    id: "3",
    title: "Pool Noodle Frisbee Race",
    description: "• 2 team members guide 1 \"Data Disc\" carrier with noodles through a cone path\n• Relay style (switch out every lap)\n• Points for speed, cooperation, and spirit",
    startTime: "19:20",
    endTime: "20:00",
    location: "Field",
    day: "Tuesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will form groups of 3: 1 disc carrier and 2 guides. The disc carrier holds the frisbee while being guided through a cone path using only pool noodles (no touching). Teams switch roles after each lap. Points awarded for fastest completion, teamwork, and team spirit."
  },
  {
    id: "4",
    title: "Pool Night Swim",
    description: "Evening swimming activities",
    startTime: "20:00",
    endTime: "21:30",
    location: "Pool",
    day: "Tuesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Free swim time with organized pool games. Lifeguards will be on duty. All campers must follow pool safety rules."
  },
  
  // Wednesday
  {
    id: "5",
    title: "Boys - Zipline & Jelly Blaster",
    description: "Adventure activities for boys",
    startTime: "09:30",
    endTime: "11:30",
    location: "Low Ropes Area",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Boys will be divided into two groups. One group will do the zipline while the other does the Jelly Blaster activity. Groups will switch halfway through."
  },
  {
    id: "6",
    title: "Girls - Rock wall & Screamer",
    description: "Adventure activities for girls",
    startTime: "09:30",
    endTime: "11:30",
    location: "Adventure Area",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Girls will be divided into two groups. One group will do the rock wall while the other does the Screamer. Groups will switch halfway through."
  },
  {
    id: "7",
    title: "Lakes - Slide/ Blob/ Boats",
    description: "Lake activities",
    startTime: "12:30",
    endTime: "14:00",
    location: "Lake",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Campers will be divided into three groups. Groups will rotate between the lake slide, blob, and boat activities. Life jackets required for all water activities."
  },
  {
    id: "8",
    title: "Color Team Hype",
    description: "• Quick team check-in and cheer session\n• Explain the evening's structure and expectations",
    startTime: "18:00",
    endTime: "18:10",
    location: "Recreation Areas",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will gather for a quick check-in and cheer session. Leaders will explain the evening's structure and expectations."
  },
  {
    id: "9",
    title: "Ultimate Dodgeball",
    description: "• Classic dodgeball with optional twists\n• \"Spirit Shield\" or \"Revive Zone\" variations\n• Teams face off in rotating matches",
    startTime: "18:10",
    endTime: "19:00",
    location: "Recreation Areas",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Classic dodgeball with optional twists like 'Spirit Shield' or 'Revive Zone'. Color teams face off in rotating matches or large-group elimination. Team wins = 10 points, Best effort or strategy = 5 points, Spirit points = 5 points."
  },
  {
    id: "10",
    title: "Field Relay Challenge",
    description: "Various relay challenges",
    startTime: "19:00",
    endTime: "19:30",
    location: "Recreation Areas",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will compete in various relay challenges. Time-based scoring: 1st = 10 points, 2nd = 7 points, 3rd = 5 points. Memory Verse Challenge = +5 points (if added)."
  },
  {
    id: "11",
    title: "Trivia & Brain Games",
    description: "Knowledge-based team competition",
    startTime: "19:00",
    endTime: "19:30",
    location: "Recreation Areas",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams compete in trivia rounds covering Bible knowledge, camp facts, and fun categories. Correct team answers = 5 points, Individual correct answers = 1 point for team, Fastest correct answer = +2 points, Bonus questions = 10 points."
  },
  {
    id: "12",
    title: "Scavenger Hunt",
    description: "Pre-planned route with clues and challenges",
    startTime: "19:00",
    endTime: "19:30",
    location: "Camp Grounds",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams follow clues around camp to complete challenges and find items. First team to complete all stations = 10 points, Second = 7 points, Third = 5 points. All teams that finish receive 3 points."
  },
  {
    id: "13",
    title: "Rotating Stations",
    description: "• Gaga Ball Pit\n• Wiffle Ball Field\n• Hayride\n• Basketball\n• Game Room",
    startTime: "19:30",
    endTime: "21:00",
    location: "Various Locations",
    day: "Wednesday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Campers can choose between: Gaga Ball Pit, Wiffle Ball Field, and optional activities like Hayride, Basketball, or Game Room."
  },
  
  // Thursday
  {
    id: "14",
    title: "Girls - Wild Hike Jr",
    description: "Nature hike for girls",
    startTime: "09:30",
    endTime: "11:30",
    location: "Camp Trails",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Girls will go on a guided nature hike with team leaders. The hike includes nature identification activities and team-building challenges along the trail."
  },
  {
    id: "15",
    title: "Boys - Low Ropes",
    description: "Team building activities for boys",
    startTime: "09:30",
    endTime: "11:30",
    location: "Low Ropes Course",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Boys will participate in low ropes course activities designed to build teamwork and communication skills. Staff will guide teams through various challenges."
  },
  {
    id: "16",
    title: "Color Team Hype",
    description: "Team preparation for Water Olympics",
    startTime: "12:30",
    endTime: "12:40",
    location: "Pool",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will gather for a quick pep rally before the Water Olympics begin. Leaders will explain the events and scoring system."
  },
  {
    id: "17",
    title: "Water Olympics",
    description: "• Watermelon Push\n• Tug of War\n• Ping Pong Color Toss",
    startTime: "12:40",
    endTime: "14:00",
    location: "Pool",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will compete in various water games: 1) Watermelon Push: Teams push a greased watermelon across the pool, 2) Tug of War: Teams compete in water-based tug of war, 3) Ping Pong Color Toss: Teams toss ping pong balls into colored cups. For each game: 1st = 10 points, 2nd = 7 points, 3rd = 5 points. Extra 2 points for cheering or creative teamwork."
  },
  {
    id: "18",
    title: "Rec Foam and Water Games",
    description: "• Jet Fuel Fill Up\n• Water Balloon Toss\n• Foam Frenzy Quest",
    startTime: "18:00",
    endTime: "19:00",
    location: "Field",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "1) Jet Fuel Fill Up: Teams relay to fill containers with water using sponges or cups. 2) Water Balloon Toss: Partners toss water balloons, stepping back after each successful catch. 3) Foam Frenzy Quest: Colored items (balls, tokens) are hidden in foam - one color per team. Teams must find their items and place them in color-coded buckets. Completion = 3 points, Most water/tokens = 10 points, Bonus items = 2-5 points."
  },
  {
    id: "19",
    title: "Foam - Water Slide",
    description: "Free time on foam and water slide",
    startTime: "19:00",
    endTime: "19:30",
    location: "Field",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Free time for all campers to enjoy the foam and water slide. Staff will supervise for safety."
  },
  {
    id: "20",
    title: "King of the Watermelon",
    description: "Pool game with watermelon",
    startTime: "20:00",
    endTime: "20:30",
    location: "Pool",
    day: "Thursday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams compete to maintain control of a greased watermelon in the pool. Winning team = 10 points, Most supportive = 5 points."
  },
  
  // Friday
  {
    id: "21",
    title: "Girls - Zipline & Jelly Blaster",
    description: "Adventure activities for girls",
    startTime: "09:30",
    endTime: "11:30",
    location: "Low Ropes Area",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Girls will be divided into two groups. One group will do the zipline while the other does the Jelly Blaster activity. Groups will switch halfway through."
  },
  {
    id: "22",
    title: "Boys - Rock wall & Screamer",
    description: "Adventure activities for boys",
    startTime: "09:30",
    endTime: "11:30",
    location: "Adventure Area",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Boys will be divided into two groups. One group will do the rock wall while the other does the Screamer. Groups will switch halfway through."
  },
  {
    id: "23",
    title: "Lake Gauntlet Challenge",
    description: "Timed obstacle course using lake activities",
    startTime: "13:00",
    endTime: "14:45",
    location: "Lake",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams will participate in the Gauntlet challenge - a timed obstacle course using the lake slide, blob, and boats. 1st to finish = 10 points, Completion = 5 points, Bonus for creative station completion = +3 points."
  },
  {
    id: "24",
    title: "Lake Free Time",
    description: "Free time at the lake",
    startTime: "14:45",
    endTime: "15:30",
    location: "Lake",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Free time for all campers to enjoy the lake activities including blob, boats, and slide. Life jackets required for all water activities."
  },
  {
    id: "25",
    title: "Cannonball Contest",
    description: "Pool competition",
    startTime: "18:30",
    endTime: "19:00",
    location: "Pool",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams compete in a cannonball contest. Judges will score based on splash size, style, and crowd reaction. Best splash = 10 points, Crowd reaction = 5 points."
  },
  {
    id: "26",
    title: "Sponge Toss",
    description: "Toss soaked sponges to a teammate who must catch them in a bucket",
    startTime: "18:30",
    endTime: "19:00",
    location: "Pool",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Teams form pairs with one member holding a bucket and the other tossing water-soaked sponges. Points awarded for most water collected in the bucket within the time limit. Most water = 10 points, Good teamwork = 5 points."
  },
  {
    id: "27",
    title: "Pool Free Time",
    description: "Final evening swim",
    startTime: "19:00",
    endTime: "20:00",
    location: "Pool",
    day: "Friday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Free swim time for all campers. Special games and activities will be organized by the pool staff. All regular pool safety rules apply."
  },
  
  // Saturday
  {
    id: "28",
    title: "Awards Ceremony",
    description: "• Camper of the Week\n• Sportsmanship\n• Bravery\n• Service\n• Scholar\n• Team Awards",
    startTime: "09:00",
    endTime: "09:30",
    location: "Boys Ranch",
    day: "Saturday",
    teams: ["red", "blue", "yellow", "orange", "green", "purple"],
    instructions: "Awards will be presented for: Camper of the Week, Sportsmanship, Bravery, Service, Scholar, Each Team Recognition (Character Award), Leader Fun Awards, and Team Awards (1st, 2nd, 3rd place)."
  },
];