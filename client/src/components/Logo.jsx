export function Logo() {
  return (
    <div className="flex flex-col items-center cursor-pointer select-none">
      <svg
        viewBox="0 0 160 90"
        width="140"
        height="80"
        className="text-black"
      >
        {/* M */}
        <text
          x="10"
          y="60"
          fontFamily="Playfair Display, serif"
          fontSize="64"
          fontWeight="700"
          letterSpacing="-4"
          fill="currentColor"
        >
          M
        </text>

        {/* H (closer to M) */}
        <text
          x="68"
          y="60"
          fontFamily="Playfair Display, serif"
          fontSize="64"
          fontWeight="700"
          letterSpacing="-4"
          fill="currentColor"
        >
          H
        </text>

        {/* Integrated fashion curve — ends before scissors */}
        <path
          d="
            M18 58
            C40 5, 55 70, 80 35
            S118 40, 124 23
          "
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          opacity="0.8"
        />

        {/* Scissors — clean line-based */}
        <g transform="translate(138, 19) rotate(-35)" opacity="0.85">
          {/* Top blade */}
          <line x1="0" y1="0" x2="-10" y2="-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Bottom blade */}
          <line x1="0" y1="0" x2="-10" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Pivot screw */}
          <circle cx="0" cy="0" r="1.3" fill="currentColor"/>
          {/* Top handle connector */}
          <line x1="0" y1="0" x2="7" y2="-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Bottom handle connector */}
          <line x1="0" y1="0" x2="7" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Top handle ring */}
          <circle cx="9.5" cy="-7" r="3" fill="none" stroke="currentColor" strokeWidth="1.1"/>
          {/* Bottom handle ring */}
          <circle cx="9.5" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.1"/>
        </g>
      </svg>

      {/* Divider line with centered text */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "11.5px",
            letterSpacing: "0.42em",
            marginRight: "15px",
            color: "#555",
            fontWeight: 400,
            whiteSpace: "nowrap",
          }}
        >
          FASHION STUDIO
        </div>
      </div>
    </div>
  );
}
