import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';
import { mountTips } from './tips-ui.mjs?v=20261007-clean';

const SUPABASE_URL='https://ecxbujytmufnkevddohv.supabase.co';
const SUPABASE_KEY='sb_publishable_RI2iu-VWK1nTyOTq5x_x8w_514OdXX1';
const RECOVERY_REDIRECT='https://nth8m6fcs7-byte.github.io/Hours/';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{experimental:{passkey:true},flowType:'implicit',detectSessionInUrl:true}
});

const $=id=>document.getElementById(id);
let mode='login',rows=null,sessionVersion=0;
const teamTips=mountTips($('team-tips'),supabase,()=>{if(rows===null)throw new Error('Não foi possível verificar todas as horas da Hours. Preenche as horas manualmente ou volta a entrar.');return rows;});
const recoveryParams=new URLSearchParams(window.location.hash.slice(1));
const recoveryKey='tips-password-recovery';
// Remember the recovery screen after the SDK removes the token fragment.
let recovering=recoveryParams.get('type')==='recovery';
try{recovering=recovering||sessionStorage.getItem(recoveryKey)==='true'}catch{}
function setRecovering(value){
  recovering=value;
  try{if(value)sessionStorage.setItem(recoveryKey,'true');else sessionStorage.removeItem(recoveryKey)}catch{}
}
if(recovering)setRecovering(true);

function setMsg(el,msg,ok=false){el.textContent=msg;el.className=msg?(ok?'ok':'error'):''}

