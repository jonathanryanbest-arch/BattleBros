// Procedural SVG avatar.
// Generates a stylized cartoon body from fighter palette + accessories + build.
// Thick outlines, flat colors. Trait-tagged accessories drive the look.

const Avatar = ({ fighter, size = 220, pose = "idle", animate = true, locked = false }) => {
  const { palette, accessories = [], build = "average", id } = fighter;
  const stroke = "#0a0a0f";
  const sw = Math.max(2, size / 80);

  // Build dimensions
  const builds = {
    tank:    { shoulders: 56, torso: 50, head: 28, neck: 4 },
    stocky:  { shoulders: 50, torso: 44, head: 26, neck: 4 },
    average: { shoulders: 44, torso: 40, head: 24, neck: 5 },
    lanky:   { shoulders: 38, torso: 44, head: 22, neck: 7 },
    wiry:    { shoulders: 36, torso: 40, head: 22, neck: 6 },
    compact: { shoulders: 40, torso: 36, head: 24, neck: 4 },
  };
  const B = builds[build] || builds.average;

  const cx = 100, cy = 100;
  const headCy = cy - 30;

  const has = (a) => accessories.includes(a);

  return (
    <svg viewBox="0 0 200 200" width={size} height={size}
         style={{
           display: "block",
           filter: locked ? "grayscale(1) brightness(0.5)" : "none",
           animation: animate ? `bb-breathe 3.6s ease-in-out infinite` : "none",
           transformOrigin: "50% 100%",
         }}>
      <defs>
        <radialGradient id={`shadow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx={cx} cy={170} rx={B.shoulders * 0.8} ry="6" fill={`url(#shadow-${id})`} />

      {/* legs */}
      <rect x={cx - 16} y={130} width="12" height="32" rx="3"
            fill={palette.shirt} stroke={stroke} strokeWidth={sw} />
      <rect x={cx + 4} y={130} width="12" height="32" rx="3"
            fill={palette.shirt} stroke={stroke} strokeWidth={sw} />
      {/* shoes */}
      <ellipse cx={cx - 10} cy={166} rx="9" ry="4" fill="#222" stroke={stroke} strokeWidth={sw} />
      <ellipse cx={cx + 10} cy={166} rx="9" ry="4" fill="#222" stroke={stroke} strokeWidth={sw} />

      {/* torso */}
      <path d={`M ${cx - B.shoulders/2} ${cy - 10}
                Q ${cx - B.shoulders/2 - 4} ${cy + 20} ${cx - B.torso/2} ${cy + 35}
                L ${cx + B.torso/2} ${cy + 35}
                Q ${cx + B.shoulders/2 + 4} ${cy + 20} ${cx + B.shoulders/2} ${cy - 10}
                Z`}
            fill={has("flannel") ? palette.shirt : palette.shirt}
            stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />

      {/* flannel pattern */}
      {has("flannel") && (
        <g opacity="0.35" stroke="#0a0a0f" strokeWidth="1.2">
          <line x1={cx - 14} y1={cy - 5} x2={cx - 14} y2={cy + 32} />
          <line x1={cx + 14} y1={cy - 5} x2={cx + 14} y2={cy + 32} />
          <line x1={cx - 22} y1={cy + 8} x2={cx + 22} y2={cy + 8} />
          <line x1={cx - 22} y1={cy + 22} x2={cx + 22} y2={cy + 22} />
        </g>
      )}

      {/* arms */}
      <g>
        <rect x={cx - B.shoulders/2 - 6} y={cy - 8} width="12" height="40" rx="6"
              fill={palette.shirt} stroke={stroke} strokeWidth={sw}
              transform={pose === "fight" ? `rotate(-25 ${cx - B.shoulders/2} ${cy - 8})` : ""} />
        <rect x={cx + B.shoulders/2 - 6} y={cy - 8} width="12" height="40" rx="6"
              fill={palette.shirt} stroke={stroke} strokeWidth={sw}
              transform={pose === "fight" ? `rotate(25 ${cx + B.shoulders/2} ${cy - 8})` : ""} />
        {/* fists */}
        <circle cx={cx - B.shoulders/2} cy={cy + 32} r="6.5"
                fill={palette.skin} stroke={stroke} strokeWidth={sw} />
        <circle cx={cx + B.shoulders/2} cy={cy + 32} r="6.5"
                fill={palette.skin} stroke={stroke} strokeWidth={sw} />
      </g>

      {/* neck */}
      <rect x={cx - 5} y={headCy + B.head/2 - 2} width="10" height={B.neck + 4}
            fill={palette.skin} stroke={stroke} strokeWidth={sw} />

      {/* head */}
      <ellipse cx={cx} cy={headCy} rx={B.head/2} ry={B.head/2 + 2}
               fill={palette.skin} stroke={stroke} strokeWidth={sw} />

      {/* hair */}
      {!has("beanie") && !has("bucket-hat") && (
        <path d={`M ${cx - B.head/2} ${headCy - 6}
                  Q ${cx - B.head/2} ${headCy - B.head/2 - 6} ${cx} ${headCy - B.head/2 - 4}
                  Q ${cx + B.head/2} ${headCy - B.head/2 - 6} ${cx + B.head/2} ${headCy - 6}
                  Q ${cx + B.head/2 - 2} ${headCy - 12} ${cx} ${headCy - B.head/2}
                  Q ${cx - B.head/2 + 2} ${headCy - 12} ${cx - B.head/2} ${headCy - 6} Z`}
              fill={palette.hair} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      )}

      {/* beard */}
      {has("beard") && (
        <path d={`M ${cx - B.head/2 + 2} ${headCy + 2}
                  Q ${cx} ${headCy + B.head/2 + 6} ${cx + B.head/2 - 2} ${headCy + 2}
                  Q ${cx + 4} ${headCy + 8} ${cx} ${headCy + 6}
                  Q ${cx - 4} ${headCy + 8} ${cx - B.head/2 + 2} ${headCy + 2} Z`}
              fill={palette.hair} stroke={stroke} strokeWidth={sw} />
      )}

      {/* face */}
      <g>
        {/* eyes */}
        {has("sunglasses") ? (
          <g>
            <rect x={cx - 11} y={headCy - 3} width="9" height="5" rx="1.5" fill="#0a0a0f" stroke={stroke} strokeWidth={sw * 0.8} />
            <rect x={cx + 2} y={headCy - 3} width="9" height="5" rx="1.5" fill="#0a0a0f" stroke={stroke} strokeWidth={sw * 0.8} />
            <line x1={cx - 2} y1={headCy - 1} x2={cx + 2} y2={headCy - 1} stroke={stroke} strokeWidth={sw * 0.6} />
          </g>
        ) : has("glasses") ? (
          <g>
            <circle cx={cx - 6} cy={headCy} r="3.5" fill="#fff" stroke={stroke} strokeWidth={sw * 0.7} />
            <circle cx={cx + 6} cy={headCy} r="3.5" fill="#fff" stroke={stroke} strokeWidth={sw * 0.7} />
            <line x1={cx - 2.5} y1={headCy} x2={cx + 2.5} y2={headCy} stroke={stroke} strokeWidth={sw * 0.6} />
            <circle cx={cx - 6} cy={headCy} r="1.2" fill={stroke} />
            <circle cx={cx + 6} cy={headCy} r="1.2" fill={stroke} />
          </g>
        ) : (
          <g>
            <circle cx={cx - 6} cy={headCy - 1} r="1.6" fill={stroke} />
            <circle cx={cx + 6} cy={headCy - 1} r="1.6" fill={stroke} />
          </g>
        )}
        {/* mouth */}
        <path d={`M ${cx - 4} ${headCy + 6} Q ${cx} ${headCy + 9} ${cx + 4} ${headCy + 6}`}
              fill="none" stroke={stroke} strokeWidth={sw * 0.8} strokeLinecap="round" />
      </g>

      {/* bucket hat */}
      {has("bucket-hat") && (
        <g>
          <ellipse cx={cx} cy={headCy - B.head/2 + 2} rx={B.head/2 + 6} ry="3.5"
                   fill={palette.accent} stroke={stroke} strokeWidth={sw} />
          <rect x={cx - B.head/2 - 1} y={headCy - B.head/2 - 8} width={B.head + 2} height="10"
                rx="2" fill={palette.accent} stroke={stroke} strokeWidth={sw} />
        </g>
      )}

      {/* beanie */}
      {has("beanie") && (
        <g>
          <path d={`M ${cx - B.head/2} ${headCy - 4}
                    L ${cx - B.head/2} ${headCy - B.head/2 - 8}
                    Q ${cx} ${headCy - B.head/2 - 14} ${cx + B.head/2} ${headCy - B.head/2 - 8}
                    L ${cx + B.head/2} ${headCy - 4} Z`}
                fill={palette.accent} stroke={stroke} strokeWidth={sw} />
          <circle cx={cx} cy={headCy - B.head/2 - 14} r="3" fill={palette.accent} stroke={stroke} strokeWidth={sw} />
        </g>
      )}

      {/* headphones */}
      {has("headphones") && (
        <g>
          <path d={`M ${cx - B.head/2 - 2} ${headCy}
                    Q ${cx} ${headCy - B.head/2 - 8} ${cx + B.head/2 + 2} ${headCy}`}
                fill="none" stroke={palette.accent} strokeWidth={sw * 1.4} strokeLinecap="round" />
          <ellipse cx={cx - B.head/2 - 2} cy={headCy} rx="3.5" ry="5" fill={palette.accent} stroke={stroke} strokeWidth={sw * 0.8} />
          <ellipse cx={cx + B.head/2 + 2} cy={headCy} rx="3.5" ry="5" fill={palette.accent} stroke={stroke} strokeWidth={sw * 0.8} />
        </g>
      )}

      {/* earrings */}
      {has("earrings") && (
        <g>
          <circle cx={cx - B.head/2} cy={headCy + 4} r="1.5" fill={palette.accent} stroke={stroke} strokeWidth="1" />
          <circle cx={cx + B.head/2} cy={headCy + 4} r="1.5" fill={palette.accent} stroke={stroke} strokeWidth="1" />
        </g>
      )}

      {/* chain */}
      {has("chain") && (
        <g>
          <path d={`M ${cx - 14} ${cy + 6} Q ${cx} ${cy + 16} ${cx + 14} ${cy + 6}`}
                fill="none" stroke={palette.accent} strokeWidth={sw * 1.2} strokeLinecap="round" />
        </g>
      )}

      {/* fanny pack */}
      {has("fanny-pack") && (
        <rect x={cx - 14} y={cy + 22} width="28" height="9" rx="2"
              fill={palette.accent} stroke={stroke} strokeWidth={sw} />
      )}

      {/* held items (pose: idle props) */}
      {has("golf-club") && pose !== "fight" && (
        <g transform={`rotate(20 ${cx + B.shoulders/2} ${cy + 32})`}>
          <line x1={cx + B.shoulders/2} y1={cy + 32} x2={cx + B.shoulders/2 + 4} y2={cy - 18}
                stroke={stroke} strokeWidth={sw * 1.2} strokeLinecap="round" />
          <path d={`M ${cx + B.shoulders/2 + 4} ${cy - 20} l 8 -3 l 1 6 z`}
                fill="#aaa" stroke={stroke} strokeWidth={sw * 0.8} />
        </g>
      )}
      {has("skateboard") && pose !== "fight" && (
        <g>
          <rect x={cx - 28} y={167} width="56" height="5" rx="2" fill={palette.accent} stroke={stroke} strokeWidth={sw * 0.8} />
          <circle cx={cx - 22} cy={174} r="2.5" fill={stroke} />
          <circle cx={cx + 22} cy={174} r="2.5" fill={stroke} />
        </g>
      )}
      {has("energy-drink") && (
        <g>
          <rect x={cx - B.shoulders/2 - 6} y={cy + 22} width="9" height="14" rx="1.5"
                fill={palette.accent} stroke={stroke} strokeWidth={sw * 0.8} />
          <rect x={cx - B.shoulders/2 - 5} y={cy + 24} width="7" height="2" fill={stroke} />
        </g>
      )}
      {has("laptop") && (
        <g>
          <rect x={cx + B.shoulders/2 - 4} y={cy + 24} width="14" height="9" rx="1"
                fill="#ccc" stroke={stroke} strokeWidth={sw * 0.8} />
          <rect x={cx + B.shoulders/2 - 4} y={cy + 23} width="14" height="2"
                fill={stroke} />
        </g>
      )}

      {locked && (
        <g>
          <rect x="60" y="60" width="80" height="80" fill="rgba(0,0,0,0.5)" />
          <text x="100" y="108" textAnchor="middle" fill="#fbbf24"
                fontFamily="monospace" fontWeight="900" fontSize="22">🔒</text>
        </g>
      )}
    </svg>
  );
};

window.Avatar = Avatar;
