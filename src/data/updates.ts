import { en } from "@/i18n/en";

/**
 * Every Constructa update, NEWEST FIRST. The first entry is what the announcement bar above the nav
 * shows; /updates lists them all.
 *
 * Updates are written in English only (the /updates page is English for every visitor), so shipping
 * one is a single edit: add an entry at the TOP of this list with a new `id`. A new `id` also brings
 * the bar back for visitors who dismissed the previous one.
 */

export type UpdateTag = "new" | "improved" | "fixed";

export const TAG_LABELS: Record<UpdateTag, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

export type Update = {
  id: string;
  /** Shown as a chip, e.g. "v2.0". Optional: small updates go by date. */
  version?: string;
  /** Release day, YYYY-MM-DD. Not shown while `upcoming` (the page shows `month` instead). */
  date: string;
  /**
   * Not shipped yet: shown as "Coming soon", with no exact date or day count. On launch day, remove
   * this flag and set `date` to the real release day; the bar and page switch to "New".
   */
  upcoming?: boolean;
  /** For an upcoming release: the rough timing shown instead of a date, e.g. "Dec 2026". */
  month?: string;
  tags: UpdateTag[];
  title: string;
  summary: string;
  /** The entry's call to action. */
  cta: {
    label: string;
    to: "/" | "/login" | "/community" | "/tutorials" | "/dashboard";
    hash?: string;
  };
};

export const UPDATES: Update[] = [
  {
    id: "new-components-1",
    date: "2026-11-25",
    tags: ["new"],
    title: "12 new robot parts",
    summary:
      "A gripper that picks things up, a 16-servo PCA9685 driver, stepper and encoder motors, continuous servos, the L298N motor driver, new wheels and more. Each one wires, codes and moves like the real part.",
    cta: { label: "Open my robots", to: "/dashboard" },
  },
  {
    id: "robot-battles",
    version: "v2.0",
    date: "2026-12-01",
    upcoming: true,
    // Same copy as the homepage teaser, so the two never drift apart.
    month: en.whatsNew.date,
    tags: ["new"],
    title: en.whatsNew.name,
    summary: `${en.whatsNew.desc} ${en.whatsNew.kicker}`,
    cta: { label: en.whatsNew.notify, to: "/", hash: "cta" },
  },
  {
    id: "google-sign-in",
    date: "2026-11-11",
    tags: ["new", "improved"],
    title: "Sign in with Google",
    summary:
      "Sign in with one click using Google. Forgot your password? Reset it with an email link or a one-time code.",
    cta: { label: "Log in", to: "/login" },
  },
  {
    id: "share-links",
    date: "2026-11-10",
    tags: ["improved"],
    title: "Share a robot with one link",
    summary:
      "Links to a Community build now open that robot directly, so your friends land right on what you made.",
    cta: { label: "Open Community", to: "/community" },
  },
  {
    id: "tutorials",
    date: "2026-11-06",
    tags: ["new"],
    title: "Tutorials, right in the page",
    summary: "Video tutorials have their own tab now and play without leaving Constructa.",
    cta: { label: "Watch tutorials", to: "/tutorials" },
  },
  {
    id: "open-community",
    date: "2026-10-31",
    tags: ["improved"],
    title: "Community, open to everyone",
    summary:
      "Browse every published robot without an account. You only need one to reuse a build in your own workshop.",
    cta: { label: "Explore Community", to: "/community" },
  },
  {
    id: "workshop-dashboard",
    date: "2026-10-22",
    tags: ["new"],
    title: "Your new workshop",
    summary: "A fresh dashboard for all your robots, and the whole site now speaks 11 languages.",
    cta: { label: "Open my robots", to: "/dashboard" },
  },
];

export const LATEST = UPDATES[0];

/** "Oct 22, 2026". UTC so server and client agree. */
export function formatUpdateDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
