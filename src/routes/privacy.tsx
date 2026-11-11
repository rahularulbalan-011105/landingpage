import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/constructa-logo.webp";

/**
 * Privacy policy: public, linked from the footer and from the Google Auth
 * Platform consent screen (required to publish Google sign-in).
 *
 * Keep it TRUE to what the code does: when tracking, sign-in, email or hosting
 * changes, update the matching section and the "Last updated" date.
 * The wording must be reviewed by the company before relying on it legally.
 */
const UPDATED = "11 November 2026";
const CONTACT = "constructaofficial@gmail.com";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Constructa" },
      {
        name: "description",
        content: "How Constructa by AtumX collects, uses and protects your information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-white font-ui text-wb-ink">
      <header className="border-b border-wb-line">
        <div className="mx-auto flex max-w-[760px] items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" aria-label="Constructa home">
            <img src={logo} alt="Constructa" className="h-8 w-auto" />
          </Link>
          <Link to="/" className="text-[13.5px] font-semibold text-wb-ink-2 hover:text-wb-ink">
            ← Back to Constructa
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-5 pb-24 pt-10 text-[15px] leading-[1.7] text-wb-ink-2 sm:px-8">
        <h1 className="font-brand text-[32px] font-bold text-wb-ink sm:text-[40px]" style={{ letterSpacing: "-0.04em" }}>
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13.5px] text-wb-ink-3">Last updated: {UPDATED}</p>

        <Section title="Who we are">
          <p>
            Constructa is a browser-based robot design and simulation tool made by{" "}
            <b>AtumX Innovations Pvt Ltd</b>, Anna University Incubation, Chennai, India ("we", "us"). This policy
            covers the Constructa website and dashboard at <b>constructa-page.atumx.in</b> and the Constructa
            editor at <b>constructa.atumx.in</b>.
          </p>
        </Section>

        <Section title="What we collect">
          <List>
            <li>
              <b>Account details</b>: your name and email address. If you sign up with a password, it is stored
              only in hashed form by our authentication provider; we never see it.
            </li>
            <li>
              <b>Google sign-in</b>: if you choose "Continue with Google", Google shares your name, email address
              and profile picture with us. We do not get your Google password or any other Google data.
            </li>
            <li>
              <b>What you build</b>: your robots and projects, their names and settings, and whether you marked
              them complete. If you publish a robot to the Community, it becomes public together with your name.
              We also record which builds you like.
            </li>
            <li>
              <b>Email you give us elsewhere</b>: if you sign up for updates (email, and optionally whether you are
              a student, educator or maker, and your robot idea), or enter your email in the editor to start
              building.
            </li>
            <li>
              <b>Usage information</b>: random visitor and session identifiers stored in your browser, the pages
              you visit and actions you take (for example opening the editor, adding a part, running a
              simulation), how you found us (campaign, source and referring site), your device type (mobile or
              desktop), your browser's language and your time zone. We use the time zone to show roughly which
              region visits come from; we do not look up your IP address or precise location. If we know your
              email, these events are linked to it.
            </li>
            <li>
              <b>Advertising measurement</b>: we use the Google Ads tag to measure whether our ads lead to
              sign-ups. Google may set cookies for this.
            </li>
          </List>
        </Section>

        <Section title="How we use it">
          <List>
            <li>To create your account, sign you in, and save and sync your robots between the dashboard and the editor.</li>
            <li>To show your published robots in the Community with your name.</li>
            <li>To send emails you need, such as password resets, and Constructa updates if you asked for them.</li>
            <li>To understand how Constructa is used and improve it, and to measure our marketing.</li>
            <li>To keep the service secure and prevent abuse.</li>
          </List>
          <p className="mt-3">We do not sell your personal information.</p>
        </Section>

        <Section title="Who we share it with">
          <p>
            We share information only with trusted service providers that help us run Constructa with hosting,
            data storage and sign-in, sending emails, analytics and measuring our ads, and only for those
            purposes. We may also disclose information if required by law. Links to other sites follow those
            sites' own privacy policies.
          </p>
        </Section>

        <Section title="Children and students">
          <p>
            Many Constructa users are students. If you are under 18, please use Constructa with the permission of
            a parent or guardian. Parents and guardians can contact us at any time to see or delete their child's
            information.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep your account and robots while your account exists. Usage information is kept to understand
            trends over time. You can ask us to delete your account and the information linked to it.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <List>
            <li>You can rename, unpublish or delete your robots from My robots at any time.</li>
            <li>You can ask us for a copy of your information, or to correct or delete it.</li>
            <li>You can clear Constructa's data from your browser through your browser settings.</li>
          </List>
          <p className="mt-3">
            To make a request, email <a className="font-semibold text-wb-orange hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a> from
            the address on your account.
          </p>
        </Section>

        <Section title="Security">
          <p>
            Data is sent over encrypted connections (HTTPS), and access to your robots is restricted to your
            account unless you publish or share them. No system is perfectly secure, so please use a strong,
            unique password.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy as Constructa changes. We will change the "Last updated" date above, and
            for significant changes we will let you know on the site or by email.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            AtumX Innovations Pvt Ltd, Anna University Incubation, Chennai, India
            <br />
            Email: <a className="font-semibold text-wb-orange hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="mb-2 text-[19px] font-bold text-wb-ink">{title}</h2>
      {children}
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="ml-5 list-disc space-y-2">{children}</ul>;
}
