import type {Metadata} from "next";
import {auth} from "@/auth";
import {redirect} from "next/navigation";
import WorkHubShell from "./WorkHubShell";
export const metadata:Metadata={title:{absolute:"MyWCSA GovApps | WorkHub"},description:"Western Cape Sports Association employee WorkHub"};
export default async function WorkHubLayout({children}:Readonly<{children:React.ReactNode}>){
 const session=await auth();if(!session?.user)redirect("/login/staff?returnTo=%2Fworkhub");
 return <WorkHubShell name={session.user.name||"WCSA employee"}>{children}</WorkHubShell>;
}