import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pbdwkbcpbrrxnvyzjrfa.supabase.co',
  'sb_publishable_yNTyuAkgVBipucKRQ4WErQ_B28NNFPS'
);

async function testVehicles() {
  console.log('🚗 Testing vehicle operations...\n');

  // Test 1: Lees vehicles
  console.log('📖 Reading vehicles...');
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Read error:', error);
    } else {
      console.log('✅ Read successful:', data?.length || 0, 'vehicles found');
      if (data && data.length > 0) {
        console.log('   First vehicle:', data[0]);
      }
    }
  } catch (err) {
    console.log('❌ Read failed:', err);
  }

  // Test 2: Probeer admin authenticatie
  console.log('\n🔐 Testing authentication requirement...');
  try {
    // Probeer te authenticeren met een test gebruiker
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Anonymous auth successful');
      
      // Nu proberen vehicle toe te voegen
      const { data: insertData, error: insertError } = await supabase
        .from('vehicles')
        .insert([{
          name: 'Test Vehicle',
          type: 'sedan',
          capacity: 4,
          hourly_rate: 25.00,
          per_km_rate: 2.00,
          available: true,
          current_location: 'Test Location'
        }])
        .select();

      if (insertError) {
        console.log('❌ Insert error after auth:', insertError);
      } else {
        console.log('✅ Insert successful:', insertData);
      }
    }
  } catch (err) {
    console.log('❌ Auth test failed:', err);
  }

  // Test 3: Check RLS policies
  console.log('\n🛡️ Testing RLS policies...');
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact' });

    console.log(`Vehicles accessible: ${data?.length || 0}`);
    if (error) {
      console.log('RLS policy message:', error.message);
    }
  } catch (err) {
    console.log('❌ RLS test failed:', err);
  }
}

testVehicles();