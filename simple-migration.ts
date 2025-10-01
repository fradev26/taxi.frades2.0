import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pbdwkbcpbrrxnvyzjrfa.supabase.co',
  'sb_publishable_yNTyuAkgVBipucKRQ4WErQ_B28NNFPS'
);

async function createTables() {
  console.log('🚀 Creating database tables...\n');

  // 1. Maak vehicles tabel
  console.log('📝 Creating vehicles table...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vehicles (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text,
          type text,
          capacity integer,
          hourly_rate numeric(10,2),
          per_km_rate numeric(10,2),
          available boolean DEFAULT true,
          current_location text,
          current_lat numeric(10,8),
          current_lng numeric(10,8),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    });
    
    if (error) {
      console.log('❌ Vehicles table error:', error);
    } else {
      console.log('✅ Vehicles table created');
    }
  } catch (err) {
    console.log('❌ Vehicles table failed:', err);
  }

  // 2. Test direct insert
  console.log('\n🧪 Testing vehicle insert...');
  try {
    const { data, error } = await supabase
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

    if (error) {
      console.log('❌ Insert error:', error);
    } else {
      console.log('✅ Insert successful:', data);
      
      // Cleanup
      if (data?.[0]?.id) {
        await supabase.from('vehicles').delete().eq('id', data[0].id);
        console.log('🧹 Test data cleaned');
      }
    }
  } catch (err) {
    console.log('❌ Insert test failed:', err);
  }

  // 3. Test bestaande tabellen
  console.log('\n📋 Checking existing tables...');
  const tables = ['users', 'vehicles', 'bookings', 'profiles'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count');
      console.log(`${error ? '❌' : '✅'} ${table}:`, error?.message || 'OK');
    } catch (err) {
      console.log(`❌ ${table}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

createTables();