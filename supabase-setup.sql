-- First, let's create the proper tables with correct column names and structure

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS user_votes CASCADE;
DROP TABLE IF EXISTS point_history CASCADE;
DROP TABLE IF EXISTS nominations CASCADE;
DROP TABLE IF EXISTS campers CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Create teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campers table
CREATE TABLE campers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  teamid TEXT REFERENCES teams(id),
  image TEXT,
  facebookid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create point_history table
CREATE TABLE point_history (
  id TEXT PRIMARY KEY,
  teamid TEXT REFERENCES teams(id),
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nominations table
CREATE TABLE nominations (
  id TEXT PRIMARY KEY,
  camperid TEXT REFERENCES campers(id),
  reason TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  day TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_votes table
CREATE TABLE user_votes (
  id TEXT PRIMARY KEY,
  userid TEXT NOT NULL,
  nominationid TEXT REFERENCES nominations(id),
  nominationtype TEXT NOT NULL,
  day TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial teams data
INSERT INTO teams (id, name, color, points) VALUES
('red', 'Red Team', '#E57373', 0),
('blue', 'Blue Team', '#64B5F6', 0),
('yellow', 'Yellow Team', '#FFD54F', 0),
('orange', 'Orange Team', '#FFB74D', 0),
('green', 'Green Team', '#81C784', 0),
('purple', 'Purple Team', '#BA68C8', 0);

-- Insert campers data
INSERT INTO campers (id, name, teamid) VALUES
-- Red Team
('r1', 'Ava Eberbach', 'red'),
('r2', 'Charlie Teboe', 'red'),
('r3', 'Dominic Young', 'red'),
('r4', 'Ellie Klueber', 'red'),
('r5', 'Isabella Sandoval', 'red'),
('r6', 'Jace Garcia', 'red'),
('r7', 'Mario Reyes III', 'red'),
('r8', 'Naomi Gonzalez', 'red'),
('r9', 'Oaklynn Elliott', 'red'),
('r10', 'Robby Rael', 'red'),
('r11', 'Emily Bennett', 'red'),

-- Blue Team
('b1', 'Cecelia Marcum', 'blue'),
('b2', 'Claire Olson', 'blue'),
('b3', 'Elijah Smith', 'blue'),
('b4', 'Ember Martinez', 'blue'),
('b5', 'Gabriel Bennett', 'blue'),
('b6', 'Javier Machuca', 'blue'),
('b7', 'Kinsley Bugg', 'blue'),
('b8', 'Max Soto', 'blue'),
('b9', 'Reagan Perrine', 'blue'),
('b10', 'Ronnin Jennings', 'blue'),

-- Yellow Team
('y1', 'Addison Richards', 'yellow'),
('y2', 'Celeste Hodge', 'yellow'),
('y3', 'Emma Teboe', 'yellow'),
('y4', 'Hunter Noethen', 'yellow'),
('y5', 'JonMarco Garcia', 'yellow'),
('y6', 'Jordan Trantham', 'yellow'),
('y7', 'Lilly Harvey', 'yellow'),
('y8', 'Lincoln Perrine', 'yellow'),
('y9', 'Sawyer Galvez', 'yellow'),
('y10', 'Wrenley Shepherd', 'yellow'),

-- Orange Team
('o1', 'Arianna Castro', 'orange'),
('o2', 'Emily Riefler', 'orange'),
('o3', 'Francesca Gutierrez', 'orange'),
('o4', 'John Hodge', 'orange'),
('o5', 'Joshy Rael', 'orange'),
('o6', 'Kaylee Cloyed', 'orange'),
('o7', 'Madeline Riley', 'orange'),
('o8', 'Maverick Tinsley', 'orange'),
('o9', 'William Michalik', 'orange'),
('o10', 'Zoey Powers', 'orange'),

-- Green Team
('g1', 'Alivia Perez', 'green'),
('g2', 'Benjamin Riley', 'green'),
('g3', 'Bentley Weeks', 'green'),
('g4', 'Blakely Galloway', 'green'),
('g5', 'Estella Rodriguez', 'green'),
('g6', 'Harley Ryan', 'green'),
('g7', 'Konnor Ormand', 'green'),
('g8', 'Madelyn Cruz', 'green'),
('g9', 'Micah Smith', 'green'),
('g10', 'Zayden Harvey', 'green'),

-- Purple Team
('p1', 'Aliyah Perez', 'purple'),
('p2', 'Bella Machuca', 'purple'),
('p3', 'Cash Tomlinson', 'purple'),
('p4', 'Dani Harvey', 'purple'),
('p5', 'Evan Rodriguez', 'purple'),
('p6', 'Henleigh Powers', 'purple'),
('p7', 'Lincoln Shelton', 'purple'),
('p8', 'Nico Travis', 'purple'),
('p9', 'Reagan Ebersole', 'purple'),
('p10', 'Tommy Teboe', 'purple'),
('p11', 'River Tomlinson', 'purple');

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE campers ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on campers" ON campers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on point_history" ON point_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on nominations" ON nominations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_votes" ON user_votes FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE campers;
ALTER PUBLICATION supabase_realtime ADD TABLE point_history;
ALTER PUBLICATION supabase_realtime ADD TABLE nominations;
ALTER PUBLICATION supabase_realtime ADD TABLE user_votes;