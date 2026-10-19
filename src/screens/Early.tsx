import { useEffect, useState } from "react";
import { AGENTS, COVER, ROBOT, SUBTITLE, TITLE, agentById, detectiveName, statusLabel } from "../config/gameConfig";
import { GearIcon } from "../components/Icons";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";
import type { MissionId } from "../config/gameConfig";

const PINS: { id: MissionId; title: string; x: string; y: string; ax: string; ay: string }[] = [
  { id: 1, title: "Sala de las cartas", x: "20%", y: "34%", ax: "24%", ay: "58%" },
  { id: 2, title: "Puesto de escucha", x: "80%", y: "32%", ax: "74%", ay: "56%" },
  { id: 3, title: "Archivo de las huellas", x: "18%", y: "70%", ax: "26%", ay: "84%" },
];

export function CoverSetup() {
  const session = useSession();
  return (
    <section className="cover">
      <img className="cover-blur" src={COVER} alt="" />
      <div className="cover-frame">
        <img className="cover-art" src={COVER} alt="Seis agentes y un robot investigan juntos en una mesa" />
        <img className="brand-logo" src="/assets/brand/84070.png" alt="MIRARIM" />
        <div className="cover-copy">
          <h1>{TITLE}</h1>
          <p className="sub">{SUBTITLE}</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => session.startNew()}>Empezar</button>
            {session.hasSavedSession && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  if (!session.continueSaved()) session.setFeedback("No encontramos una sesión para continuar.");
                }}
              >
                Continuar sesión
              </button>
            )}
          </div>
        </div>
      </div>
      <button type="button" className="icon-btn gear" aria-label="Configuración" onClick={() => session.openDialog("config")}>
        <GearIcon />
      </button>
    </section>
  );
}

export function IntroVideo() {
  const session = useSession();
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let cancel = false;
    fetch("/assets/video/intro.json")
      .then((response) => response.json())
      .then((data: { src?: string }) => {
        if (cancel) return;
        if (data.src) setSrc(data.src);
        else setMissing(true);
      })
      .catch(() => { if (!cancel) setMissing(true); });
    return () => { cancel = true; };
  }, []);
  useEffect(() => {
    if (!missing) return;
    const delay = session.persisted.reducedMotion ? 900 : 4200;
    const id = window.setTimeout(() => session.setScreen("P06"), delay);
    return () => window.clearTimeout(id);
  }, [missing, session.persisted.reducedMotion]);
  return (
    <section className="intro" onClick={() => { if (missing || src) session.setScreen("P06"); }}>
      {src && (
        <video
          className="intro-video"
          src={src}
          autoPlay
          playsInline
          onEnded={() => session.setScreen("P06")}
          onError={() => setMissing(true)}
        />
      )}
      {missing && (
        <div className="intro-card">
          <img src={ROBOT} alt="" />
          <h1>La misión comienza</h1>
          <p>Un maletín guarda un secreto. Tres pistas lo abren. Si algo cuesta, podemos sentirlo y seguir.</p>
        </div>
      )}
    </section>
  );
}

