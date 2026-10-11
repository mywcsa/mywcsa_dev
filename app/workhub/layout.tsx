import type { Metadata } from "next";
export const metadata: Metadata = {
  title: { absolute: "MyWCSA GovApps | WorkHub" },
  description: "Western Cape Sports Association employee WorkHub"
};
export default function WorkHubLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return children;
}
