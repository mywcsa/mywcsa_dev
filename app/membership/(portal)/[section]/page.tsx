import { notFound } from "next/navigation";
import PortalContent from "../../portal-content";
import { sections } from "../../portal-data";
export function generateStaticParams() { return sections.map(section => ({ section: section.id })); }
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const item = sections.find(item => item.id === section);
  if (!item) notFound();
  return <PortalContent section={item.id} />;
}