export function MapScreen() {
  const session = useSession();
  const { mode, participants, selectedAgents, names, missions, cluesFound, reducedMotion } = session.persisted;
  const needed = mode === "individual" ? 1 : participants;
  const chosen = selectedAgents.filter((id) => id > 0);
  const castReady = chosen.length >= needed;
  const [recast, setRecast] = useState(false);
  const [spot, setSpot] = useState({ x: "50%", y: "68%" });
  const [walking, setWalking] = useState(false);
  const agentId = session.currentAgentId();
  const agent = agentId ? agentById(agentId) : undefined;
  const showCast = !castReady || recast;

  const travel = (next: { x: string; y: string }, after: () => void) => {
    if (walking) return;
    if (!castReady) {
      session.setFeedback("Primero elige a tu detective.");
      setRecast(true);
      return;
    }
    if (reducedMotion) {
      setSpot(next);
      after();
      return;
    }
    setWalking(true);
    setSpot(next);
    window.setTimeout(() => {
      setWalking(false);
      after();
    }, 900);
  };

  const openMission = (id: MissionId) => {
    const pin = PINS.find((item) => item.id === id);
    if (!pin) return;
    const status = missions[id];
    if (status === "completed" || status === "skipped") {
      const clue = id === 1 ? "Carta, 4" : id === 2 ? "Radio, 7" : "Huellas, 2";
      session.setFeedback(status === "completed" ? `${clue} ya está en el tablero.` : `${clue} llegó con apoyo.`);
      return;
    }
    travel({ x: pin.ax, y: pin.ay }, () => {
      session.markExploring(id);
      if (id === 2) session.prepareM2();
      session.setScreen(id === 1 ? "P07" : id === 2 ? "P12" : "P18");
    });
  };

  return (
    <section className="world">
      <img className="cover-blur" src="/assets/map/tablero.jpg" alt="" />
      <div className="board">
        <img src="/assets/map/tablero.jpg" alt="Tablero de corcho con un mapa del pueblo" />
        <svg className="strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 78 C 36 60, 28 48, 20 36" />
          <path d="M50 78 C 64 58, 72 46, 80 34" />
          <path d="M50 78 C 34 82, 24 78, 18 70" />
          <path d="M50 78 C 66 80, 74 74, 82 62" />
        </svg>
        {PINS.map((pin) => (
          <button
            key={pin.id}
            type="button"
            className={`pin status-${missions[pin.id]}`}
            style={{ left: pin.x, top: pin.y }}
            onClick={() => openMission(pin.id)}
          >
            <b>{pin.id}</b>
            <span>{pin.title}</span>
            <small>{missions[pin.id] === "completed" ? (pin.id === 1 ? "Carta 4" : pin.id === 2 ? "Radio 7" : "Huellas 2") : statusLabel(missions[pin.id])}</small>
          </button>
        ))}
        <button
          type="button"
          className={Object.keys(cluesFound).length === 3 ? "pin case ready" : "pin case"}
          style={{ left: "82%", top: "62%" }}
          onClick={() => travel({ x: "74%", y: "78%" }, () => session.setScreen("P23"))}
        >
          <b>{Object.keys(cluesFound).length}/3</b>
          <span>Maletín</span>
        </button>
        {agent && !showCast && (
          <button
            type="button"
            className={walking ? "walker is-walk" : "walker is-idle"}
            style={{ left: spot.x, top: spot.y }}
            onClick={() => setRecast(true)}
            aria-label={`Detective ${detectiveName(names, selectedAgents, agent.id)}. Toca para cambiar.`}
          >
            <img src={agent.image} alt="" />
            <span>{detectiveName(names, selectedAgents, agent.id)}</span>
          </button>
        )}
      </div>
      {showCast && (
        <div className="picker">
          <div className="name-slip">
            <label>
              Nombre del detective
              <input
                value={names[session.activeSlot] ?? ""}
                maxLength={24}
                placeholder="Escribe un nombre"
                onChange={(event) => session.setDetectiveName(session.activeSlot, event.target.value)}
              />
            </label>
            {castReady && <button type="button" className="btn" onClick={() => setRecast(false)}>Listo</button>}
          </div>
          <div className="cast-row">
            {AGENTS.map((item) => {
              const index = selectedAgents.findIndex((id) => id === item.id);
              const on = index >= 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={on ? "portrait on" : "portrait"}
                  onClick={() => {
                    session.pickAgent(item.id);
                    blip(session.persisted.sounds);
                  }}
                >
                  <img src={item.image} alt={item.name} />
                  {on && <em>{names[index]?.trim() || String(index + 1)}</em>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button type="button" className="icon-btn gear" aria-label="Configuración" onClick={() => session.openDialog("config")}>
        <GearIcon />
      </button>
    </section>
  );
}
