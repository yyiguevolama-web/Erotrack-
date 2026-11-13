// Remplacer uniquement par les informations publiques de TON nouveau projet Supabase.
export const SUPABASE_ANON_KEY = "sb_publishable_rVaeSfhXt4uvyhBzEF9psA_FOiBZ_jF";
export const PHOTO_BUCKET = "observation-photos";
export const isConfigured = () =>
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("TON-PROJET") &&
  SUPABASE_ANON_KEY.length > 30 &&
  !SUPABASE_ANON_KEY.includes("COLLER_ICI");
