// Roster page — grid of fighter cards, flippable to show trait cloud.

const RosterPage = ({ fighters, onSelect, animLevel }) => {
  const [flipped, setFlipped] = React.useState({});
  const toggle = (id) => setFlipped(f => ({ ...f, [id]: !f[id] }));

  return (
    <div className="bb-page bb-roster">
      <header className="bb-page-head">
        <div>
          <div className="bb-eyebrow">SELECT YOUR</div>
          <h1 className="bb-headline">ROSTER</h1>
        </div>
        <div className="bb-page-meta">
          <span className="bb-pill bb-pill--gold">{fighters.filter(f => f.unlocked).length} / {fighters.length} UNLOCKED</span>
        </div>
      </header>

      <div className="bb-roster-grid">
        {fighters.map((f, i) => (
          <FighterCard key={f.id} fighter={f} flipped={flipped[f.id]}
                       onFlip={() => toggle(f.id)}
                       onOpen={() => onSelect(f.id)}
                       delay={i * 60}
                       animLevel={animLevel} />
        ))}
      </div>
    </div>
  );
};

const FighterCard = ({ fighter, flipped, onFlip, onOpen, delay, animLevel }) => {
  const winRate = fighter.wins + fighter.losses > 0
    ? fighter.wins / (fighter.wins + fighter.losses) : 0;

  const breathe = animLevel > 0.1;

  return (
    <div className="bb-card-shell" style={{ animationDelay: `${delay}ms` }}>
      <div className={`bb-card ${flipped ? "is-flipped" : ""} ${fighter.unlocked ? "is-unlocked" : "is-locked"}`}>
        {/* FRONT */}
        <div className="bb-card-face bb-card-front">
          <div className="bb-card-corner bb-card-corner--tl">{String(fighter.wins).padStart(2, '0')}–{String(fighter.losses).padStart(2, '0')}</div>
          <div className="bb-card-corner bb-card-corner--tr">
            {fighter.unlocked ? (
              <span className="bb-status bb-status--unlocked">UNLOCKED</span>
            ) : (
              <span className="bb-status bb-status--locked">🔒 LOCKED</span>
            )}
          </div>

          <div className={`bb-card-art ${breathe ? "bb-breathe-wrap" : ""}`}>
            <Avatar fighter={fighter} size={180} animate={breathe && animLevel > 0.4} locked={!fighter.unlocked} />
          </div>

          <div className="bb-card-body">
            <div className="bb-card-handle">{fighter.handle}</div>
            <div className="bb-card-name">{fighter.name}</div>

            <div className="bb-card-stats">
              <div className="bb-stat">
                <div className="bb-stat-num">{fighter.traits.length}</div>
                <div className="bb-stat-lbl">TRAITS</div>
              </div>
              <div className="bb-stat">
                <div className="bb-stat-num">{Math.round(winRate * 100)}%</div>
                <div className="bb-stat-lbl">WIN RATE</div>
              </div>
            </div>

            <div className="bb-winbar">
              <div className="bb-winbar-fill" style={{ width: `${winRate * 100}%` }} />
              <span className="bb-winbar-label">{fighter.wins}W · {fighter.losses}L</span>
            </div>

            <div className="bb-card-actions">
              <button className="bb-btn bb-btn--ghost" onClick={onFlip} disabled={!fighter.unlocked}>
                TRAIT CLOUD ↻
              </button>
              <button className="bb-btn bb-btn--primary" onClick={onOpen} disabled={!fighter.unlocked}>
                PROFILE →
              </button>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="bb-card-face bb-card-back">
          <div className="bb-card-corner bb-card-corner--tl">TRAIT CLOUD</div>
          <div className="bb-card-corner bb-card-corner--tr">{fighter.name}</div>
          <div className="bb-trait-cloud">
            {fighter.traits.map((t, i) => (
              <span key={i} className="bb-trait-tag" style={{
                fontSize: `${10 + t.weight * 1.4}px`,
                opacity: 0.55 + t.weight / 22,
                color: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#ec4899" : "#fbbf24",
              }}>
                {t.text}
              </span>
            ))}
          </div>
          <button className="bb-btn bb-btn--ghost bb-card-flip-back" onClick={onFlip}>
            ← BACK TO CARD
          </button>
        </div>
      </div>
    </div>
  );
};

window.RosterPage = RosterPage;
