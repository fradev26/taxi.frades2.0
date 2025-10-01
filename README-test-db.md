# Database Test Script Documentation

## Overview

`test-db.ts` is a comprehensive database testing script for the Taxi Frades application. It validates Supabase database connectivity, table accessibility, and basic CRUD operations.

## Fixed Issues

The script was previously failing due to several critical issues that have now been resolved:

### Problems Identified and Fixed

1. **`import.meta.env` Not Available in Node.js**
   - **Problem**: The script tried to import from `./src/integrations/supabase/client.ts`, which uses `import.meta.env` - a Vite-specific API that doesn't exist in Node.js
   - **Solution**: Created a Node.js-compatible Supabase client directly in the test script using `process.env`

2. **localStorage Not Available in Node.js**
   - **Problem**: The browser-based Supabase client configuration uses `localStorage` for session persistence
   - **Solution**: Configured the Supabase client with `persistSession: false` for Node.js compatibility

3. **Missing Environment Variable Handling**
   - **Problem**: No validation or fallback for missing environment variables
   - **Solution**: Added proper environment variable checking with fallback to hardcoded values for testing

4. **Poor Error Handling**
   - **Problem**: Generic error messages without context
   - **Solution**: Added detailed error messages, network diagnostics, and helpful troubleshooting hints

5. **No Timeout Mechanism**
   - **Problem**: Script could hang indefinitely on network issues
   - **Solution**: Added 30-second timeout with Promise.race pattern

6. **No Test Summary**
   - **Problem**: Hard to see overall test status at a glance
   - **Solution**: Added comprehensive test summary with pass/fail indicators

## Usage

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables (optional):
   ```bash
   export VITE_SUPABASE_URL="your-supabase-url"
   export VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
   
   If not set, the script will use fallback values for testing.

### Running the Script

```bash
npx tsx test-db.ts
```

Or add to package.json:
```json
{
  "scripts": {
    "test:db": "tsx test-db.ts"
  }
}
```

Then run:
```bash
npm run test:db
```

## What the Script Tests

1. **Environment Configuration**
   - Validates required environment variables
   - Provides warnings for missing variables with fallback options

2. **Authentication Connection**
   - Tests Supabase auth endpoint connectivity
   - Reports current authentication status

3. **Basic Database Connection**
   - Verifies database is accessible
   - Tests query execution capability

4. **Table Accessibility**
   - Tests access to: `users`, `vehicles`, `bookings`, `profiles`
   - Reports row counts for each table

5. **CRUD Operations**
   - Inserts a test vehicle record
   - Verifies insert operation
   - Cleans up test data automatically

## Output Interpretation

### Success Indicators
- ✅ Green checkmarks indicate passing tests
- 🎉 "All tests passed!" message at the end
- Exit code: 0

### Failure Indicators
- ❌ Red X marks indicate failing tests
- ⚠️  Warning triangles for expected failures
- ℹ️  Information symbols provide troubleshooting hints
- Exit code: 1

### Common Issues and Solutions

#### Network Connectivity Issues
```
❌ Basic connection test failed: TypeError: fetch failed
ℹ️  Network connectivity issue detected. Please check:
   - Your internet connection
   - Supabase service status
   - Firewall or proxy settings
```
**Solution**: Verify internet connection and Supabase service status

#### Authentication Errors
```
❌ Auth error: Auth session missing!
ℹ️  Note: This is expected if no user is authenticated
```
**Solution**: This is expected in a testing environment without active sessions

#### Table Access Denied
```
❌ vehicles table error: permission denied for table vehicles
```
**Solution**: Check RLS policies and ensure the anon key has appropriate permissions

## Technical Details

### Node.js Compatibility

The script creates a Node.js-compatible Supabase client with:
- Direct use of `@supabase/supabase-js` package
- `process.env` for environment variables
- No localStorage dependency
- Disabled session persistence

### Timeout Handling

The script includes a 30-second timeout to prevent hanging:
```typescript
const TIMEOUT = 30000;
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Test timed out after 30 seconds')), TIMEOUT);
});

Promise.race([testDatabase(), timeoutPromise])
```

### Error Categorization

Errors are categorized and include:
- Network connectivity issues
- Authentication problems
- Permission/RLS policy errors
- Data validation errors

## Integration with CI/CD

This script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Test Database Connection
  run: npx tsx test-db.ts
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Maintenance

When adding new tables to the database:
1. Add table name to the `tables` array in the script
2. Update test cases if new tables have special requirements
3. Update this documentation

## Related Files

- `src/integrations/supabase/client.ts` - Browser-compatible Supabase client
- `src/integrations/supabase/types.ts` - TypeScript type definitions
- `supabase/migrations/` - Database schema migrations
