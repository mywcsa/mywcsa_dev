import { Poppins } from "next/font/google";

const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700"],display:"swap"});

export const metadata={
  title:"MyWCSA CAMS | Centralised Administrative Management System",
  description:"Internal staff administration and institutional management platform for Western Cape Sports Association NPC.",
  robots:{index:false,follow:false,nocache:true}
};

export default function CamsLayout({children}:{children:React.ReactNode}){
  return <div className={poppins.className}>{children}</div>;
}
