import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  house:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/></>,
  id:<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M6 16c0-2 6-2 6 0M15 9h3M15 13h3"/></>,
  heart:<><path d="M20.8 8.6c0 5-8.8 11-8.8 11S3.2 13.6 3.2 8.6a5 5 0 0 1 8.8-3 5 5 0 0 1 8.8 3Z"/></>,
  calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3"/></>,
  file:<><path d="M6 2h8l5 5v14H6zM14 2v6h5M9 13h7M9 17h7"/></>,
  clipboard:<><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 11h6M9 15h6"/></>,
  ticket:<><path d="M3 8a3 3 0 0 0 0 6v5h18v-5a3 3 0 0 1 0-6V5H3zM13 5v2M13 10v2M13 15v4"/></>,
  check:<><rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 3 3 5-6"/></>,
  users:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/></>,
  graduation:<><path d="m2 9 10-5 10 5-10 5zM6 11v5c4 3 8 3 12 0v-5M22 9v7"/></>,
  briefcase:<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 3 13 3 18 0"/></>,
  mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>,
  video:<><rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/></>,
  activity:<><path d="M3 12h4l3-7 4 14 3-7h4"/></>,
  megaphone:<><path d="m3 10 13-6v16L3 14zM16 9l4-2v10l-4-2M5 15l2 6h4l-3-6"/></>,
  bolt:<><path d="m13 2-9 12h7l-1 8 10-13h-7z"/></>,
  search:<><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  chevron:<><path d="m9 6 6 6-6 6"/></>,
  external:<><path d="M14 4h6v6M20 4l-9 9M20 14v6H4V4h6"/></>
};
export type WorkHubIconName = keyof typeof paths;
export function WorkHubIcon({name,size=20,...props}:SVGProps<SVGSVGElement>&{name:WorkHubIconName;size?:number}) {
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]||paths.house}</svg>;
}
