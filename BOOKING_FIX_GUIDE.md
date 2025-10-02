# Booking Form Fix Guide

## Overview
This guide documents the fixes applied to resolve booking creation issues in the taxi booking application.

## Problems Identified

### 1. Vehicle Type Mismatch
**Problem**: The booking form uses vehicle types from `STANDARD_VEHICLES` config ("standard", "luxury", "van"), but the database contains different types ("sedan", "eco", "suv", "luxury").

**Solution**: Implemented smart fallback logic with type mapping:
```javascript
const vehicleTypeMapping = {
  'standard': ['sedan', 'eco', 'standard'],
  'luxury': ['luxury', 'premium'],
  'van': ['van', 'suv', 'minivan']
};
```

### 2. Missing Database Columns
**Problem**: The `bookings` table was missing several columns that were referenced in the `get_bookings_with_details()` function and needed for full functionality.

**Solution**: Created migration `20251002000000_add_missing_bookings_columns.sql` to add:
- `waypoints` (jsonb) - Stopover locations
- `estimated_duration` (integer) - Trip duration
- `estimated_distance` (integer) - Trip distance
- `estimated_cost` (numeric) - Estimated price
- `final_cost` (numeric) - Final price
- `payment_status` (text) - Payment tracking
- `payment_id` (text) - External payment ID
- `confirmation_sent` (boolean) - Email status
- `company_id` (uuid) - Corporate bookings

### 3. User Table Race Condition
**Problem**: When a user signs up, there's a trigger that creates their entry in the `users` table, but bookings might be attempted before the trigger completes.

**Solution**: Added user existence check that provides clear error message if user doesn't exist in the users table.

### 4. TypeScript Type Mismatch
**Problem**: The TypeScript types for the bookings table didn't match the actual database schema.

**Solution**: Updated `src/integrations/supabase/types.ts` to include all columns with correct types.

## Changes Made

### Files Modified

#### `src/components/BookingForm.tsx`
1. **Vehicle Matching Logic** (Lines ~950-980):
   - Added type mapping for compatible vehicle types
   - Fallback to any available vehicle if no match found
   - Applied to both authenticated and guest bookings

2. **User Existence Check** (Lines ~948-970):
   - Checks if user exists in users table before booking
   - Provides clear error message if user missing
   - Handles race condition gracefully

3. **Error Handling** (Lines ~1080-1100):
   - More specific error messages based on error type
   - Console logging for debugging
   - Checks for permission, duplicate, and foreign key errors

#### `src/integrations/supabase/types.ts`
- Updated `bookings` table Row, Insert, and Update types
- Added all missing fields with correct nullability
- Ensures type safety throughout application

#### `supabase/migrations/20251002000000_add_missing_bookings_columns.sql`
- New migration to add all missing columns
- Includes foreign key for company_id
- Adds helpful indexes for performance
- Adds column comments for documentation

## Deployment Steps

### 1. Apply Database Migration

If using Supabase CLI:
```bash
# Link to your project if not already linked
supabase link --project-ref YOUR_PROJECT_ID

# Push the migration
supabase db push
```

Or manually in Supabase Dashboard:
1. Go to SQL Editor
2. Copy the contents of `supabase/migrations/20251002000000_add_missing_bookings_columns.sql`
3. Execute the SQL

### 2. Verify Migration Success

Run this query to verify all columns exist:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
```

Expected columns:
- id, user_id, company_id, vehicle_id
- pickup_address, pickup_lat, pickup_lng
- destination_address, destination_lat, destination_lng
- waypoints, scheduled_time
- estimated_duration, estimated_distance, estimated_cost, final_cost
- status, price, payment_status, payment_method, payment_id
- vehicle_type, confirmation_sent
- created_at, updated_at

### 3. Test Booking Creation

1. **Login as a test user** (or create new account)
2. **Fill out booking form**:
   - Select pickup location
   - Select destination
   - Choose date and time
   - Select vehicle type (Standaard, Luxe, or Van)
   - Choose payment method
3. **Submit booking**
4. **Verify**:
   - Success message appears
   - Booking appears in database
   - No console errors

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] All new columns exist in bookings table
- [ ] TypeScript compilation passes (no errors)
- [ ] Dev server runs without errors
- [ ] User can login/signup
- [ ] User can fill booking form
- [ ] Booking submits successfully
- [ ] Booking appears in database with all fields
- [ ] Admin panel shows bookings correctly
- [ ] Vehicle matching works (even with mismatched types)

## Troubleshooting

### Issue: "Foreign key violation" on user_id
**Cause**: User doesn't exist in users table
**Solution**: The user check should catch this, but if not, verify the signup trigger is working:
```sql
SELECT * FROM users WHERE id = 'USER_AUTH_ID';
```

### Issue: "Column does not exist" error
**Cause**: Migration not applied
**Solution**: Apply the migration as described in Deployment Steps

### Issue: "No vehicles available" even though vehicles exist
**Cause**: Vehicle type mismatch
**Solution**: This should be handled by the fallback logic. Check vehicle types in database:
```sql
SELECT id, name, type, available FROM vehicles;
```

### Issue: "RLS policy violation" when creating booking
**Cause**: User doesn't have permission
**Solution**: Verify RLS policies on bookings table allow INSERT for authenticated users:
```sql
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

## Additional Notes

### Vehicle Type Mapping
The application now supports flexible vehicle type matching:
- **Standard** → matches "sedan", "eco", or "standard"
- **Luxury** → matches "luxury" or "premium"
- **Van** → matches "van", "suv", or "minivan"

### Required Fields for Booking
Minimum required fields:
- pickup_address
- destination_address
- scheduled_time
- payment_method
- vehicle_type (stored even if vehicle_id is null)
- user_id (for authenticated) or guest info (for guests)

### Optional Fields
These enhance functionality but aren't required:
- vehicle_id (can be null, vehicle_type is used)
- pickup_lat/lng (for map display)
- destination_lat/lng (for map display)
- waypoints (for stopovers)
- estimated_duration/distance/cost (calculated if available)

## Success Criteria

✅ The booking form is considered fixed when:
1. Users can successfully create bookings
2. No database errors occur
3. Bookings appear correctly in admin panel
4. All required fields are saved
5. Vehicle matching works with any vehicle type configuration

## Support

If issues persist after applying these fixes:
1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all migrations have been applied
4. Confirm user is properly authenticated
5. Test with sample data in database
