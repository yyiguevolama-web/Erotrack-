import { supabase, configured } from "./supabase.js";
import { requireUser, $, toast } from "./common.js";
const user=await requireUser();
if(user && configured){
 const {data}=await supabase.from("profiles").select("full_name,organization,phone").eq("id",user.id).single();
 $("#profileName").value=data?.full_name||""; $("#profileOrg").value=data?.organization||""; $("#profilePhone").value=data?.phone||"";
 $("#profileForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const {error}=await supabase.from("profiles").update({full_name:$("#profileName").value.trim(),organization:$("#profileOrg").value.trim(),phone:$("#profilePhone").value.trim()}).eq("id",user.id);
  toast(error?.message||"Profil mis à jour.","success");
 });
}
