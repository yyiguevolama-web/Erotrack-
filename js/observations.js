import { supabase, configured } from "./supabase.js";
import { requireUser, toast, $ } from "./common.js";
const form=$("#observationForm");
if(form){
  const user=await requireUser();
  if(user) form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!configured) return toast("Supabase n'est pas configuré.","error");
    const btn=form.querySelector("button[type=submit]"); btn.disabled=true; btn.textContent="Envoi…";
    try{
      const title=$("#title").value.trim(), description=$("#description").value.trim();
      const sector=$("#sector").value, date=$("#observedAt").value;
      const lat=$("#latitude").value===""?null:Number($("#latitude").value);
      const lng=$("#longitude").value===""?null:Number($("#longitude").value);
      const {data:obs,error}=await supabase.from("observations").insert({
        user_id:user.id,title,description,sector_id:sector||null,observed_at:date,
        latitude:lat,longitude:lng,status:"pending"
      }).select("id").single();
      if(error) throw error;
      const photo=$("#photo").files[0];
      if(photo){
        if(!photo.type.startsWith("image/")) throw new Error("Le fichier doit être une image.");
        if(photo.size>8*1024*1024) throw new Error("La photo doit faire moins de 8 Mo.");
        const ext=(photo.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"").toLowerCase();
        const path=`${user.id}/${obs.id}/${crypto.randomUUID()}.${ext}`;
        const {error:upErr}=await supabase.storage.from("observation-photos").upload(path,photo,{contentType:photo.type,upsert:false});
        if(upErr) throw upErr;
        const {error:photoErr}=await supabase.from("observation_photos").insert({observation_id:obs.id,user_id:user.id,storage_path:path,caption:$("#photoCaption").value.trim()||null});
        if(photoErr) throw photoErr;
      }
      toast("Observation transmise. Elle reste en attente de validation scientifique.","success"); form.reset();
    }catch(err){toast(err.message||"Erreur lors de l'envoi.","error");}
    finally{btn.disabled=false;btn.textContent="Transmettre l'observation";}
  });
}
