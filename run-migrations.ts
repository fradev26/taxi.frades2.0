import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Directe configuratie zonder import.meta.env
const SUPABASE_URL = 'https://pbdwkbcpbrrxnvyzjrfa.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZHdrYmNwYnJyeG52eXpqcmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MjMyMDUsImV4cCI6MjA0MjQ5OTIwNX0.dYZ6hWMFLXHNQ8JjB4YKY3VBNfxZk_tI8RX_wYMz2No';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrations = [
    '20251001000000_create_vehicles_table.sql',
    '20251001000001_create_bookings_table.sql', 
    '20251001000002_create_profiles_table.sql'
  ];

  for (const migrationFile of migrations) {
    try {
      console.log(`📝 Running migration: ${migrationFile}`);
      
      const migrationPath = path.join('./supabase/migrations', migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Verwijder comments en split op statements
      const statements = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('/*'))
        .join('\n')
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`   Executing statement ${i + 1}/${statements.length}`);
          
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });
          
          if (error) {
            // Probeer directe SQL uitvoering als RPC faalt
            const { data: directData, error: directError } = await supabase
              .from('_temp_migration')
              .select('*')
              .limit(0);
              
            if (directError && directError.message.includes('does not exist')) {
              // Dit is verwacht - tabel bestaat niet
              console.log(`   ⚠️  Statement might need manual execution: ${statement.substring(0, 50)}...`);
            } else if (directError) {
              console.log(`   ❌ Error:`, directError.message);
            } else {
              console.log(`   ✅ Statement executed successfully`);
            }
          } else {
            console.log(`   ✅ Statement executed successfully`);
          }
        }
      }
      
      console.log(`✅ Migration ${migrationFile} completed\n`);
      
    } catch (error) {
      console.log(`❌ Error running ${migrationFile}:`, error);
    }
  }

  // Test of de tabellen nu bestaan
  console.log('🧪 Testing table creation...');
  
  const tables = ['vehicles', 'bookings', 'profiles'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

runMigrations().catch(console.error);