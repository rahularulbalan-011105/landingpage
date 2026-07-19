type MascotProps = {
  /** pixel size (width). Height scales with the art. */
  size?: number;
  className?: string;
  /** face expression */
  mood?: "happy" | "wow" | "wink";
  title?: string;
};

/**
 * Constructa's blue robot mascot — placeholder inline SVG in the comic style
 * (thick black outline, mascot-blue body, cyan eyes). Swap for the real
 * brand asset later; the API (size / mood / className) can stay the same.
 */
export function Mascot({
  size = 96,
  className = "",
  mood = "happy",
  title = "Bolt, the Constructa robot",
}: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* antenna */}
      <line x1="60" y1="20" x2="60" y2="6" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="6" r="6" fill="#FF6B35" stroke="#111111" strokeWidth="4" />

      {/* ears */}
      <rect x="6" y="52" width="14" height="26" rx="6" fill="#1E90C4" stroke="#111111" strokeWidth="4" />
      <rect x="100" y="52" width="14" height="26" rx="6" fill="#1E90C4" stroke="#111111" strokeWidth="4" />

      {/* head */}
      <rect x="18" y="20" width="84" height="80" rx="26" fill="#29ABE2" stroke="#111111" strokeWidth="5" />

      {/* face plate */}
      <rect x="30" y="40" width="60" height="42" rx="16" fill="#0F1B24" stroke="#111111" strokeWidth="4" />

      {/* eyes */}
      {mood === "wink" ? (
        <>
          <path d="M40 60 q6 -8 12 0" stroke="#5EE0FF" strokeWidth="5" strokeLinecap="round" fill="none" />
          <polygon points="68,52 80,58 68,66" fill="#5EE0FF" />
        </>
      ) : mood === "wow" ? (
        <>
          <circle cx="46" cy="60" r="7" fill="#5EE0FF" />
          <circle cx="74" cy="60" r="7" fill="#5EE0FF" />
        </>
      ) : (
        <>
          <polygon points="40,52 52,58 40,66" fill="#5EE0FF" />
          <polygon points="80,52 68,58 80,66" fill="#5EE0FF" />
        </>
      )}

      {/* cheek bolts */}
      <circle cx="26" cy="92" r="3.4" fill="#FFD34E" stroke="#111111" strokeWidth="2.5" />
      <circle cx="94" cy="92" r="3.4" fill="#FFD34E" stroke="#111111" strokeWidth="2.5" />
    </svg>
  );
}
