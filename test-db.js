import { supabase } from './src/integrations/supabase/client.js';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // Test 1: Check if we can connect to Supabase
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('✅ Auth connection successful');
    if (user) {
      console.log('📧 Current user:', user.email);
    } else {
      console.log('❌ No authenticated user');
    }
  } catch (error) {
    console.log('❌ Auth connection failed:', error.message);
  }

  // Test 2: Check if vehicles table exists
  try {
    const { data, error } = await supabase.from('vehicles').select('count').single();
    if (error) {
      console.log('❌ Vehicles table error:', error.message);
    } else {
      console.log('✅ Vehicles table exists');
    }
  } catch (error) {
    console.log('❌ Vehicles table test failed:', error.message);
  }

  // Test 3: Check if bookings table exists
  try {
    const { data, error } = await supabase.from('bookings').select('count').single();
    if (error) {
      console.log('❌ Bookings table error:', error.message);
    } else {
      console.log('✅ Bookings table exists');
    }
  } catch (error) {
    console.log('❌ Bookings table test failed:', error.message);
  }

  // Test 4: Check if profiles table exists
  try {
    const { data, error } = await supabase.from('profiles').select('count').single();
    if (error) {
      console.log('❌ Profiles table error:', error.message);
    } else {
      console.log('✅ Profiles table exists');
    }
  } catch (error) {
    console.log('❌ Profiles table test failed:', error.message);
  }

  // Test 5: Check if users table exists
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.log('❌ Users table error:', error.message);
    } else {
      console.log('✅ Users table exists');
    }
  } catch (error) {
    console.log('❌ Users table test failed:', error.message);
  }
}

testDatabaseConnection();