// Test script to check database tables
// This script runs in Node.js and requires environment variables to be set
import { createClient } from '@supabase/supabase-js';

// Environment variable validation
function checkEnvironment() {
  console.log('🔍 Checking environment setup...');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pbdwkbcpbrrxnvyzjrfa.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    console.log('❌ VITE_SUPABASE_URL environment variable is missing');
    return { valid: false, url: '', key: '' };
  }
  
  if (!supabaseKey) {
    console.log('⚠️  VITE_SUPABASE_ANON_KEY not found in environment, using fallback key');
    // Using the fallback key from client.ts for testing
    return { 
      valid: true, 
      url: supabaseUrl, 
      key: 'sb_publishable_yNTyuAkgVBipucKRQ4WErQ_B28NNFPS' 
    };
  }
  
  console.log('✅ Environment variables are set');
  console.log(`🔗 Using Supabase URL: ${supabaseUrl}`);
  return { valid: true, url: supabaseUrl, key: supabaseKey };
}

async function testDatabase() {
  console.log('🔍 Testing database connection and tables...\n');
  
  // Check environment first
  const env = checkEnvironment();
  if (!env.valid) {
    console.log('⛔ Environment check failed. Please check your environment variables.');
    process.exit(1);
  }
  
  // Create a Node.js-compatible Supabase client
  // Note: We skip localStorage and session persistence in Node.js
  const supabase = createClient(env.url, env.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  // Track test results
  const results = {
    connection: false,
    tables: {} as Record<string, boolean>,
    insert: false
  };

  // Test auth connection
  console.log('\n👤 Testing auth connection...');
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('❌ Auth error:', error.message);
      console.log('ℹ️  Note: This is expected if no user is authenticated in this environment');
    } else {
      console.log('✅ Supabase connection successful');
      console.log('👤 User:', data.user ? data.user.email : 'Not authenticated');
      results.connection = true;
    }
  } catch (err: unknown) {
    console.error('❌ Connection failed:', err instanceof Error ? err.message : String(err));
  }

  // Test basic connection with a simple query
  console.log('\n🔌 Testing basic database connection...');
  try {
    const { error } = await supabase.from('vehicles').select('id').limit(0);
    if (error) {
      console.log('❌ Basic connection test failed:', error.message);
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        console.log('ℹ️  Network connectivity issue detected. Please check:');
        console.log('   - Your internet connection');
        console.log('   - Supabase service status');
        console.log('   - Firewall or proxy settings');
      }
    } else {
      console.log('✅ Basic database connection successful');
      results.connection = true;
    }
  } catch (err: unknown) {
    console.error('❌ Basic connection test exception:', err instanceof Error ? err.message : String(err));
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND')) {
      console.log('ℹ️  Network connectivity issue detected. This may be due to:');
      console.log('   - No internet connection available');
      console.log('   - DNS resolution failure');
      console.log('   - Supabase URL is incorrect or service is down');
    }
  }

  // Test tables
  console.log('\n📋 Testing database tables...');
  const tables = ['users', 'vehicles', 'bookings', 'profiles'];
  
  for (const table of tables) {
    try {
      console.log(`Testing '${table}' table...`);
      
      // Get row count
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`❌ ${table} table error:`, countError.message);
        results.tables[table] = false;
      } else {
        console.log(`✅ ${table} table: OK (${count ?? 0} rows)`);
        results.tables[table] = true;
      }
    } catch (err: unknown) {
      console.error(`❌ ${table} table exception:`, err instanceof Error ? err.message : String(err));
      results.tables[table] = false;
    }
  }

  // Try to insert a test vehicle
  console.log('\n🚗 Testing vehicle insert...');
  let insertedVehicleId = null;
  
  try {
    const testVehicle = {
      name: 'Test Vehicle',
      type: 'sedan',
      capacity: 4,
      hourly_rate: 25.00,
      per_km_rate: 2.00,
      available: true,
      current_location: 'Test Location'
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([testVehicle])
      .select();

    if (error) {
      console.log('❌ Vehicle insert error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      if (error.message.includes('fetch failed')) {
        console.log('ℹ️  This error is likely due to network connectivity issues');
      }
    } else {
      console.log('✅ Vehicle insert successful');
      console.log('Inserted data:', JSON.stringify(data, null, 2));
      results.insert = true;
      
      // Store ID for cleanup
      if (data && data[0]) {
        insertedVehicleId = data[0].id;
      }
    }
  } catch (err: unknown) {
    console.error('❌ Vehicle test exception:', err instanceof Error ? err.message : String(err));
  }

  // Clean up test data
  if (insertedVehicleId) {
    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', insertedVehicleId);
      if (error) {
        console.log('❌ Clean up failed:', error.message);
      } else {
        console.log('🧹 Test data cleaned up successfully');
      }
    } catch (err: unknown) {
      console.error('❌ Clean up operation exception:', err instanceof Error ? err.message : String(err));
    }
  }

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('═══════════════════════════════════════');
  console.log(`Connection: ${results.connection ? '✅ PASSED' : '❌ FAILED'}`);
  Object.entries(results.tables).forEach(([table, success]) => {
    console.log(`${table} table: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  });
  console.log(`Vehicle insert: ${results.insert ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('═══════════════════════════════════════');
  
  // Determine exit code based on results
  const allPassed = results.connection && 
                    Object.values(results.tables).every(v => v) && 
                    results.insert;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run with timeout to avoid hanging
const TIMEOUT = 30000; // 30 seconds timeout
const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Test timed out after 30 seconds')), TIMEOUT);
});

console.log('Starting database tests...\n');

Promise.race([testDatabase(), timeoutPromise])
  .catch(err => {
    console.error('\n❌ Test failed with error:', err);
    process.exit(1);
  });