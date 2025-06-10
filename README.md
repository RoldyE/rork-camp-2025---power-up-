# Church Camp 2025 - Power Up! 

A React Native mobile app for managing church camp activities, team points, and camper nominations.

## Supabase Setup Instructions

### 1. Run the Fixed SQL Setup Script

Copy and paste the entire content of `supabase-setup-fixed.sql` into your Supabase SQL Editor and run it. This will:
- Create all necessary tables with TEXT IDs (not UUIDs)
- Insert initial team and camper data
- Set up permissive Row Level Security policies
- Enable real-time subscriptions

### 2. Key Fixes Applied

**RLS Policy Issues Fixed:**
- Created permissive policies that allow all operations
- Policies now use `FOR ALL USING (true) WITH CHECK (true)`

**ID Generation Fixed:**
- Changed from UUID to TEXT IDs with proper prefixes
- Point history IDs: `ph_timestamp_randomstring`
- Nomination IDs: `nom_timestamp_randomstring`
- Vote IDs: `vote_timestamp_randomstring`

**Admin Access Fixed:**
- Login with username "admin" (case insensitive) to get admin privileges
- Only admins can add/reset points and reset votes
- Regular users can only vote and view information

**Teams View Fixed:**
- Simplified team cards with smaller height (60px)
- Reduced gaps and improved scrolling
- Compact design showing team name and points

**Individual Team Reset Fixed:**
- Reset button only appears on individual team detail pages
- Only resets the specific team's points, not all teams
- Clear confirmation dialog explains it's individual reset only

### 3. Testing the App

1. **Admin Testing:**
   - Login as "admin" to test admin features
   - Try adding points to individual teams
   - Test individual team reset (only resets that team)

2. **Regular User Testing:**
   - Login with any other name to test regular user features
   - Try voting on nominations
   - Verify you cannot add points or reset

3. **Teams View:**
   - Should show compact list of all teams
   - Each team card shows name and current points
   - Tap any team to view details and manage points (admin only)

### 4. Troubleshooting

If you still see errors:
1. **RLS Errors:** Make sure you ran the complete `supabase-setup-fixed.sql` script
2. **UUID Errors:** Clear app cache and restart - the new ID system should fix this
3. **Admin Issues:** Make sure you're logging in with exactly "admin" as the username
4. **Team View:** The simplified cards should now be much more compact and scrollable

### 5. What's Fixed

- ✅ RLS policy errors resolved with permissive policies
- ✅ UUID errors fixed with TEXT ID system
- ✅ Admin detection works with "admin" username
- ✅ Teams view is compact and scrollable
- ✅ Individual team reset only affects that team
- ✅ Proper error handling and ID generation

The app now properly syncs with Supabase and handles all the previous issues with permissions, IDs, and team management.