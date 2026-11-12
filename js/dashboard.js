import { supabase, configured } from "./supabase.js";
import { requireUser, $, toast } from "./common.js";
const user=await requireUser();
if(user && configured){
  const [{data:profile},{data:rows,error}] = await Promise.all([
    supabase.from("profiles").select("full_name,role").eq("id",user.id).single(),
    supabase.from("observations").select("id,title,status,observed_at").eq("user_id",user.id).order("created_at",{ascending:false})
  ]);
  $("#welcomeName").textContent=profile?.full_name || user.email;
  if(error) toast("Chargement des observations impossible.","error");
  const list=$("#myObservations");
  if(rows?.length) list.innerHTML=rows.map(o=>`<article class="data-row"><div><strong>${escapeHtml(o.title)}</strong><small>${new Date(o.observed_at).toLocaleDateString("fr-FR")}</small></div><span class="status ${o.status}">${label(o.status)}</span></article>`).join("");
  else list.innerHTML='<p class="empty">Tu n’as pas encore déposé d’observation.</p>';
  $("#adminLink")?.toggleAttribute("hidden",profile?.role!=="admin");
}
function label(s){return ({pending:"En attente",validated:"Validée",rejected:"Rejetée"})[s]||s}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
