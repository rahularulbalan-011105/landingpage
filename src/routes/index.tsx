import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RobotGallery } from "@/components/landing/RobotGallery";
import { WhyWeBuilt } from "@/components/landing/WhyWeBuilt";
import { WhatsDifferent } from "@/components/landing/WhatsDifferent";
import { Awards } from "@/components/landing/Awards";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Build any robot you imagine. Watch it run. | Constructa" },
      {
        name: "description",
        content:
          "Free-form 3D robot building with real physics — a browser workshop for young builders. By the team behind SUBO, used in 500+ schools.",
      },
      { property: "og:title", content: "Build any robot you imagine. Watch it run. | Constructa" },
      {
        property: "og:description",
        content:
          "Free-form 3D robot building with real physics — a browser workshop for young builders. By the team behind SUBO, used in 500+ schools.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: "Build any robot you imagine. Watch it run. | Constructa" },
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
        <RobotGallery />
        <WhyWeBuilt />
        <WhatsDifferent />
        <Awards />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
