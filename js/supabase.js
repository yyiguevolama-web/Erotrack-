import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from "./config.js";

export const configured = isConfigured();
export const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export function showConfigNotice() {
  if (!configured) {
    document.querySelectorAll("[data-config-notice]").forEach(el => {
      el.hidden = false;
      el.textContent = "Connexion aux données non configurée. Ajoute l'URL et la clé publique Supabase dans js/config.js.";
    });
  }
}
