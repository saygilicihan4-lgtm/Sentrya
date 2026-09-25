import { NextResponse } from "next/server";
import { createGitHubAppJwt, getGitHubAppConfig } from "../../../../../../lib/github-app";
export const dynamic = "force-dynamic";
const headers = (jwt:string) => ({
  accept:"application/vnd.github+json",
  authorization:"Bearer " + jwt,
  "x-github-api-version":"2022-11-28",
  "user-agent":"sentrya-control-plane"
});
export async function GET() {
  const config=getGitHubAppConfig();
  if(!config) return NextResponse.json({ok:false,stage:"configuration"},{status:503});
  const jwt=createGitHubAppJwt(config);
  const list=await fetch("https://api.github.com/app/hook/deliveries?per_page=10",{headers:headers(jwt),cache:"no-store"});
  const raw=await list.text();
  if(!list.ok) return NextResponse.json({ok:false,stage:"list",githubStatus:list.status},{status:502});
  const id=raw.match(/"id"\s*:\s*(\d+)/)?.[1];
  if(!id) return NextResponse.json({ok:false,stage:"no-delivery"},{status:404});
  const redeliver=await fetch("https://api.github.com/app/hook/deliveries/"+id+"/attempts",{method:"POST",headers:headers(jwt),cache:"no-store"});
  if(redeliver.status!==202) return NextResponse.json({ok:false,stage:"redelivery",githubStatus:redeliver.status},{status:502});
  await new Promise(r=>setTimeout(r,2500));
  const check=await fetch("https://api.github.com/app/hook/deliveries/"+id,{headers:headers(jwt),cache:"no-store"});
  if(!check.ok) return NextResponse.json({ok:false,stage:"check",githubStatus:check.status},{status:502});
  const data=await check.json() as {status?:unknown,status_code?:unknown,event?:unknown,redelivery?:unknown,response?:{status?:unknown,status_code?:unknown,payload?:unknown}};
  return NextResponse.json({ok:true,event:data.event??null,status:data.status??null,statusCode:data.status_code??null,responseStatus:data.response?.status??null,responseStatusCode:data.response?.status_code??null,responsePayload:typeof data.response?.payload==="string"?data.response.payload.slice(0,500):null,redelivery:data.redelivery===true,deliveryIdExposed:false});
}
