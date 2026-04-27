// Slot machine fight setup — the centerpiece.
// 3 reels: VENUE | WEAPON A | WEAPON B
// Lever, glowing arcade buttons, ambient lights, fighter portraits flanking.

const REEL_ITEM_H = 180;

const Reel = ({ items, label, color, locked, onSpinComplete, spinTrigger, animLevel }) => {
  const [spinning, setSpinning] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [resultIdx, setResultIdx] = React.useState(0);
  const [bounce, setBounce] = React.useState(false);
  const reelRef = React.useRef(null);

  // Build a long strip of items to scroll past
  const strip = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < 8; i++) out.push(...items);
    return out;
  }, [items]);

  React.useEffect(() => {
    if (spinTrigger === 0) return;
    spin();
  }, [spinTrigger]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setBounce(false);
    const finalIdx = Math.floor(Math.random() * items.length);
    const totalItems = items.length * 6 + finalIdx;
    const duration = 2000 + Math.random() * 700;
    const target = totalItems * REEL_ITEM_H;
    const start = performance.now();
    const startOffset = offset % (items.length * REEL_ITEM_H);

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic w/ slight overshoot at end
      const eased = 1 - Math.pow(1 - t, 3);
      setOffset(startOffset + (target - startOffset) * eased);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setSpinning(false);
        setResultIdx(finalIdx);
        setBounce(true);
        setTimeout(() => setBounce(false), 500);
        onSpinComplete?.(items[finalIdx]);
      }
    };
    requestAnimationFrame(step);
  };

  const currentItem = items[resultIdx];

  return (
    <div className={`bb-reel ${spinning ? 'is-spinning' : ''} ${bounce ? 'is-bouncing' : ''}`}>
      <div className="bb-reel-label" style={{ color }}>{label}</div>
      <div className="bb-reel-window" style={{ "--reel-color": color }}>
        <div className="bb-reel-glass" />
        <div className="bb-reel-strip" ref={reelRef}
             style={{
               transform: `translateY(-${offset}px)`,
               filter: spinning && animLevel > 0.3 ? `blur(${Math.min(4, animLevel * 6)}px)` : 'none',
             }}>
          {strip.map((item, i) => (
            <div key={i} className="bb-reel-item">
              {label.includes("VENUE")
                ? <VenueArt venue={item} w={220} h={140} />
                : <WeaponArt weapon={item} w={220} h={140} />}
              <div className="bb-reel-item-name">{item.name}</div>
            </div>
          ))}
        </div>
        {/* center indicator */}
        <div className="bb-reel-indicator" style={{ borderColor: color }} />
      </div>

      {!spinning && currentItem && (
        <div className="bb-reel-mods">
          <div className="bb-reel-blurb">{currentItem.blurb}</div>
          <div className="bb-mod-row">
            {currentItem.mods.map((m, i) => (
              <span key={i} className={`bb-mod ${m.startsWith('+') ? 'bb-mod--pos' : 'bb-mod--neg'}`}>{m}</span>
            ))}
          </div>
        </div>
      )}

      <button className="bb-reroll" onClick={spin} disabled={spinning || locked}>
        <span className="bb-reroll-glow" style={{ background: color }} />
        <span className="bb-reroll-text">↻ RE-ROLL</span>
      </button>
    </div>
  );
};

