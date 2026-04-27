// Illustrated card art for venues + weapons (trading-card style).
// Bordered, simple stylized illustration.

const VenueArt = ({ venue, w = 220, h = 140 }) => {
  if (!venue) return null;
  const stroke = "#0a0a0f";
  const sw = 2;
  return (
    <svg viewBox="0 0 220 140" width={w} height={h} style={{ display: "block" }}>
      <rect x="0" y="0" width="220" height="140" fill="#f5e9c8" />
      <rect x="0" y="0" width="220" height="140" fill="url(#paper-tex)" opacity="0.4" />
      <defs>
        <pattern id="paper-tex" patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="1" cy="1" r="0.5" fill="#a08458" opacity="0.3" />
        </pattern>
      </defs>

      {venue.id === "costco" && (
        <g>
          <rect x="0" y="80" width="220" height="60" fill="#9ca3af" />
          <line x1="0" y1="100" x2="220" y2="100" stroke="#fff" strokeDasharray="8 8" strokeWidth="2" />
          <line x1="0" y1="120" x2="220" y2="120" stroke="#fff" strokeDasharray="8 8" strokeWidth="2" />
          <rect x="20" y="30" width="180" height="50" fill="#3b82f6" stroke={stroke} strokeWidth={sw} />
          <text x="110" y="62" textAnchor="middle" fill="#fff" fontFamily="Bebas Neue, Impact, sans-serif" fontSize="24" letterSpacing="2">WAREHOUSE</text>
          {/* shopping cart */}
          <g transform="translate(150, 90)">
            <rect x="0" y="0" width="20" height="14" fill="none" stroke={stroke} strokeWidth={sw} />
            <line x1="20" y1="0" x2="26" y2="-4" stroke={stroke} strokeWidth={sw} />
            <circle cx="4" cy="18" r="2.5" fill={stroke} />
            <circle cx="16" cy="18" r="2.5" fill={stroke} />
          </g>
        </g>
      )}

      {venue.id === "ikea" && (
        <g>
          <rect x="0" y="0" width="220" height="140" fill="#fbbf24" />
          <rect x="0" y="100" width="220" height="40" fill="#fde68a" />
          {/* shelves */}
          <rect x="20" y="40" width="60" height="60" fill="#fff" stroke={stroke} strokeWidth={sw} />
          <line x1="20" y1="60" x2="80" y2="60" stroke={stroke} strokeWidth="1.5" />
          <line x1="20" y1="80" x2="80" y2="80" stroke={stroke} strokeWidth="1.5" />
          <rect x="100" y="60" width="40" height="40" fill="#3b82f6" stroke={stroke} strokeWidth={sw} />
          <rect x="160" y="50" width="50" height="50" fill="#ef4444" stroke={stroke} strokeWidth={sw} />
          <line x1="160" y1="75" x2="210" y2="75" stroke={stroke} strokeWidth="1.5" />
          <line x1="185" y1="50" x2="185" y2="100" stroke={stroke} strokeWidth="1.5" />
        </g>
      )}

      {venue.id === "denny's" && (
        <g>
          <rect x="0" y="0" width="220" height="140" fill="#1e1b4b" />
          {/* neon sign */}
          <rect x="40" y="20" width="140" height="40" fill="#0a0a0f" stroke="#ec4899" strokeWidth={sw + 1} rx="4" />
          <text x="110" y="48" textAnchor="middle" fill="#ec4899" fontFamily="Bebas Neue, Impact" fontSize="24" letterSpacing="3">24 HRS</text>
          {/* booth */}
          <rect x="20" y="80" width="80" height="40" fill="#7f1d1d" stroke={stroke} strokeWidth={sw} />
          <rect x="120" y="90" width="80" height="30" fill="#374151" stroke={stroke} strokeWidth={sw} />
          {/* coffee */}
          <ellipse cx="160" cy="88" rx="8" ry="3" fill="#92400e" />
          <line x1="158" y1="78" x2="158" y2="86" stroke="#fff" strokeWidth="1" opacity="0.6" />
        </g>
      )}

      {venue.id === "homedepot" && (
        <g>
          <rect x="0" y="0" width="220" height="140" fill="#10b981" />
          <rect x="0" y="90" width="220" height="50" fill="#78350f" />
          {/* lumber */}
          <rect x="20" y="50" width="80" height="40" fill="#d97706" stroke={stroke} strokeWidth={sw} />
          <line x1="20" y1="60" x2="100" y2="60" stroke={stroke} strokeWidth="1" />
          <line x1="20" y1="70" x2="100" y2="70" stroke={stroke} strokeWidth="1" />
          <line x1="20" y1="80" x2="100" y2="80" stroke={stroke} strokeWidth="1" />
          {/* plant */}
          <rect x="140" y="60" width="40" height="30" fill="#a16207" stroke={stroke} strokeWidth={sw} />
          <path d="M 145 60 Q 160 30 175 60 M 150 60 Q 165 35 178 60" fill="#15803d" stroke={stroke} strokeWidth={sw} />
          {/* bee */}
          <g transform="translate(180, 30)">
            <ellipse cx="0" cy="0" rx="5" ry="3" fill="#fbbf24" stroke={stroke} strokeWidth="1.5" />
            <line x1="-3" y1="-2" x2="-3" y2="2" stroke={stroke} strokeWidth="1.5" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke={stroke} strokeWidth="1.5" />
          </g>
        </g>
      )}

      {venue.id === "chuck" && (
        <g>
          <rect x="0" y="0" width="220" height="140" fill="#a855f7" />
          {/* tickets */}
          <rect x="20" y="40" width="60" height="20" fill="#fbbf24" stroke={stroke} strokeWidth={sw} transform="rotate(-8 50 50)" />
          <rect x="30" y="60" width="60" height="20" fill="#fbbf24" stroke={stroke} strokeWidth={sw} transform="rotate(6 60 70)" />
          {/* skee ball */}
          <rect x="120" y="60" width="80" height="50" fill="#7f1d1d" stroke={stroke} strokeWidth={sw} />
          <circle cx="140" cy="80" r="6" fill="#fbbf24" stroke={stroke} strokeWidth="1.5" />
          <circle cx="160" cy="80" r="6" fill="#22d3ee" stroke={stroke} strokeWidth="1.5" />
          <circle cx="180" cy="80" r="6" fill="#ef4444" stroke={stroke} strokeWidth="1.5" />
        </g>
      )}

      {venue.id === "trader" && (
        <g>
          <rect x="0" y="0" width="220" height="140" fill="#fef2f2" />
          {/* hawaiian shirt pattern */}
          <g opacity="0.4">
            <circle cx="30" cy="30" r="8" fill="#ef4444" />
            <circle cx="80" cy="20" r="6" fill="#fbbf24" />
            <circle cx="180" cy="40" r="9" fill="#10b981" />
            <circle cx="200" cy="100" r="7" fill="#ec4899" />
          </g>
          {/* carts */}
          <g transform="translate(50, 70)">
            <rect x="0" y="0" width="40" height="25" fill="none" stroke={stroke} strokeWidth={sw} />
            <circle cx="8" cy="32" r="4" fill={stroke} />
            <circle cx="32" cy="32" r="4" fill={stroke} />
          </g>
          <g transform="translate(120, 80)">
            <rect x="0" y="0" width="40" height="25" fill="none" stroke={stroke} strokeWidth={sw} />
            <circle cx="8" cy="32" r="4" fill={stroke} />
            <circle cx="32" cy="32" r="4" fill={stroke} />
          </g>
        </g>
      )}

      {/* card border */}
      <rect x="3" y="3" width="214" height="134" fill="none" stroke={stroke} strokeWidth="3" />
      <rect x="6" y="6" width="208" height="128" fill="none" stroke={stroke} strokeWidth="0.5" />
    </svg>
  );
};

