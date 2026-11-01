export const metadata={
  title:"MyWCSA CAMS | Centralised Administrative Management System",
  description:"Internal staff administration and institutional management platform for Western Cape Sports Association NPC.",
  robots:{index:false,follow:false,nocache:true}
};

export default function CamsLayout({children}:{children:React.ReactNode}){
  return <div style={{fontFamily:"Verdana, Geneva, Tahoma, sans-serif"}}>{children}</div>;
}
