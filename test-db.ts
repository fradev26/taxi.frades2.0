// Test script to check database tables
import { supabase } from './src/integrations/supabase/client';

async function testDatabase() {
  console.log('🔍 Testing database connection and tables...\n');

  // Test auth connection
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('❌ Auth error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('👤 User:', user ? user.email : 'Not authenticated');
    }
  } catch (err) {
    console.log('❌ Connection failed:', err);
  }

  // Test tables
  const tables = ['users', 'vehicles', 'bookings', 'profiles'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        console.log(`❌ ${table} table:`, error.message);
      } else {
        console.log(`✅ ${table} table: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table} table error:`, err);
    }
  }

  // Try to insert a test vehicle
  console.log('\n🚗 Testing vehicle insert...');
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
      console.log('Error details:', error);
    } else {
      console.log('✅ Vehicle insert successful:', data);
      
      // Clean up test data
      if (data && data[0]) {
        await supabase.from('vehicles').delete().eq('id', data[0].id);
        console.log('🧹 Test data cleaned up');
      }
    }
  } catch (err) {
    console.log('❌ Vehicle test failed:', err);
  }
}

testDatabase();