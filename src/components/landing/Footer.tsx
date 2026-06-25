export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        <div>
          <p className="text-[18px] font-medium text-foreground">AtumX</p>
          <p className="mt-4 text-[13px] text-text-tertiary">
            Anna University Incubation, Chennai, India
          </p>
          <a
            href="https://www.atumx.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[13px] text-text-secondary hover:text-foreground transition-colors duration-200 ease-out-soft hover:underline underline-offset-4"
          >
            atumx.in
          </a>
        </div>

        <div className="md:flex md:items-end">
          <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-text-tertiary">
            © 2026 AtumX Innovations Pvt Ltd
          </p>
        </div>

        <div className="md:text-right flex flex-col gap-2 md:items-end">
          <a
            href="https://www.linkedin.com/company/atumxofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-text-secondary hover:text-foreground transition-colors duration-200 ease-out-soft hover:underline underline-offset-4 w-fit"
          >
            LinkedIn
          </a>
          <a
            href="https://www.youtube.com/@AtumX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] text-text-secondary hover:text-foreground transition-colors duration-200 ease-out-soft hover:underline underline-offset-4 w-fit"
          >
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}
