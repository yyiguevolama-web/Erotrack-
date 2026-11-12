import { supabase, configured } from "./supabase.js";
import { toast } from "./common.js";
const mapEl=document.getElementById("map");
if(mapEl && window.L){
  const map=L.map("map").setView([4.75,-6.65],7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap"}).addTo(map);
  if(configured){
    const {data,error}=await supabase.from("observations").select("id,title,latitude,longitude,status,observed_at").eq("status","validated").not("latitude","is",null).not("longitude","is",null);
    if(!error && data?.length) data.forEach(o=>L.marker([o.latitude,o.longitude]).addTo(map).bindPopup(`<strong>${escapeHtml(o.title)}</strong><br>${new Date(o.observed_at).toLocaleDateString("fr-FR")}`));
    else if(error) toast("Impossible de charger les observations. Vérifie la configuration et les droits Supabase.","error");
    else toast("Aucune observation validée géolocalisée n'est encore disponible.");
  }
}
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