const SlotMachine = ({ fighters, onLockIn, animLevel }) => {
  const unlocked = fighters.filter(f => f.unlocked);
  const [fighterAId, setFighterAId] = React.useState(unlocked[0]?.id);
  const [fighterBId, setFighterBId] = React.useState(unlocked[1]?.id);
  const [results, setResults] = React.useState({ venue: null, weaponA: null, weaponB: null });
  const [spinAll, setSpinAll] = React.useState(0);
  const [leverPulled, setLeverPulled] = React.useState(false);

  const fighterA = fighters.find(f => f.id === fighterAId);
  const fighterB = fighters.find(f => f.id === fighterBId);

  const onResult = (key) => (item) => {
    setResults(r => ({ ...r, [key]: item }));
  };

  const pullLever = () => {
    setLeverPulled(true);
    setSpinAll(s => s + 1);
    setTimeout(() => setLeverPulled(false), 600);
  };

  const ready = results.venue && results.weaponA && results.weaponB;

  const cycleFighter = (which, dir) => {
    const list = unlocked;
    const cur = which === 'a' ? fighterAId : fighterBId;
    const idx = list.findIndex(f => f.id === cur);
    const next = list[(idx + dir + list.length) % list.length];
    if (which === 'a') {
      if (next.id === fighterBId) return cycleFighter(which, dir + (dir > 0 ? 1 : -1));
      setFighterAId(next.id);
    } else {
      if (next.id === fighterAId) return cycleFighter(which, dir + (dir > 0 ? 1 : -1));
      setFighterBId(next.id);
    }
  };

  return (
    <div className="bb-page bb-slot-page">
      <header className="bb-page-head">
        <div>
          <div className="bb-eyebrow">FIGHT SETUP</div>
          <h1 className="bb-headline">PULL THE LEVER</h1>
        </div>
        <div className="bb-page-meta">
          <span className="bb-pill bb-pill--gold">{ready ? "READY TO LOCK IN" : "ROLL ALL THREE"}</span>
        </div>
      </header>

      <div className="bb-arena">
        {/* Fighter A */}
        <FighterPanel side="left" fighter={fighterA} animLevel={animLevel}
                      onCycle={(d) => cycleFighter('a', d)} />

        {/* The slot machine */}
        <div className="bb-machine-wrap">
          <div className="bb-machine">
            {/* light bulbs around the top */}
            <div className="bb-machine-lights">
              {[...Array(11)].map((_, i) => (
                <span key={i} className="bb-light" style={{
                  animationDelay: `${i * 0.12}s`,
                  background: ["#3b82f6", "#ec4899", "#fbbf24"][i % 3],
                }} />
              ))}
            </div>

            <div className="bb-machine-marquee">
              <span className="bb-marquee-text">★ BATTLEBROS ★</span>
            </div>

            <div className="bb-reels-row">
              <Reel items={window.BB_DATA.VENUES} label="◆ VENUE" color="#3b82f6"
                    spinTrigger={spinAll} onSpinComplete={onResult('venue')} animLevel={animLevel} />
              <Reel items={window.BB_DATA.WEAPONS} label={`◆ ${fighterA?.name}'S TOOL`} color="#ec4899"
                    spinTrigger={spinAll} onSpinComplete={onResult('weaponA')} animLevel={animLevel} />
              <Reel items={window.BB_DATA.WEAPONS} label={`◆ ${fighterB?.name}'S TOOL`} color="#fbbf24"
                    spinTrigger={spinAll} onSpinComplete={onResult('weaponB')} animLevel={animLevel} />
            </div>

            <button
              className={`bb-lock-in ${ready ? 'is-ready' : ''}`}
              disabled={!ready}
              onClick={() => onLockIn({ fighterA, fighterB, ...results })}>
              <span>LOCK IN & FIGHT</span>
              <span className="bb-lock-in-arrow">▶</span>
            </button>
          </div>

          {/* Lever */}
          <div className={`bb-lever ${leverPulled ? 'is-pulled' : ''}`} onClick={pullLever}>
            <div className="bb-lever-base" />
            <div className="bb-lever-stick">
              <div className="bb-lever-knob" />
            </div>
            <div className="bb-lever-label">PULL TO ROLL ALL</div>
          </div>
        </div>

        {/* Fighter B */}
        <FighterPanel side="right" fighter={fighterB} animLevel={animLevel}
                      onCycle={(d) => cycleFighter('b', d)} />
      </div>
    </div>
  );
};

const FighterPanel = ({ side, fighter, onCycle, animLevel }) => {
  if (!fighter) return null;
  return (
    <div className={`bb-fighter-panel bb-fighter-panel--${side}`}>
      <div className="bb-fp-cycle">
        <button className="bb-cycle-btn" onClick={() => onCycle(-1)}>‹</button>
        <span className="bb-fp-vs">{side === 'left' ? 'FIGHTER A' : 'FIGHTER B'}</span>
        <button className="bb-cycle-btn" onClick={() => onCycle(1)}>›</button>
      </div>
      <div className="bb-fp-avatar">
        <Avatar fighter={fighter} size={260} pose="fight" animate={animLevel > 0.4} />
      </div>
      <div className="bb-fp-name">{fighter.name}</div>
      <div className="bb-fp-record">{fighter.wins}W · {fighter.losses}L</div>
      <div className="bb-fp-traits">
        {fighter.traits.slice(0, 3).map((t, i) => (
          <span key={i} className="bb-fp-trait">"{t.text}"</span>
        ))}
      </div>
    </div>
  );
};

window.SlotMachine = SlotMachine;
