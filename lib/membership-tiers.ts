/**
 * Membership tier definitions for the WCSA membership portal.
 *
 * Each tier drives the membership type field on a member's profile
 * and can be used for different fees, privileges, or display.
 */

export interface MembershipTier {
  id: string;
  label: string;
  description: string;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "athlete",
    label: "Athlete",
    description: "Registered competing athlete in a WCSA sporting code.",
  },
  {
    id: "coach",
    label: "Coach",
    description: "Registered coach affiliated with a WCSA sporting code.",
  },
  {
    id: "official",
    label: "Official",
    description: "Registered technical official or referee.",
  },
  {
    id: "associate",
    label: "Associate",
    description: "Non-competing associate member supporting WCSA.",
  },
  {
    id: "life-member",
    label: "Life Member",
    description: "Honorary life member recognised by WCSA.",
  },
];

export const MEMBERSHIP_STATUSES = [
  "active",
  "pending",
  "expired",
  "suspended",
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];
