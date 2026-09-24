"use client";
import { useEffect, useState } from "react";

type Result = {decision?:string;risk?:string;reason?:string;requestId?:string;error?:string};
type Agent = {id:string;name:string;status:string;risk_level:string};
type Approval = {id:string;action:string;resource?:string;risk_level:string;status:string;created_at:string};
type AuditEvent = {id:string;action:string;decision:string;risk_level:string;event_hash:string;created_at:string};
const actions=["github.delete_repository","github.merge_pull_request","gmail.send_email","crm.export_contacts","github.read_repository"];

export default function Demo(){
  const [action,setAction]=useState(actions[0]);
  const [result,setResult]=useState<Result|null>(null);
  const [agents,setAgents]=useState<Agent[]>([]);
  const [busy,setBusy]=useState(false);
  const [approvals,setApprovals]=useState<Approval[]>([]);
  const [audit,setAudit]=useState<AuditEvent[]>([]);
  function loadApprovals(){fetch("/api/v1/approvals").then(r=>r.json() as Promise<{approvals?:Approval[]}>).then(d=>setApprovals(d.approvals??[])).catch(()=>setApprovals([]));}
  function loadAudit(){fetch("/api/v1/audit").then(r=>r.json() as Promise<{events?:AuditEvent[]}>).then(d=>setAudit(d.events??[])).catch(()=>setAudit([]));}
  useEffect(()=>{fetch("/api/v1/agents").then(r=>r.json() as Promise<{agents?:Agent[]}>).then(d=>setAgents(d.agents??[])).catch(()=>setAgents([])); loadApprovals(); loadAudit();},[]);
  async function evaluate(){
    setBusy(true); setResult(null);
    try{
      const r=await fetch("/api/v1/evaluate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({agentId:"demo-agent",action,resource:"production/core-api"})});
      setResult(await r.json() as Result);
    }catch{setResult({error:"Request failed"});}
    finally{setBusy(false); loadApprovals(); loadAudit();}
  }

  return <main>
    <nav><a href="/" style={{color:"inherit",textDecoration:"none"}}><b>SENTRYA</b></a><span>LIVE CONTROL PLANE</span></nav>
    <section className="hero" style={{gridTemplateColumns:"1fr",paddingBottom:32}}><div>
      <p className="eyebrow">INVESTOR / DESIGN-PARTNER DEMO</p><h1>Policy decision.<br/><em>Before the agent acts.</em></h1>
      <p className="lead">Choose an AI-agent action and run it through SENTRYA's production policy API.</p>
    </div></section>
    <section><div className="terminal"><div className="dots">● ● ● <span>POLICY ENGINE</span></div><div style={{padding:"22px"}}>
      <label>Agent action</label>
      <select value={action} onChange={e=>setAction(e.target.value)} style={{display:"block",width:"100%",margin:"10px 0 18px",padding:"14px",background:"#0b1119",color:"#eef3f7",border:"1px solid #283444",borderRadius:10}}>
        {actions.map(a=><option key={a}>{a}</option>)}
      </select>
      <button onClick={evaluate} disabled={busy} style={{padding:"14px 20px",border:0,borderRadius:10,fontWeight:800}}>{busy?"Evaluating…":"Evaluate action"}</button>
      {result&&<code style={{display:"block",marginTop:24}}>Decision: <strong>{result.decision??result.error}</strong><br/>Risk: {result.risk??"-"}<br/>Reason: {result.reason??"-"}<br/>Request: {result.requestId??"-"}</code>}
    </div></div></section>
    <section style={{paddingTop:32}}><h2>Human Approval Center</h2><p className="lead">Sensitive agent actions stop here until a human decides.</p>{approvals.length===0?<p>No approval requests yet. Evaluate a sensitive action above.</p>:<div className="grid">{approvals.slice(0,6).map(a=><article key={a.id}><small>{a.risk_level} RISK</small><h3>{a.action}</h3><b className={a.status==="PENDING"?"bad":"good"}>{a.status}</b><p>{a.resource??"No resource"}</p></article>)}</div>}</section>
    <section style={{paddingTop:32}}><h2>Production Agent Registry</h2><p className="lead">{agents.length?agents.length+" registered agent(s) loaded from Neon.":"Neon connected. Registry is ready for its first enrolled agent."}</p>
      {agents.length>0&&<div className="grid">{agents.map(a=><article key={a.id}><small>AI AGENT</small><h3>{a.name}</h3><b>{a.status}</b><p>Risk: {a.risk_level}</p></article>)}</div>}
    </section><section style={{paddingTop:32}}><h2>Tamper-evident Audit Ledger</h2><p className="lead">Policy evaluations are hash-linked for integrity verification.</p>{audit.length===0?<p>No audit events yet.</p>:<div className="grid">{audit.slice(0,6).map(e=><article key={e.id}><small>{e.risk_level}</small><h3>{e.action}</h3><b>{e.decision}</b><p>Hash: {e.event_hash?.slice(0,16)}…</p></article>)}</div>}</section><footer>SENTRYA • Production demo</footer>
  </main>
}