"use client";
import { FormEvent, useState } from "react";
type Agent={id:string;name:string;status:string;risk_level:string};
type Approval={id:string;action:string;resource?:string;risk_level?:string;status:string};

export default function AdminDemo() {
  const [key,setKey]=useState(""); const [logged,setLogged]=useState(false); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  const [agents,setAgents]=useState<Agent[]>([]); const [approvals,setApprovals]=useState<Approval[]>([]); const [schema,setSchema]=useState<string>("");

  async function refresh(){
    const [a,p]=await Promise.all([
      fetch("/api/v1/agents").then(r=>r.json() as Promise<{agents?:Agent[]}>),
      fetch("/api/v1/approvals").then(r=>r.json() as Promise<{approvals?:Approval[]}>)
    ]);
    setAgents(a.agents??[]); setApprovals(p.approvals??[]);
  }
  async function login(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");
    const r=await fetch("/api/v1/admin/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key})});
    if(r.ok){setKey("");setLogged(true);setMessage("Secure admin session active.");await refresh();} else setMessage("Admin authentication failed."); setBusy(false);
  }
  async function checkSchema(){const r=await fetch("/api/v1/admin/schema");const d=await r.json() as {ok?:boolean;missing?:string[];error?:string};setSchema(r.ok&&d.ok?"Database schema: VERIFIED":"Database schema: "+(d.missing?.join(", ")||d.error||"FAILED"));}
  async function logout(){await fetch("/api/v1/admin/login",{method:"DELETE"});setLogged(false);setAgents([]);setApprovals([]);setMessage("Session closed.");}
  async function seed(){setBusy(true);const r=await fetch("/api/v1/demo/seed",{method:"POST"});setMessage(r.ok?"Demo agent enrolled.":"Agent enrollment failed.");await refresh();setBusy(false);}
  async function decide(id:string,decision:"APPROVED"|"DENIED"){setBusy(true);const r=await fetch("/api/v1/approvals",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id,decision})});setMessage(r.ok?"Approval updated.":"Approval update failed.");await refresh();setBusy(false);}
  async function kill(id:string){if(!confirm("Emergency stop this agent?"))return;setBusy(true);const r=await fetch("/api/v1/agents/"+encodeURIComponent(id)+"/kill",{method:"POST"});setMessage(r.ok?"Emergency kill switch executed.":"Kill switch failed.");await refresh();setBusy(false);}

  return <main><nav><a href="/" style={{color:"inherit",textDecoration:"none"}}><b>SENTRYA</b></a><span>ADMIN CONTROL PLANE</span></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",paddingBottom:32}}><div><p className="eyebrow">SECURE OPERATOR ACCESS</p><h1>Human control.<br/><em>Server-side session.</em></h1><p className="lead">Privileged actions are authorized by an HttpOnly, Secure session.</p></div></section>
    <section><div className="terminal"><div className="dots">● ● ● <span>OPERATOR AUTH</span></div><div style={{padding:"22px"}}>
      {!logged?<form onSubmit={login}><label>Admin key</label><input type="password" autoComplete="current-password" value={key} onChange={e=>setKey(e.target.value)} style={{display:"block",width:"100%",margin:"10px 0 18px",padding:"14px",background:"#0b1119",color:"#eef3f7",border:"1px solid #283444",borderRadius:10}}/><button disabled={busy||!key}>{busy?"Authenticating…":"Start secure session"}</button></form>
      :<div><b className="good">ADMIN SESSION ACTIVE</b><p>Human approval and emergency controls are unlocked.</p><button onClick={refresh} disabled={busy}>Refresh</button> <button onClick={checkSchema} disabled={busy}>Verify database</button> <button onClick={seed} disabled={busy}>Enroll demo agent</button> <button onClick={logout}>Sign out</button>{schema&&<p><b>{schema}</b></p>}</div>}{message&&<p>{message}</p>}
    </div></div></section>
    {logged&&<><section style={{paddingTop:32}}><h2>Approval Center</h2>{approvals.filter(a=>a.status==="PENDING").length===0?<p>No pending approvals.</p>:<div className="grid">{approvals.filter(a=>a.status==="PENDING").map(a=><article key={a.id}><small>{a.risk_level} RISK</small><h3>{a.action}</h3><p>{a.resource??"No resource"}</p><button disabled={busy} onClick={()=>decide(a.id,"APPROVED")}>Approve</button> <button disabled={busy} onClick={()=>decide(a.id,"DENIED")}>Deny</button></article>)}</div>}</section>
    <section style={{paddingTop:32}}><h2>Agent Registry & Kill Switch</h2>{agents.length===0?<p>No enrolled agents.</p>:<div className="grid">{agents.map(a=><article key={a.id}><small>{a.risk_level} RISK</small><h3>{a.name}</h3><b>{a.status}</b><p>{a.status!=="KILLED"&&<button disabled={busy} onClick={()=>kill(a.id)}>Emergency Kill</button>}</p></article>)}</div>}</section></>}
    <footer>SENTRYA • Secure operator console</footer></main>;
}
