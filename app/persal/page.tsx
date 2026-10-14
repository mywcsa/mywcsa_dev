import { getPersalOverview, requirePersalOfficial } from "@/lib/persal/server";
import HomeDashboard from "./home-dashboard";
export default async function PersalHome() {
  const official = await requirePersalOfficial();
  return <HomeDashboard official={official} overview={await getPersalOverview(official)} />;
}
