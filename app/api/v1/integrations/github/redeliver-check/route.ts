import { NextResponse } from "next/server";
import { createGitHubAppJwt, getGitHubAppConfig } from "../../../../../../lib/github-app";
export const dynamic = "force-dynamic";
const deliveryId = "3844759189364670500";
function headers(jwt:string){return {accept:"application/vnd.github+json",authorization:"Bearer "+jwt,"x-github-api-version":"2022-11-28","user-agent":"sentrya-control-plane"};}
export async function GET(){
  const config=getGitHubAppConfig();
  if(!config)return NextResponse.json({ok:false,stage:"configuration"},{status:503});
  const jwt=createGitHubAppJwt(config);
  const retry=await fetch("https://api.github.com/app/hook/deliveries/"+deliveryId+"/attempts",{method:"POST",headers:headers(jwt),cache:"no-store"});
  if(!retry.ok && retry.status!==202)return NextResponse.json({ok:false,stage:"redelivery",githubStatus:retry.status},{status:502});
  await new Promise(r=>setTimeout(r,1800));
  const check=await fetch("https://api.github.com/app/hook/deliveries/"+deliveryId,{headers:headers(jwt),cache:"no-store"});
  if(!check.ok)return NextResponse.json({ok:false,stage:"check",githubStatus:check.status},{status:502});
  const d=await check.json() as {status?:unknown,event?:unknown,redelivery?:unknown,delivered_at?:unknown};
  return NextResponse.json({ok:d.status==="OK",event:d.event??null,status:d.status??null,redelivery:d.redelivery===true,deliveredAt:d.delivered_at??null});
}
