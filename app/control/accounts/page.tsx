import {auth} from "@/auth";
import {redirect,notFound} from "next/navigation";
import {Poppins} from "next/font/google";
import {requireControlOperator} from "@/lib/control/centre";
import AddAccountsPage from "./AddAccountsPage";
const poppins=Poppins({subsets:["latin"],weight:["400","500","600","700","800"],display:"swap",fallback:["Arial","sans-serif"]});
export const dynamic="force-dynamic";
export const metadata={title:"Add Accounts | MyWCSA Command Centre",robots:{index:false,follow:false}};
export default async function AddAccountsRoute(){
 const session=await auth();
 if(!session?.user)redirect("/login/staff?returnTo=%2Fcontrol%2Faccounts");
 try{await requireControlOperator();}catch{notFound();}
 return <div className={poppins.className}><AddAccountsPage/></div>;
}
