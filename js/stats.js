import { supabase, configured } from "./supabase.js";
import { toast } from "./common.js";
const canvas=document.getElementById("trendChart");
if(canvas){
 if(!configured){document.getElementById("statsEmpty").hidden=false;}
 else{
  const {data,error}=await supabase.from("measurements").select("measured_at,value,unit,indicator").order("measured_at");
  if(error){toast("Impossible de charger les mesures réelles.","error");document.getElementById("statsEmpty").hidden=false;}
  else if(!data?.length){document.getElementById("statsEmpty").hidden=false;}
  else{
   const groups={}; data.forEach(m=>{const k=m.indicator+" ("+m.unit+")";(groups[k]??=[]).push(m)});
   const first=Object.entries(groups)[0];
   new Chart(canvas,{type:"line",data:{labels:first[1].map(x=>new Date(x.measured_at).toLocaleDateString("fr-FR")),datasets:[{label:first[0],data:first[1].map(x=>x.value),borderColor:"#22b8ad",backgroundColor:"rgba(34,184,173,.12)",fill:true,tension:.25}]} ,options:{responsive:true,plugins:{legend:{display:true}}}});
  }
 }
}
