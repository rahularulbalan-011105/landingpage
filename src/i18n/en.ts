/**
 * English source for every piece of landing-page copy. Other languages mirror this shape exactly
 * (see `Messages`). "\n" marks a deliberate line break in a headline.
 * The mock editor UI (tool names, code, part labels) stays English on purpose: it mirrors the real editor.
 */
export const en = {
  nav: {
    how: "How it works",
    features: "Features",
    whatsNew: "What's new",
    newBadge: "new",
    community: "Community",
    login: "Log in",
    start: "Start Constructa",
    myRobots: "My robots",
    language: "Language",
    home: "Constructa home",
    byAtumx: "by AtumX",
  },
  hero: {
    title: "That robot in your head?\nBuild it here.",
    lead: "Give it legs. Give it wheels. Give it sensors.",
    sub: "Design, wire and code your robot in 3D.",
    cta: "Start Constructa",
    tour: "Watch the 1-minute tour",
    tourTitle: "Constructa in one minute",
    chooseRobot: "Choose a robot",
    models: { crawler: "Crawler", arm: "Arm", humanoid: "Humanoid" },
    throwHint: "Grab a part and throw it.",
    rebuildShort: "Rebuild",
    rebuildLong: "Rebuild the robot",
    dragHint: "Drag to rotate.",
    clickApart: "Click to take it apart.",
    tapApart: "Tap to take it apart.",
  },
  how: {
    title: "All you need to build, in one place.",
    sub: "Shape the body, connect the electronics and write the code. Then hit Run and see your robot move.",
    stepsLabel: "How it works steps",
    steps: [
      {
        tag: "CAD",
        title: "Build it.",
        body: "Sketch the chassis, drop in motors and wheels, and snap them together on a real 3D workbench. Every part is measured, so what you build here is what you'd build on your desk.",
      },
      {
        tag: "Electronics",
        title: "Wire it.",
        body: "Bolt an Arduino on top, add an ultrasonic sensor, then drag wires pin to pin. Every connection is there to see.",
      },
      {
        tag: "Code",
        title: "Code it.",
        body: "Write the sketch in blocks or C++ and upload it. The board wakes up, the sensor pings and your car drives, with real physics deciding the rest.",
      },
    ],
  },
  features: {
    eyebrow: "Features",
    title: "Why builders choose Constructa.",
    aside: "Don't take our word for it. Every card below is a tiny piece of Constructa. Hover to play it again.",
    physics: {
      title: "Physics that tells the truth.",
      line: "Switch to the Moon or Zero-G and press Start. Gravity, mass and torque decide how your robot moves.",
    },
    price: { title: "No parts to buy.", line: "Test every idea for free. Build the real robot only when it works." },
    wiring: { title: "Wiring you can see.", line: "Drag a wire pin to pin. Sensors only work once they're wired right." },
    code: { title: "Blocks become real code.", line: "Snap blocks together and get real Arduino C++, ready for a real board." },
    canvas: {
      title: "A blank canvas, not a kit.",
      line: "Shape any part with real CAD tools: slice, combine, extrude, all to exact size.",
    },
    laptop: { title: "Runs on your laptop.", line: "Open a browser and start building. Nothing to install, nothing to pay." },
  },
  constructathon: {
    eyebrow: "Constructathon · 12 Sept 2026",
    title: "Our last Constructathon, in pictures.",
    aside: "Our first build challenge. No templates and no limits: builders designed, wired and coded any robot they wanted, in a single day.",
    captions: ["Building a scorpion striker", "Placing an Arduino and a servo", "Designing a battle bot"],
    stripLabel: "Robots built in Constructa",
    alts: {
      build1: "Building a scorpion robot in Constructa",
      build2: "Placing an Arduino and a servo in Constructa",
      build3: "Designing a battle bot in Constructa",
      spider: "Six-legged spider robot",
      humanoid: "Humanoid robot",
      quad: "Four-legged robot",
      battle: "Battle bot",
      duck: "Two-legged duck robot",
      car: "Wheeled car robot",
      scorpion: "Scorpion robot with claws",
    },
  },
  whatsNew: {
    eyebrow: "What's new",
    title: "Constructa keeps getting better.",
    aside: "Every update ships free, straight to your browser. Here's what's coming next.",
    date: "Dec 2026",
    comingSoon: "Coming soon",
    name: "Robot Battles",
    desc: "Build a fighter, code its moves, then battle your friends' robots in the arena.",
    kicker: "Same real physics. Last robot standing wins.",
    notify: "Get notified",
    daysToGo: "days to go",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered.",
    items: [
      {
        q: "Is it really free?",
        a: "Yes, completely free. We’re a hardware company, and the tool is how we say thanks to the maker community.",
      },
      {
        q: "Do I need to download anything?",
        a: "Nope. It runs right in your browser: Chrome, Edge, Firefox or Safari. Just use a computer, because Constructa needs a big screen to build big robots.",
      },
      {
        q: "I’m on my phone. Can I use it?",
        a: "Constructa is built for a desktop-size screen, so it isn’t playable on a phone yet. Drop your email and we’ll send you a link to open your workshop on a computer.",
      },
      {
        q: "What can I actually build?",
        a: "Any robot you imagine. Wheels, legs, arms, sensors, motors. Free-form 3D building, not pre-built templates. If you can dream it, you can build it.",
      },
      {
        q: "What coding languages does it support?",
        a: "Two. Block Coding for beginners and real Arduino C++ when you're ready. The blocks write the C++ for you, so you can switch any time and see exactly what your blocks do.",
      },
      {
        q: "When do I get access?",
        a: "Constructa is free to jump into right now. Drop your email too and we’ll send every new feature, release and tip straight to your inbox. If you described a robot you’d build, we might build it and feature you.",
      },
      {
        q: "Who is AtumX?",
        a: "A robotics hardware startup based in Chennai, India. Making STEM kits since 2022, used in 500+ schools across four countries. SUBO is our flagship board; Constructa is our workshop in the browser.",
      },
    ],
  },
  cta: {
    eyebrow: "Start building",
    title: "Ready to build\nsomething weird?",
    body: "Jump into the workshop now, or drop your email to get every update. Free, no login.",
  },
  signup: {
    tryFree: "Try Constructa free",
    tryMeta: "Free · Sign up in seconds · Save your robots",
    bigScreen: "Open the workshop on a desktop or laptop. Constructa needs a big screen.",
    orUpdates: "or get updates",
    robotQuestion: "What robot would you build?",
    robotPlaceholder: "A six-legged crawler that climbs stairs…",
    email: "Email",
    submit: "Keep me posted",
    sending: "Sending…",
    note: "New features, releases and tips go straight to this email.",
    noteDesktop: "No spam.",
    notePhone: "(On a phone? We'll email a link to open it on a computer.)",
    discord: "Join the Discord community",
    youreIn: "You’re in.",
    // The three success pieces are joined with no extra spaces, so put any needed spaces inside them.
    successBefore: "We’ll email you every Constructa update from here. Want to dive in right now? Jump into the workshop on a ",
    successComputer: "computer",
    successAfter: ". Constructa needs a big screen to build big robots.",
    checkForm: "Check the form",
    error: "Something went wrong. Try again.",
    hide: "Hide",
    tellUs: "Tell us who you are",
    iAm: "I am a…",
    selectOne: "Select one",
    userTypes: ["Student", "Teacher or educator", "Parent", "Maker or hobbyist", "Distributor or reseller", "Other"],
  },
  footer: {
    about:
      "Constructa is a free 3D robot workshop in your browser. Build, wire and code any robot, then watch it run with real physics. Made by AtumX, the team behind the SUBO robotics kit.",
    followUs: "Follow us",
    colConstructa: "Constructa",
    colResources: "Resources",
    colCommunity: "Community",
    how: "How it works",
    features: "Features",
    constructathon: "Constructathon",
    startBuilding: "Start building",
    login: "Log in",
    simulatorPost: "Free robot simulator with real physics",
    tinkercadPost: "Tinkercad alternative for robotics",
    blog: "AtumX blog",
    faq: "FAQ",
    discord: "Discord community",
    atumx: "AtumX",
    address: "Anna University Incubation, Chennai, India",
    language: "Language",
  },
};

/** Same keys as English, any string values. Arrays keep their length and order. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;
