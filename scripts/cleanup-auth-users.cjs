const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function cleanupAuthUsers() {
  // 1. Get all users from main users table
  const { data: appUsers, error: appError } = await supabase.from('users').select('id');
  if (appError) {
    console.error('Error fetching app users:', appError.message);
    return;
  }
  const appUserIds = new Set(appUsers.map((u) => u.id));

  // 2. Get all users from auth.users
  const { data: authList, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError.message);
    return;
  }

  // 3. Find auth users not in app users
  const toDelete = authList.users.filter((u) => !appUserIds.has(u.id));
  if (toDelete.length === 0) {
    console.log('No orphaned auth users found.');
    return;
  }

  // 4. Delete orphaned auth users
  for (const user of toDelete) {
    const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
    if (delError) {
      console.error(`Error deleting auth user ${user.email}:`, delError.message);
    } else {
      console.log(`Deleted auth user: ${user.email}`);
    }
  }
}

cleanupAuthUsers();
