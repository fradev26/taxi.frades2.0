import { supabase } from "@/integrations/supabase/client";

// Use the existing `app_settings` table so we don't require a new migration.
// Values are stored as strings in `app_settings.value`, so serialize JSON when saving
// and attempt to parse when reading.
export async function saveAdminSetting(key: string, payload: any) {
  try {
    const value = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const { data, error } = await supabase.from('app_settings').upsert({ key, value }, { returning: 'minimal' });
    if (error) {
      console.warn('saveAdminSetting error', error);
      return { error };
    }
    return { data };
  } catch (e) {
    return { error: e };
  }
}

export async function getAdminSetting(key: string) {
  try {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).single();
    if (error) {
      // if table doesn't exist or no row, return null
      return { data: null, error };
    }
    let val = data?.value ?? null;
    if (typeof val === 'string') {
      try {
        val = JSON.parse(val);
      } catch (e) {
        // not JSON, return raw string
      }
    }
    return { data: val };
  } catch (e) {
    return { data: null, error: e };
  }
}

export default { saveAdminSetting, getAdminSetting };
