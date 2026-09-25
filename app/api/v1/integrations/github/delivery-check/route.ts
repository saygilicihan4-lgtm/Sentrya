import { NextResponse } from "next/server";
import { createGitHubAppJwt, getGitHubAppConfig } from "../../../../../../lib/github-app";
export const dynamic = "force-dynamic";
export async function GET() {
  const config = getGitHubAppConfig();
  if (!config) return NextResponse.json({ ok:false, stage:"configuration" }, { status:503 });
  const response = await fetch("https://api.github.com/app/hook/deliveries?per_page=10", {
    headers: {
      accept:"application/vnd.github+json",
      authorization:"Bearer " + createGitHubAppJwt(config),
      "x-github-api-version":"2022-11-28",
      "user-agent":"sentrya-control-plane"
    },
    cache:"no-store"
  });
  if (!response.ok) return NextResponse.json({ ok:false, githubStatus:response.status }, { status:502 });
  const deliveries = await response.json() as Array<{id?:number,event?:string,status?:string,delivered_at?:string,redelivery?:boolean}>;
  return NextResponse.json({
    ok:true,
    deliveries: deliveries.map(d=>({id:d.id??null,event:d.event??null,status:d.status??null,deliveredAt:d.delivered_at??null,redelivery:d.redelivery===true}))
  });
}
