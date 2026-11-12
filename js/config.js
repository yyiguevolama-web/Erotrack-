// Remplacer uniquement par les informations publiques de TON nouveau projet Supabase.
export const SUPABASE_URL = "https://TON-PROJET.supabase.co";
export const SUPABASE_ANON_KEY = "COLLER_ICI_LA_CLE_PUBLISHABLE_OU_ANON";
export const PHOTO_BUCKET = "observation-photos";
export const isConfigured = () =>
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("TON-PROJET") &&
  SUPABASE_ANON_KEY.length > 30 &&
  !SUPABASE_ANON_KEY.includes("COLLER_ICI");
