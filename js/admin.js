import { supabase, configured } from "./supabase.js";
import { requireAdmin, $, toast } from "./common.js";
const user=await requireAdmin();
if(user && configured){
 const {data,error}=await supabase.from("observations").select("id,title,description,observed_at,created_at,profiles(full_name)").eq("status","pending").order("created_at");
 const list=$("#pendingList");
 if(error) toast("Chargement administratif impossible.","error");
 else if(!data?.length) list.innerHTML='<p class="empty">Aucune observation en attente.</p>';
 else list.innerHTML=data.map(o=>`<article class="review-card"><div><span class="eyebrow">À vérifier · ${new Date(o.observed_at).toLocaleDateString("fr-FR")}</span><h3>${esc(o.title)}</h3><p>${esc(o.description)}</p><small>Contributeur : ${esc(o.profiles?.full_name||"Membre")}</small></div><div class="actions"><button class="btn primary" data-review="${o.id}" data-status="validated">Valider</button><button class="btn danger" data-review="${o.id}" data-status="rejected">Rejeter</button></div></article>`).join("");
 list.addEventListener("click",async e=>{
  const b=e.target.closest("[data-review]");if(!b)return;
  b.disabled=true;
  const id=b.dataset.review,status=b.dataset.status;
  const {error:upErr}=await supabase.from("observations").update({status}).eq("id",id);
  if(upErr){toast(upErr.message,"error");b.disabled=false;return;}
  const {error:revErr}=await supabase.from("observation_reviews").insert({observation_id:id,reviewer_id:user.id,decision:status});
  if(revErr) toast("Statut mis à jour, mais journal de validation incomplet : "+revErr.message,"error");
  else toast("Décision enregistrée.","success");
  b.closest(".review-card").remove();
 });
}
function esc(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
