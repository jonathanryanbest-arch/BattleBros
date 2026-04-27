// Fighter Profile page — large avatar, trait cloud as tags, add trait, contributions, weapon/venue cards, stats.

const ProfilePage = ({ fighter, onBack, onAddTrait, animLevel }) => {
  const [draft, setDraft] = React.useState("");
  const breathe = animLevel > 0.4;

  const totalFights = fighter.wins + fighter.losses;
  const sortedTraits = [...fighter.traits].sort((a, b) => b.weight - a.weight);

  const submit = (e) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    onAddTrait(fighter.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="bb-page bb-profile">
      <header className="bb-page-head">
        <button className="bb-btn bb-btn--ghost" onClick={onBack}>← ROSTER</button>
        <div className="bb-page-meta">
          <span className="bb-pill bb-pill--gold">PROFILE</span>
        </div>
      </header>

      <div className="bb-profile-hero">
        <div className="bb-profile-avatar">
          <div className={breathe ? "bb-breathe-wrap" : ""}>
            <Avatar fighter={fighter} size={340} animate={animLevel > 0.4} pose="fight" />
          </div>
          <div className="bb-profile-pedestal" />
        </div>

        <div className="bb-profile-meta">
          <div className="bb-eyebrow">{fighter.handle}</div>
          <h1 className="bb-fighter-name">{fighter.name}</h1>
          <div className="bb-profile-record">
            <div><b>{fighter.wins}</b><span>WINS</span></div>
            <div><b>{fighter.losses}</b><span>LOSSES</span></div>
            <div><b>{totalFights}</b><span>FIGHTS</span></div>
            <div><b>{fighter.traits.length}</b><span>TRAITS</span></div>
          </div>
          {fighter.bestTagline && (
            <div className="bb-tagline">
              <span className="bb-tagline-lbl">BEST TAGLINE</span>
              <q>{fighter.bestTagline}</q>
            </div>
          )}
        </div>
      </div>

      <div className="bb-profile-grid">
        <section className="bb-panel">
          <div className="bb-panel-head">
            <h2>TRAIT CLOUD</h2>
            <span className="bb-panel-meta">{fighter.traits.length} traits · weighted by upvotes</span>
          </div>
          <div className="bb-trait-cloud bb-trait-cloud--lg">
            {sortedTraits.map((t, i) => (
              <span key={i} className="bb-trait-tag" style={{
                fontSize: `${12 + t.weight * 1.6}px`,
                opacity: 0.5 + t.weight / 22,
                color: i % 4 === 0 ? "#3b82f6" : i % 4 === 1 ? "#ec4899" : i % 4 === 2 ? "#fbbf24" : "#22d3ee",
              }}>
                {t.text}
              </span>
            ))}
          </div>

          <form onSubmit={submit} className="bb-add-trait">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              className="bb-input"
              placeholder={`add a trait for ${fighter.name.toLowerCase()}…`}
              maxLength={80}
            />
            <button type="submit" className="bb-btn bb-btn--primary" disabled={!draft.trim()}>
              SUBMIT TRAIT
            </button>
          </form>
        </section>

        <section className="bb-panel">
          <div className="bb-panel-head">
            <h2>CONTRIBUTIONS</h2>
            <span className="bb-panel-meta">who said what</span>
          </div>
          <ul className="bb-contrib-list">
            {sortedTraits.slice(0, 7).map((t, i) => (
              <li key={i}>
                <div className="bb-contrib-text">"{t.text}"</div>
                <div className="bb-contrib-meta">
                  <span className="bb-contrib-by">@{t.by}</span>
                  <span className="bb-contrib-up">▲ {t.up}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {fighter.weapon && (
          <section className="bb-panel bb-panel--card">
            <div className="bb-panel-head">
              <h2>SIGNATURE WEAPON</h2>
              <span className="bb-pill bb-pill--small">RANK A</span>
            </div>
            <div className="bb-card-display">
              <WeaponArt weapon={window.BB_DATA.WEAPONS.find(w => w.id === fighter.weapon)} w={260} h={170} />
              <div className="bb-card-display-meta">
                <h3>{window.BB_DATA.WEAPONS.find(w => w.id === fighter.weapon)?.name}</h3>
                <p>{window.BB_DATA.WEAPONS.find(w => w.id === fighter.weapon)?.blurb}</p>
                <div className="bb-mod-row">
                  {window.BB_DATA.WEAPONS.find(w => w.id === fighter.weapon)?.mods.map((m, i) => (
                    <span key={i} className={`bb-mod ${m.startsWith('+') ? 'bb-mod--pos' : 'bb-mod--neg'}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {fighter.venue && (
          <section className="bb-panel bb-panel--card">
            <div className="bb-panel-head">
              <h2>HOME VENUE</h2>
              <span className="bb-pill bb-pill--small">+15% EDGE</span>
            </div>
            <div className="bb-card-display">
              <VenueArt venue={window.BB_DATA.VENUES.find(v => v.id === fighter.venue)} w={260} h={170} />
              <div className="bb-card-display-meta">
                <h3>{window.BB_DATA.VENUES.find(v => v.id === fighter.venue)?.name}</h3>
                <p>{window.BB_DATA.VENUES.find(v => v.id === fighter.venue)?.blurb}</p>
                <div className="bb-mod-row">
                  {window.BB_DATA.VENUES.find(v => v.id === fighter.venue)?.mods.map((m, i) => (
                    <span key={i} className={`bb-mod ${m.startsWith('+') ? 'bb-mod--pos' : 'bb-mod--neg'}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

window.ProfilePage = ProfilePage;
