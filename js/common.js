import { supabase, configured, showConfigNotice } from "./supabase.js";

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

export function toast(message, type="info") {
  let node = $("#toast");
  if (!node) {
    node = document.createElement("div");
    node.id = "toast"; node.className = "toast";
    document.body.append(node);
  }
  node.dataset.type = type; node.textContent = message;
  node.classList.add("visible");
  setTimeout(() => node.classList.remove("visible"), 4200);
}
export function setText(selector, value) { const el=$(selector); if(el) el.textContent=value; }

export async function currentUser() {
  if (!configured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}
export async function requireUser() {
  if (!configured) { showConfigNotice(); return null; }
  const user = await currentUser();
  if (!user) { location.href = "connexion.html?next=" + encodeURIComponent(location.pathname.split("/").pop()); return null; }
  return user;
}
export async function requireAdmin() {
  const user = await requireUser(); if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("role").eq("id",user.id).single();
  if (error || data?.role !== "admin") {
    toast("Accès réservé à l'administration.", "error");
    location.href = "dashboard.html"; return null;
  }
  return user;
}
export async function initHeader() {
  showConfigNotice();
  const user = await currentUser();
  $$("[data-auth-link]").forEach(a => {
    if (user) { a.textContent = "Mon espace"; a.href = "dashboard.html"; }
  });
  $$("[data-logout]").forEach(b => b.addEventListener("click", async () => {
    if (configured) await supabase.auth.signOut();
    location.href="index.html";
  }));
  const toggle=$("#menuToggle"), nav=$("#mainNav");
  toggle?.addEventListener("click",()=>nav?.classList.toggle("open"));
}
export { $, $$, supabase, configured };