async function sessionUI(){
 const version=++sessionVersion;const {data:{session}}=await supabase.auth.getSession();if(version!==sessionVersion)return;
 if(!session)setRecovering(false);$('recovery').classList.toggle('hidden',!recovering);$('auth').classList.toggle('hidden',!!session||recovering);$('app').classList.toggle('hidden',!session||recovering);$('logout').classList.toggle('hidden',!session||recovering);
 rows=null;if(!session)$('account').open=false;
 await teamTips.setSession(session&&!recovering?session.user:null);
 if(version!==sessionVersion)return;
 // Optional read-only import from Hours. Tips records and payments never write work hours.
 if(session&&!recovering){let all=[],offset=0;while(true){const {data,error}=await supabase.from('personal_work_hours').select('*').eq('user_id',session.user.id).order('work_date',{ascending:true}).range(offset,offset+499);if(version!==sessionVersion)return;if(error){all=null;break;}all.push(...(data||[]));if(!data||data.length<500)break;offset+=500;}rows=all;}
 if(version!==sessionVersion)return;
}
function authMode(next){
  mode=next;
  $('tab-login').className=mode==='login'?'':'secondary';
  $('tab-signup').className=mode==='signup'?'':'secondary';
  $('tab-login').setAttribute('aria-pressed',String(mode==='login'));
  $('tab-signup').setAttribute('aria-pressed',String(mode==='signup'));
  $('auth-submit').textContent=mode==='login'?'Entrar':'Criar conta';
  $('password').autocomplete=mode==='login'?'current-password':'new-password';
  $('password').type='password';$('toggle-password').textContent='Mostrar';$('toggle-password').setAttribute('aria-pressed','false');
  $('forgot-password').classList.toggle('hidden',mode!=='login');
  $('passkey-login').classList.toggle('hidden',mode!=='login');
  $('passkey-hint').classList.toggle('hidden',mode!=='login');
  $('passkey-login').parentElement.classList.toggle('hidden',mode!=='login');
  setMsg($('auth-msg'),'');
}
$('tab-login').onclick=()=>authMode('login');
$('tab-signup').onclick=()=>authMode('signup');
function passwordToggle(buttonId,inputIds){
  $(buttonId).onclick=()=>{
    const show=$(inputIds[0]).type==='password';
    inputIds.forEach(id=>$(id).type=show?'text':'password');
    $(buttonId).textContent=show?'Ocultar':'Mostrar';
    $(buttonId).setAttribute('aria-pressed',String(show));
  };
}
passwordToggle('toggle-password',['password']);
passwordToggle('toggle-new-password',['new-password','confirm-password']);
async function authAction(buttonId,messageId,action){
  const button=$(buttonId);
  if(button.disabled)return;
  button.disabled=true;setMsg($(messageId),'');
  try{await action()}catch(error){setMsg($(messageId),error.message||'Não foi possível concluir. Tenta novamente.')}
  finally{button.disabled=false}
}
$('forgot-password').onclick=()=>authAction('forgot-password','auth-msg',async()=>{
  const email=$('email').value.trim();
  if(!email||!$('email').checkValidity())return setMsg($('auth-msg'),'Preenche um email válido para recuperar a password.');
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:RECOVERY_REDIRECT});
  if(error)throw error;
  setMsg($('auth-msg'),'Se existir uma conta com este email, receberás um link para definir uma nova password. Verifica também o spam.',true);
});
$('recovery-form').onsubmit=e=>{
  e.preventDefault();
  return authAction('recovery-submit','recovery-msg',async()=>{
    const password=$('new-password').value;
    if(password.length<6)return setMsg($('recovery-msg'),'Usa pelo menos 6 caracteres.');
    if(password!==$('confirm-password').value)return setMsg($('recovery-msg'),'As passwords não coincidem.');
    const {data:{session}}=await supabase.auth.getSession();
    if(!session)return setMsg($('recovery-msg'),'O link expirou. Cancela e pede um novo link.');
    const {error}=await supabase.auth.updateUser({password});
    if(error)throw error;
    setRecovering(false);$('recovery-form').reset();$('password').value='';
    await sessionUI();
    setMsg($('app-msg'),'Password atualizada.',true);
  });
};
$('recovery-cancel').onclick=()=>authAction('recovery-cancel','recovery-msg',async()=>{
  const {error}=await supabase.auth.signOut();if(error)throw error;
  setRecovering(false);$('recovery-form').reset();authMode('login');await sessionUI();
});
const passkeySupported=window.isSecureContext&&typeof window.PublicKeyCredential!=='undefined'&&!!navigator.credentials;
if(!passkeySupported){
  $('passkey-login').disabled=true;$('passkey-register').disabled=true;
  $('passkey-hint').textContent='Este navegador não suporta passkeys. Entra com email e password.';
  setMsg($('passkey-msg'),'Para ativar Face ID, usa um navegador compatível numa ligação HTTPS.');
}
function passkeyError(error){
  if(error.name==='NotAllowedError'||/cancel|not.allowed/i.test(error.message||''))return 'O pedido foi cancelado ou expirou. Podes tentar novamente ou usar a password.';
  return error.message||'Não foi possível usar a passkey. Verifica se as Passkeys estão ativadas no Supabase.';
}
$('passkey-login').onclick=()=>authAction('passkey-login','auth-msg',async()=>{
  try{
    const {error}=await supabase.auth.signInWithPasskey();if(error)throw error;
    $('password').value='';await sessionUI();
  }catch(error){setMsg($('auth-msg'),passkeyError(error))}
});
$('passkey-register').onclick=()=>authAction('passkey-register','passkey-msg',async()=>{
  try{
    const {error}=await supabase.auth.registerPasskey();if(error)throw error;
    setMsg($('passkey-msg'),'Passkey ativada. Já podes usar “Entrar com Face ID”.',true);
  }catch(error){setMsg($('passkey-msg'),passkeyError(error))}
});
$('auth-form').onsubmit=e=>{
  e.preventDefault();
  return authAction('auth-submit','auth-msg',async()=>{
  const email=$('email').value.trim(), password=$('password').value;
  if(!email||!password)return setMsg($('auth-msg'),'Preenche o email e a password.');
  const res=mode==='login'?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});
  if(res.error)return setMsg($('auth-msg'),res.error.message);
  if(mode==='signup'&&!res.data.session)setMsg($('auth-msg'),'Conta criada. Confirma o email e depois entra.',true);
  $('password').value='';
  await sessionUI();
  });
};
$('logout').onclick=async()=>{await supabase.auth.signOut();await sessionUI()};
supabase.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY')setRecovering(true);
  if(event==='SIGNED_OUT'){setRecovering(false);setMsg($('passkey-msg'),'');setMsg($('app-msg'),'');$('recovery-form').reset()}
  // Supabase holds its auth lock during this callback: defer SDK calls.
  setTimeout(()=>sessionUI().catch(()=>setMsg($('auth-msg'),'Não foi possível carregar a sessão. Tenta novamente.')),0);
});
sessionUI().catch(()=>setMsg($('auth-msg'),'Não foi possível carregar a sessão. Tenta novamente.'));
if(recoveryParams.has('error')){
  setRecovering(false);
  setMsg($('auth-msg'),'O link de autenticação é inválido ou expirou. Pede um novo link.');
  history.replaceState(null,'',window.location.pathname+window.location.search);
}
