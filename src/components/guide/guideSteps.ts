import type { BoltAction, BoltMood } from "./Bolt3D";

/**
 * Bolt's tours. `target` is a [data-guide="…"] anchor on the page; a step whose
 * target isn't on screen (e.g. no community posts yet) is skipped automatically.
 * No target = Bolt talks from the centre stage.
 */
export type GuideStep = {
  id: string;
  target?: string;
  title: string;
  text: string;
  action?: BoltAction;
  mood?: BoltMood;
};

export const HOME_TOUR: GuideStep[] = [
  {
    id: "hello",
    title: "Hi, I'm Bolt! 👋",
    text: "Welcome to your Constructa dashboard! Constructa is a robot workshop right in your browser — you design robots in 3D, wire up real electronics, code them, and watch them come alive with real physics. Let me show you around!",
    action: "wave",
  },
  {
    id: "my-robots",
    target: "my-robots",
    title: "My Robots — your garage",
    text: "Every robot you build is saved here automatically. Click it to open the list: All shows everything, Drafts are robots you're still working on, and Completed are the ones you've finished.",
    action: "point",
  },
  {
    id: "new-project",
    target: "new-project",
    title: "Start a new robot",
    text: "Press New Project to open a fresh, empty workshop. Your robot saves itself while you build, so you never lose your work.",
    action: "point",
    mood: "wow",
  },
  {
    id: "community",
    target: "community",
    title: "The Community 🌍",
    text: "This is where builders share their robots with everyone. You can look at other people's builds, like them, and Reuse them to start your own copy. Click it whenever you like — I'll show you how it all works in there!",
    action: "point",
  },
  {
    id: "whatsapp",
    target: "whatsapp",
    title: "Join the WhatsApp Community",
    text: "Chat with other builders and the Constructa team, ask for help when you're stuck, and hear about new features and contests first.",
    action: "point",
  },
  {
    id: "tutorial",
    target: "tutorial",
    title: "Watch the tutorial",
    text: "A short video that walks you through building your very first robot, step by step. Perfect if you're new!",
    action: "point",
  },
  {
    id: "instagram",
    target: "instagram",
    title: "Follow us on Instagram",
    text: "See amazing robots from the community, quick tips and tricks, and the Constructathon winners.",
    action: "point",
    mood: "wink",
  },
  {
    id: "bye",
    title: "You're all set! 🚀",
    text: "Open My Robots to keep building, or visit the Community to get inspired. If you ever want this tour again, just tap me.",
    action: "wave",
    mood: "wink",
  },
];

export const COMMUNITY_TOUR: GuideStep[] = [
  {
    id: "c-hello",
    title: "Welcome to the Community 🌍",
    text: "Every robot here was shared by a builder like you. Look around, get ideas, and give your favourites a like!",
    action: "wave",
  },
  {
    id: "c-why",
    title: "Why share your robot?",
    text: "When you publish a robot, every Constructa builder can see it with your name on it. People can like it, you inspire others, and great builds get featured in the Constructathon. To share one, open My Robots and press the 🌐 globe button on its card.",
    action: "talk",
    mood: "wow",
  },
  {
    id: "c-view",
    target: "c-view",
    title: "View",
    text: "Opens the robot in the 3D workshop so you can look at every part — read-only, so nothing can be changed by accident.",
    action: "point",
  },
  {
    id: "c-reuse",
    target: "c-reuse",
    title: "Reuse — make it yours",
    text: "Press Reuse to copy this robot into My Robots → Drafts as your very own project. Change anything you like — the original builder's robot is never touched.",
    action: "point",
    mood: "wow",
  },
  {
    id: "c-like",
    target: "c-like",
    title: "Like",
    text: "Tap the heart to cheer a build on. Robots with the most likes show up first.",
    action: "point",
  },
  {
    id: "c-share",
    target: "c-share",
    title: "Share a link",
    text: "Copies a link to this robot so you can send it to friends, family or your class.",
    action: "point",
  },
  {
    id: "c-own",
    target: "c-edit",
    title: "This one's yours",
    text: "On your own posts, Edit opens the robot in the workshop, and the undo arrow takes it out of the Community and back to My Robots.",
    action: "point",
  },
  {
    id: "c-safe",
    title: "When others reuse your robot",
    text: "They get their own separate copy in their dashboard. Your original stays exactly as you made it — only you can ever change it. So sharing is always safe!",
    action: "talk",
    mood: "wink",
  },
];
