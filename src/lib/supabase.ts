import { supabase } from "@/integrations/supabase/client";
import { ROUTES } from "@/constants";

export const signUp = async (email: string, password: string) => {
  const redirectUrl = `${window.location.origin}${ROUTES.HOME}`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signInWithGoogle = async () => {
  const redirectUrl = `${window.location.origin}${ROUTES.HOME}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  });

  return { data, error };
};

export const signInWithApple = async () => {
  const redirectUrl = `${window.location.origin}${ROUTES.HOME}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl
    }
  });

  return { data, error };
};

export const isAdmin = (email?: string) => {
  if (!email) return false;
  return email.endsWith('@frades.be');
};