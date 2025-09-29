import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  btw_number?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  btw_number?: string;
}

export const getUserProfile = async (userId: string): Promise<{ data: UserProfile | null; error: any }> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { data, error };
};

export const updateUserProfile = async (
  userId: string,
  updates: UpdateUserProfileData
): Promise<{ data: UserProfile | null; error: any }> => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .maybeSingle();

  return { data, error };
};

export const getCurrentUserProfile = async (): Promise<{ data: UserProfile | null; error: any }> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('No authenticated user') };
  }

  return getUserProfile(user.id);
};