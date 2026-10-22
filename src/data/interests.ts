/**
 * Volunteer areas of interest. Shared by the activity data (which pre-selects
 * one when someone taps "Volunteer for this activity") and the volunteer form
 * built in Phase 5, so the two can never drift apart.
 */
export const VOLUNTEER_INTERESTS = [
  "Plantation drives",
  "Seed collection & seedballs",
  "Clean-Up drives",
  "School awareness sessions",
  "Growing Ganesha",
  "Event coordination & logistics",
  "Technical & Design Support (posters, graphics & digital tools)",
  "Photography, content & social media",
  "Community outreach",
] as const;

export type VolunteerInterest = (typeof VOLUNTEER_INTERESTS)[number];
