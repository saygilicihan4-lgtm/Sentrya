"use client";
import { FormEvent, useState } from "react";

export default function AdminDemo() {
  const [key,setKey]=useState("");
  const [logged,setLogged]=useState(false);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function login(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage("");
    const r=await fetch("/api/v1/admin/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key})});
    if(r.ok){setKey("");setLogged(true);setMessage("Secure admin session active.");}
    else setMessage("Admin authentication failed.");
    setBusy(false);
  }
  async function logout(){await fetch("/api/v1/admin/login",{method:"DELETE"});setLogged(false);setMessage("Session closed.");}

  return <main>
    <nav><a href="/" style={{color:"inherit",textDecoration:"none"}}><b>SENTRYA</b></a><span>ADMIN CONTROL PLANE</span></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",paddingBottom:32}}>
      <div><p className="eyebrow">SECURE OPERATOR ACCESS</p><h1>Human control.<br/><em>Server-side session.</em></h1>
      <p className="lead">Privileged actions use an HttpOnly, Secure session. The admin key is never stored in browser JavaScript or localStorage.</p></div>
    </section>
    <section>
      <div className="terminal"><div className="dots">● ● ● <span>OPERATOR AUTH</span></div><div style={{padding:"22px"}}>
      {!logged?<form onSubmit={login}>
        <label>Admin key</label>
        <input type="password" autoComplete="current-password" value={key} onChange={e=>setKey(e.target.value)} style={{display:"block",width:"100%",margin:"10px 0 18px",padding:"14px",background:"#0b1119",color:"#eef3f7",border:"1px solid #283444",borderRadius:10}}/>
        <button disabled={busy||!key} style={{padding:"14px 20px",border:0,borderRadius:10,fontWeight:800}}>{busy?"Authenticating…":"Start secure session"}</button>
      </form>:<div><b className="good">ADMIN SESSION ACTIVE</b><p>Privileged API requests are now authorized by the signed HttpOnly cookie.</p><button onClick={logout} style={{padding:"12px 18px",border:0,borderRadius:10,fontWeight:800}}>Sign out</button></div>}
      {message&&<p>{message}</p>}
      </div></div>
    </section>
    <footer>SENTRYA • Secure operator console</footer>
  </main>;
}
