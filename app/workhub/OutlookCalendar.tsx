"use client";
import {useEffect,useState} from "react";
type Event={id:string;title:string;start:string;end:string;allDay:boolean;url:string;joinUrl:string};
export default function OutlookCalendar(){
 const [events,setEvents]=useState<Event[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [month,setMonth]=useState(0);
 useEffect(()=>{let active=true;fetch("/api/workhub/calendar",{cache:"no-store"}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||"Calendar unavailable");if(active)setEvents(j.events||[])}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 const now=new Date(),date=new Date(now.getFullYear(),now.getMonth()+month,1);
 const first=(date.getDay()+6)%7,days=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
 const dated=(d:number)=>events.filter(e=>{const x=new Date(e.start);return x.getFullYear()===date.getFullYear()&&x.getMonth()===date.getMonth()&&x.getDate()===d});
 const upcoming=events.filter(e=>new Date(e.start)>=now).slice(0,5);
 return <div style={{paddingTop:12}}>
 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:12}}><strong>{date.toLocaleDateString("en-ZA",{month:"long",year:"numeric"})}</strong><div style={{display:"flex",gap:5}}><button onClick={()=>setMonth(x=>x-1)} aria-label="Previous month">‹</button><button onClick={()=>setMonth(0)}>Today</button><button onClick={()=>setMonth(x=>x+1)} aria-label="Next month">›</button></div></div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:3,textAlign:"center",fontSize:11}}>{["M","T","W","T","F","S","S"].map((d,i)=><b key={i}>{d}</b>)}{Array.from({length:first+days},(_,i)=>{const d=i-first+1;const count=d>0?dated(d).length:0;return <div key={i} title={count?count+" Outlook events":undefined} style={{minHeight:30,borderRadius:8,padding:6,background:count?"#dbeafe":d===now.getDate()&&month===0?"#e2e8f0":"#ffffff75",color:count?"#1553aa":"#334155"}}>{d>0?d:""}{count>0&&<span style={{display:"block",fontSize:9}}>● {count}</span>}</div>})}</div>
 {loading?<p>Connecting to Outlook Calendar…</p>:error?<p role="status" style={{color:"#a14d26"}}>{error}</p>:<div style={{marginTop:14}}><strong>Upcoming appointments</strong>{upcoming.length?upcoming.map(e=><div key={e.id} style={{borderTop:"1px solid #cbd5e1",padding:"9px 0"}}><b>{e.title}</b><div style={{fontSize:11}}>{new Date(e.start).toLocaleString("en-ZA",{dateStyle:"medium",timeStyle:"short"})}</div>{e.joinUrl&&<a href={e.joinUrl} target="_blank" rel="noopener noreferrer" style={{color:"#1468c4",fontWeight:700}}>Join Teams meeting ↗</a>}{!e.joinUrl&&e.url&&<a href={e.url} target="_blank" rel="noopener noreferrer" style={{color:"#1468c4"}}>View in Outlook ↗</a>}</div>):<p>No upcoming Outlook appointments in the next 45 days.</p>}</div>}
 <a href="https://outlook.office.com/calendar/" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:12,color:"#1765bd",fontWeight:700}}>Open Outlook Calendar ↗</a>
 </div>
}