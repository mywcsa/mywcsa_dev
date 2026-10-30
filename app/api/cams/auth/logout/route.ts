import { NextResponse } from "next/server";
export async function POST(){const response=NextResponse.json({success:true});const opts={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:0};response.cookies.set("cams_access_token","",opts);response.cookies.set("cams_refresh_token","",opts);return response}
