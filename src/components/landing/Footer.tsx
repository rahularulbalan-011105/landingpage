import logo from "@/assets/constructa-logo.jpeg";

export function Footer() {
  return (
    <footer className="bg-background border-t-[3px] border-ink">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        <div>
          <img
            src={logo}
            alt="Constructa"
            className="h-[64px] w-auto object-contain"
          />
          <p className="mt-4 text-[13px] font-medium text-text-tertiary">
            A workshop by <span className="font-bold text-text-secondary">AtumX</span>
            <br />
            Anna University Incubation, Chennai, India
          </p>
          <a
            href="https://www.atumx.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[13px] font-semibold text-text-secondary hover:text-primary transition-colors duration-200 ease-out-soft hover:underline underline-offset-4"
          >
            atumx.in
          </a>
        </div>

        <div className="md:flex md:items-end">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
            © 2026 AtumX Innovations Pvt Ltd
          </p>
        </div>

        <div className="md:text-right flex flex-col gap-2 md:items-end">
          <a
            href="https://www.linkedin.com/company/atumxofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-semibold text-text-secondary hover:text-primary transition-colors duration-200 ease-out-soft hover:underline underline-offset-4 w-fit"
          >
            LinkedIn
          </a>
          <a
            href="https://www.youtube.com/@AtumX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-semibold text-text-secondary hover:text-primary transition-colors duration-200 ease-out-soft hover:underline underline-offset-4 w-fit"
          >
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}
