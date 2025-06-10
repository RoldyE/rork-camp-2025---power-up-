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

**ID Generation Fixed:**
- Changed from UUID to TEXT IDs with proper prefixes
- Point history IDs: `ph_timestamp_randomstring`
- Nomination IDs: `nom_timestamp_randomstring`
- Vote IDs: `vote_timestamp_randomstring`

**Admin Permissions Removed:**
- No more admin checks blocking functionality
- All users can add points, vote, and manage teams
- Simplified user experience

**Teams View Fixed:**
- Compact team cards with 60px height
- Small discrete reset button for each team
- Individual team reset (not all teams)
- Proper scrolling with reduced gaps

**Individual Team Reset Fixed:**
- Reset button only resets the specific team's points
- Clear confirmation dialog explains it's individual reset only
- Available both in team list and team detail pages

**Supabase Integration Fixed:**
- Proper string ID generation for all operations
- Fixed nomination and vote recording
- Real-time sync working properly
- Error handling for all database operations

### 3. Testing the App

1. **Team Management:**
   - View compact team list with points
   - Tap any team to view details and add points
   - Use discrete reset button to reset individual team points

2. **Nominations:**
   - Add nominations for any camper
   - Vote on nominations (2 votes per category)
   - View special nominations by category

3. **Points System:**
   - Add quick points (+1, +2, +5, +10) to teams
   - Add custom points with reasons
   - View point history for each team

### 4. Troubleshooting

If you still see errors:
1. **Database Errors:** Make sure you ran the complete `supabase-setup-fixed.sql` script
2. **ID Errors:** Clear app cache and restart - the new ID system should fix this
3. **Team View:** The simplified cards should now be compact and scrollable
4. **Reset Issues:** Individual reset only affects the selected team

### 5. What's Fixed

- ✅ Removed admin permission requirements
- ✅ Fixed UUID errors with TEXT ID system
- ✅ Teams view is compact and scrollable (60px height cards)
- ✅ Individual team reset only affects that team
- ✅ Discrete reset buttons in team list
- ✅ Proper Supabase integration with error handling
- ✅ Fixed nomination and vote recording
- ✅ Real-time sync working properly

The app now works without admin restrictions and properly syncs all data with Supabase.