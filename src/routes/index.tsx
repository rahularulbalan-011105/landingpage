import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhatsDifferent } from "@/components/landing/WhatsDifferent";
import { ConstructathonWall } from "@/components/landing/ConstructathonWall";
import { WhatsNew } from "@/components/landing/WhatsNew";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Constructa" },
      {
        name: "description",
        content:
          "Free-form 3D robot building with real physics — a robot workshop in your browser. By the team behind SUBO, used in 500+ schools.",
      },
      { property: "og:title", content: "That robot in your head? Build it here. | Constructa" },
      {
        property: "og:description",
        content:
          "Free-form 3D robot building with real physics — a robot workshop in your browser. By the team behind SUBO, used in 500+ schools.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: "That robot in your head? Build it here. | Constructa" },
      {
        name: "twitter:description",
        content:
          "Free-form 3D robot building with real physics. Browser-based. By the team behind SUBO.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <WhatsDifferent />
        <ConstructathonWall />
        <WhatsNew />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
