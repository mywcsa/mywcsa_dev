import PaymentReturn from "./payment-return";
export const dynamic="force-dynamic";
export const metadata={title:"Event Payment Confirmation | MyWCDA Events"};
export default async function Page({searchParams}:{searchParams:Promise<{reference?:string}>}){
 const params=await searchParams;
 return <PaymentReturn reference={typeof params.reference==="string"?params.reference:""}/>;
}
