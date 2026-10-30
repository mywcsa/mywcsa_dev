"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./cams.module.css";

const paths: Record<string,string> = {
  shield:"M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z M9 12l2 2 4-4",
  mail:"M3 5h18v14H3z M3 6l9 7 9-7",
  lock:"M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3",
  eye:"M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  eyeOff:"m3 3 18 18 M10.6 10.6a2 2 0 0 0 2.8 2.8 M9.9 5.2A11 11 0 0 1 12 5c6.4 0 10 7 10 7s-1.4 2.8-4 4.7 M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8",
  cloud:"M7 18a4 4 0 1 1 .5-8A5.5 5.5 0 0 1 18 9a4.5 4.5 0 0 1 0 9H7Z",
  clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2",
  arrow:"M5 12h14 M13 6l6 6-6 6",
  key:"M15 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z M19 12h3 M20 12v3 M22 12v2 M10.5 15.5 4 22"
};
function Icon({name,size=18}:{name:string;size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.shield}/></svg>;
}
function weatherLabel(code:number) {
  if(code===0)return "Clear skies";
  if([1,2].includes(code))return "Partly cloudy";
  if(code===3)return "Overcast";
  if([45,48].includes(code))return "Foggy";
  if([51,53,55,56,57].includes(code))return "Drizzle";
  if([61,63,65,66,67,80,81,82].includes(code))return "Rain";
  if([95,96,99].includes(code))return "Thunderstorms";
  return "Current conditions";
}
type Weather={temperature:number;apparentTemperature:number;weatherCode:number;windSpeed:number};

export default function CamsLoginPage(){
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [remember,setRemember]=useState(true);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [weather,setWeather]=useState<Weather|null>(null);
  const [weatherUnavailable,setWeatherUnavailable]=useState(false);
  const [now,setNow]=useState(new Date());

  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(new Date()),30000);
    const loadWeather=async()=>{
      try{
        const response=await fetch("/api/cams/weather",{cache:"no-store"});
        if(!response.ok)throw new Error("Weather unavailable");
        setWeather(await response.json());setWeatherUnavailable(false);
      }catch{setWeatherUnavailable(true);}
    };
    void loadWeather();
    const weatherTimer=window.setInterval(loadWeather,900000);
    return()=>{window.clearInterval(timer);window.clearInterval(weatherTimer);};
  },[]);

  async function handleSubmit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setLoading(true);
    try{
      const response=await fetch("/api/cams/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email.trim(),password,remember})});
      const result=await response.json();
      if(!response.ok){setError(result.error||"We could not verify your staff access.");return;}
      router.replace("/cams/dashboard");
    }catch{setError("The sign-in service is temporarily unavailable. Please try again.");}
    finally{setLoading(false);}
  }

  const time=new Intl.DateTimeFormat("en-ZA",{timeZone:"Africa/Johannesburg",hour:"2-digit",minute:"2-digit",hour12:false}).format(now);
  const date=new Intl.DateTimeFormat("en-ZA",{timeZone:"Africa/Johannesburg",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(now);

  return <main className={styles.loginPage}>
    <section className={styles.visualPanel}>
      <div className={styles.visualGrid}/><div className={styles.visualGlow}/>
      <div className={styles.visualContent}>
        <div className={styles.brandLockup}><div className={styles.brandMark}>W</div><div><div className={styles.brandName}>WESTERN CAPE SPORTS ASSOCIATION</div><div className={styles.brandSub}>UNITED. EMPOWERED. EXCELLING.</div></div></div>
        <div className={styles.heroCopy}><div className={styles.eyebrow}>INSTITUTIONAL ADMINISTRATION</div><h1>One organisation.<br/><span>One coordinated view.</span></h1><p>A central working environment for the people, institutions, programmes and resources entrusted to WCSA.</p></div>
        <div className={styles.infoStrip}>
          <div className={styles.infoCard}><div className={styles.infoLabel}><Icon name="clock" size={14}/> SOUTH AFRICAN STANDARD TIME</div><div className={styles.clockTime}>{time}</div><div className={styles.dateText}>{date}</div></div>
          <div className={styles.infoCard}><div className={styles.infoLabel}><Icon name="cloud" size={14}/> CAPE TOWN, WESTERN CAPE</div>{weather?<><div className={styles.weatherMain}>{Math.round(weather.temperature)}° <span>{weatherLabel(weather.weatherCode)}</span></div><div className={styles.dateText}>Feels like {Math.round(weather.apparentTemperature)}° · Wind {Math.round(weather.windSpeed)} km/h</div></>:<div className={styles.weatherFallback}>{weatherUnavailable?"Weather currently unavailable":"Loading local weather…"}</div>}</div>
        </div>
        <div className={styles.visualFooter}><span>MYWCSA GOVAPPS</span><span>CAMS · STAFF ACCESS</span><span>WESTERN CAPE · SOUTH AFRICA</span></div>
      </div>
    </section>
    <section className={styles.formPanel}>
      <div className={styles.mobileBrand}><div className={styles.brandMark}>W</div><div><div className={styles.brandName}>WCSA</div><div className={styles.brandSub}>MYWCSA GOVAPPS</div></div></div>
      <div className={styles.loginCard}>
        <div className={styles.cardKicker}>SECURE STAFF PORTAL</div>
        <div className={styles.cardTitleRow}><div><h2>Welcome back</h2><p>Sign in with your authorised staff account.</p></div><div className={styles.secureIcon}><Icon name="shield" size={22}/></div></div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <label htmlFor="cams-email">Staff email address</label>
          <div className={styles.inputWrap}><Icon name="mail" size={17}/><input id="cams-email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@wcsports.co.za" required/></div>
          <div className={styles.passwordLabel}><label htmlFor="cams-password">Password</label><a href="mailto:personnel@wcsports.co.za?subject=CAMS%20Access%20Assistance">Need assistance?</a></div>
          <div className={styles.inputWrap}><Icon name="lock" size={17}/><input id="cams-password" type={showPassword?"text":"password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" className={styles.showPassword} aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)}><Icon name={showPassword?"eyeOff":"eye"} size={17}/></button></div>
          <label className={styles.rememberRow}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Keep me signed in on this device</span></label>
          {error&&<div className={styles.errorMessage} role="alert">{error}</div>}
          <button className={styles.signInButton} type="submit" disabled={loading}>{loading?"Verifying access…":"Sign in to CAMS"} <Icon name="arrow" size={17}/></button>
        </form>
        <div className={styles.accessNote}><Icon name="key" size={16}/><span>Access is restricted to approved WCSA staff. New accounts and public registration are not available.</span></div>
        <div className={styles.cardDivider}/>
        <div className={styles.cardMeta}><span><i className={styles.statusDot}/> Secure connection</span><span>MyWCSA CAMS · Phase 1</span></div>
      </div>
      <footer className={styles.formFooter}><span>Western Cape Sports Association NPC</span><span>© {now.getFullYear()} · Internal use only</span></footer>
    </section>
  </main>;
}