const WeaponArt = ({ weapon, w = 220, h = 140 }) => {
  if (!weapon) return null;
  const stroke = "#0a0a0f";
  const sw = 2.2;
  return (
    <svg viewBox="0 0 220 140" width={w} height={h} style={{ display: "block" }}>
      <rect x="0" y="0" width="220" height="140" fill="#f5e9c8" />
      {/* radiating lines */}
      <g opacity="0.15">
        {[...Array(16)].map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return <line key={i} x1="110" y1="70" x2={110 + Math.cos(a) * 200} y2={70 + Math.sin(a) * 200} stroke={stroke} strokeWidth="1" />;
        })}
      </g>
      <circle cx="110" cy="70" r="55" fill={weapon.color} stroke={stroke} strokeWidth={sw} />

      {weapon.id === "9-iron" && (
        <g transform="translate(110, 70) rotate(-30)">
          <line x1="0" y1="-40" x2="0" y2="35" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M -3 30 L 18 38 L 16 46 L -2 42 Z" fill="#9ca3af" stroke={stroke} strokeWidth={sw} />
          {/* bend */}
          <path d="M 0 -10 Q 4 0 0 10" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {weapon.id === "monster-can" && (
        <g transform="translate(110, 70)">
          <rect x="-15" y="-30" width="30" height="55" rx="3" fill="#0a0a0f" stroke={stroke} strokeWidth={sw} />
          <path d="M -10 -15 L 10 -15 L 6 -8 L -6 -8 Z" fill="#22d3ee" />
          <text x="0" y="12" textAnchor="middle" fill="#22d3ee" fontFamily="Impact, sans-serif" fontSize="14">M</text>
          {/* fizz */}
          <circle cx="-2" cy="-32" r="2" fill="#22d3ee" />
          <circle cx="6" cy="-36" r="1.5" fill="#22d3ee" />
        </g>
      )}

      {weapon.id === "laptop" && (
        <g transform="translate(110, 70)">
          <rect x="-32" y="-5" width="64" height="6" fill="#94a3b8" stroke={stroke} strokeWidth={sw} />
          <path d="M -28 -5 L -28 -32 L 28 -32 L 28 -5" fill="#cbd5e1" stroke={stroke} strokeWidth={sw} />
          <rect x="-25" y="-29" width="50" height="22" fill="#0a0a0f" />
          <circle cx="0" cy="-18" r="3" fill="#fbbf24" />
        </g>
      )}

      {weapon.id === "ikea-shelf" && (
        <g transform="translate(110, 70)">
          <rect x="-15" y="-40" width="30" height="80" fill="#fef3c7" stroke={stroke} strokeWidth={sw} />
          <line x1="-15" y1="-20" x2="15" y2="-20" stroke={stroke} strokeWidth="1.5" />
          <line x1="-15" y1="0" x2="15" y2="0" stroke={stroke} strokeWidth="1.5" />
          <line x1="-15" y1="20" x2="15" y2="20" stroke={stroke} strokeWidth="1.5" />
          {/* allen key */}
          <path d="M -30 35 L -30 28 L -22 28" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {weapon.id === "skateboard" && (
        <g transform="translate(110, 70) rotate(-15)">
          <rect x="-45" y="-6" width="90" height="12" rx="6" fill="#8b5cf6" stroke={stroke} strokeWidth={sw} />
          <circle cx="-30" cy="12" r="5" fill={stroke} />
          <circle cx="30" cy="12" r="5" fill={stroke} />
          <line x1="-20" y1="-3" x2="20" y2="-3" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        </g>
      )}

      {weapon.id === "monopoly-board" && (
        <g transform="translate(110, 70) rotate(8)">
          <rect x="-35" y="-35" width="70" height="70" fill="#fef3c7" stroke={stroke} strokeWidth={sw} />
          <rect x="-35" y="-35" width="70" height="10" fill="#dc2626" />
          <rect x="-35" y="25" width="70" height="10" fill="#dc2626" />
          <rect x="-35" y="-35" width="10" height="70" fill="#dc2626" />
          <rect x="25" y="-35" width="10" height="70" fill="#dc2626" />
          <text x="0" y="4" textAnchor="middle" fill={stroke} fontFamily="serif" fontWeight="900" fontSize="14">$</text>
        </g>
      )}

      {weapon.id === "noodle" && (
        <g transform="translate(110, 70)">
          <rect x="-50" y="-7" width="100" height="14" rx="7" fill="#f97316" stroke={stroke} strokeWidth={sw} />
          <ellipse cx="-50" cy="0" rx="3" ry="6" fill="#0a0a0f" opacity="0.5" />
        </g>
      )}

      {weapon.id === "frypan" && (
        <g transform="translate(110, 70)">
          <circle cx="0" cy="0" r="28" fill="#1f2937" stroke={stroke} strokeWidth={sw} />
          <circle cx="0" cy="0" r="22" fill="none" stroke="#374151" strokeWidth="2" />
          <rect x="20" y="-4" width="35" height="8" rx="2" fill="#1f2937" stroke={stroke} strokeWidth={sw} />
        </g>
      )}

      {/* card border */}
      <rect x="3" y="3" width="214" height="134" fill="none" stroke={stroke} strokeWidth="3" />
      <rect x="6" y="6" width="208" height="128" fill="none" stroke={stroke} strokeWidth="0.5" />
    </svg>
  );
};

window.VenueArt = VenueArt;
window.WeaponArt = WeaponArt;
