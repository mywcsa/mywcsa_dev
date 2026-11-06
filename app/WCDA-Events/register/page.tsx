import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Register as an Event Organiser | MyWCDA Events",
  description: "Create a secure external account and request access to MyWCDA Events.",
};

export default function WcdaOrganiserRegistrationPage() {
  redirect("/login/external-user/register?returnTo=%2Fexternal&wcda=1");
}
