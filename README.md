# Church Camp 2025 - Power Up! 

A React Native mobile app for managing church camp activities, team points, and camper nominations.

## Supabase Setup Instructions

### 1. Run the SQL Setup Script

Copy and paste the entire content of `supabase-setup.sql` into your Supabase SQL Editor and run it. This will:
- Create all necessary tables with correct column names
- Insert initial team and camper data
- Set up Row Level Security policies
- Enable real-time subscriptions

### 2. Verify Tables Created

After running the SQL script, you should see these tables in your Supabase dashboard:
- `teams` - Team information and points
- `campers` - Camper information linked to teams
- `point_history` - History of points added to teams
- `nominations` - Camper nominations for various categories
- `user_votes` - User voting history

### 3. Admin Access

- Login with username "admin" to get admin privileges
- Admins can add/reset points and reset votes
- Regular users can only vote and view information

### 4. Key Features Fixed

- **Teams View**: Simple scrollable list with smaller cards
- **Individual Team Reset**: Reset button only appears on individual team pages for admins
- **Admin Permissions**: Only admins can add points and reset data
- **Proper Column Names**: All Supabase queries use correct column names (teamid, camperid, etc.)
- **RLS Policies**: Permissive policies allow all operations for now

### 5. Testing the App

1. Login as "admin" to test admin features
2. Login with any other name to test regular user features
3. Try adding points to teams (admin only)
4. Try voting on nominations (all users)
5. Test the reset functionality (admin only)

### 6. Troubleshooting

If you still see errors:
1. Make sure you ran the complete SQL script
2. Check that all tables exist in your Supabase dashboard
3. Verify the RLS policies are in place
4. Clear the app cache and restart

The app now properly syncs with Supabase and handles all the column name mismatches and permission issues.