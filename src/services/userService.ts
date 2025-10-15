import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  btw_number?: string;
  company_address?: string;
  company_phone?: string;
  tax_category?: string;
  fiscal_year?: string;
  accounting_method?: string;
  tax_notes?: string;
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

  if (error) {
    return { data: null, error };
  }

  if (data) {
    // Get additional data from auth.users since it may not be in users table
    const { data: { user } } = await supabase.auth.getUser();
    const profileWithAuthData = {
      ...data,
      email: user?.email || data.email || '',
      first_name: data.first_name || user?.user_metadata?.first_name || '',
      last_name: data.last_name || user?.user_metadata?.last_name || '',
      phone: data.phone || user?.user_metadata?.phone || ''
    };
    return { data: profileWithAuthData, error: null };
  }

  return { data: null, error: null };
};

export const updateUserProfile = async (
  userId: string,
  updates: UpdateUserProfileData
): Promise<{ data: UserProfile | null; error: any }> => {
  // Only update fields that exist in the database
  const safeUpdates: any = {};
  
  // Only include non-undefined values
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof UpdateUserProfileData] !== undefined) {
      safeUpdates[key] = updates[key as keyof UpdateUserProfileData];
    }
  });

  const { data, error } = await supabase
    .from('users')
    .update(safeUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    
    // If update fails due to permissions, return a graceful error
    if (error.message && error.message.includes('permission denied')) {
      return { 
        data: null, 
        error: { 
          ...error, 
          message: 'Database update permission denied - changes will be saved locally',
          isPermissionError: true 
        } 
      };
    }
    
    return { data: null, error };
  }

  // Combine with auth data
  if (data) {
    const { data: { user } } = await supabase.auth.getUser();
    const profileWithAuthData = {
      ...data,
      email: user?.email || data.email || '',
      first_name: data.first_name || user?.user_metadata?.first_name || '',
      last_name: data.last_name || user?.user_metadata?.last_name || '',
      phone: data.phone || user?.user_metadata?.phone || ''
    };
    return { data: profileWithAuthData, error: null };
  }

  return { data, error };
};

export const getCurrentUserProfile = async (): Promise<{ data: UserProfile | null; error: any }> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('No authenticated user') };
  }

  // Try to get existing profile
  const { data: profile, error } = await getUserProfile(user.id);
  
  // If profile doesn't exist, try to create one
  if (!profile && !error) {
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      
      // If creation fails due to permissions, create a local profile object
      if (createError.message && createError.message.includes('permission denied')) {
        console.log('Profile creation permission denied - creating local profile');
        const localProfile = {
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          address: '',
          company_name: '',
          btw_number: '',
          tax_category: null,
          fiscal_year: null,
          accounting_method: null,
          tax_notes: null,
          created_at: user.created_at,
          updated_at: user.created_at
        };
        
        return { data: localProfile, error: null };
      }
      
      return { data: null, error: createError };
    }

    // Create a complete profile object with data from auth
    const profileWithAuthData = {
      ...newProfile,
      email: user.email,
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      phone: user.user_metadata?.phone || ''
    };

    return { data: profileWithAuthData, error: null };
  }

  return { data: profile, error };
};