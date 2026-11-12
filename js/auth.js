import { supabase, configured } from "./supabase.js";
import { $, toast } from "./common.js";

const login=$("#loginForm"), signup=$("#signupForm");
login?.addEventListener("submit", async e=>{
  e.preventDefault();
  if(!configured) return toast("Configure d'abord Supabase dans js/config.js.","error");
  const email=$("#loginEmail").value.trim(), password=$("#loginPassword").value;
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error) return toast(error.message,"error");
  location.href=new URLSearchParams(location.search).get("next") || "dashboard.html";
});
signup?.addEventListener("submit", async e=>{
  e.preventDefault();
  if(!configured) return toast("Configure d'abord Supabase dans js/config.js.","error");
  const name=$("#fullName").value.trim(), email=$("#signupEmail").value.trim(), password=$("#signupPassword").value;
  if(password.length<8) return toast("Le mot de passe doit contenir au moins 8 caractères.","error");
  const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:location.origin+"/connexion.html"}});
  if(error) return toast(error.message,"error");
  toast("Inscription envoyée. Vérifie ta boîte e-mail pour confirmer le compte.","success");
  signup.reset();
});
