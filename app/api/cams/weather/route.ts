import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(){
  try{
    const endpoint="https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Africa%2FJohannesburg";
    const response=await fetch(endpoint,{cache:"no-store",signal:AbortSignal.timeout(7000)});
    if(!response.ok)throw new Error("Weather provider unavailable");
    const data=await response.json();const current=data.current;
    if(!current)throw new Error("Current weather unavailable");
    return NextResponse.json({location:"Cape Town, Western Cape",temperature:current.temperature_2m,apparentTemperature:current.apparent_temperature,weatherCode:current.weather_code,windSpeed:current.wind_speed_10m,observedAt:current.time},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({error:"Weather currently unavailable"},{status:503,headers:{"Cache-Control":"no-store"}})}
}
