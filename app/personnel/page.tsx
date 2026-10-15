import { getPersalOfficial, getPersalOverview } from "@/lib/persal/server";
import PersonnelHome from "./personnel-home";
export default async function PersonnelPage(){
 const official=await getPersalOfficial();
 const overview=official?await getPersalOverview(official):null;
 return <PersonnelHome official={official} overview={overview}/>;
}
