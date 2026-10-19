import { useEffect, useState } from "react";
import { AGENTS, COVER, ROBOT, SUBTITLE, TITLE, agentById, detectiveName, statusLabel } from "../config/gameConfig";
import { GearIcon } from "../components/Icons";
import { CarriedNumbers } from "../components/ui";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";
import type { MissionId } from "../config/gameConfig";

const PINS: { id: MissionId; title: string; label: string; x: string; y: string; ax: string; ay: string }[] = [
  { id: 1, title: "Sala de las cartas", label: "Misión 01", x: "30%", y: "48%", ax: "38%", ay: "70%" },
  { id: 2, title: "Puesto de escucha", label: "Misión 02", x: "68%", y: "44%", ax: "60%", ay: "68%" },
  { id: 3, title: "Archivo de las huellas", label: "Misión 03", x: "28%", y: "76%", ax: "38%", ay: "84%" },
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
          <div className="row cover-actions">
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
            <button type="button" className="btn secondary" onClick={() => session.openDialog("config")}>Configuración</button>
          </div>
        </div>
      </div>
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

function letterFor(missions: { 1: string; 2: string; 3: string }) {
  const done = (id: 1 | 2 | 3) => missions[id] === "completed" || missions[id] === "skipped";
  if (!done(1)) {
    return {
      label: "Carta de la primera misión",
      lines: [
        "Agente, dirígete a la primera misión.",
        "Descubre allí la palabra secreta.",
        "Esa pista te ayudará a descubrir el código secreto.",
      ],
    };
  }
  if (!done(2)) {
    return {
      label: "Carta de los números",
      lines: [
        "Agente, ya encontraste la palabra secreta.",
        "Ahora reúne los números de cada misión.",
        "Con esos números podrás abrir el maletín.",
      ],
    };
  }
  if (!done(3)) {
    return {
      label: "Carta de los números",
      lines: [
        "Agente, sigue reuniendo los números.",
        "Visita la siguiente misión.",
        "Cuando los tengas todos, podrás abrir el maletín.",
      ],
    };
  }
  return {
    label: "Carta del maletín",
    lines: [
      "Agente, ya reuniste los números.",
      "Llévalos hasta el maletín.",
      "Con ellos podrás abrir el código secreto.",
    ],
  };
}

export function MapScreen() {
  const session = useSession();
  const { mode, participants, selectedAgents, names, missions, reducedMotion, activity } = session.persisted;
  const tutorial = activity.tutorial ?? { hinted: false, opened: false, line: 0 };
  const needed = mode === "individual" ? 1 : participants;
  const chosen = selectedAgents.filter((id) => id > 0);
  const named = chosen.length >= needed && chosen.every((id) => {
    const index = selectedAgents.findIndex((agent) => agent === id);
    return (names[index] ?? "").trim().length > 0;
  });
  const [sealed, setSealed] = useState(named);
  const [recast, setRecast] = useState(false);
  const [spot, setSpot] = useState({ x: "18%", y: "86%" });
  const [walking, setWalking] = useState(false);
  const letterClosed = tutorial.line >= 1
    || missions[1] !== "pending"
    || missions[2] !== "pending"
    || missions[3] !== "pending";
  const visiblePins = PINS.filter((pin) => {
    if (pin.id === 1) return letterClosed;
    if (pin.id === 2) return missions[1] === "completed" || missions[1] === "skipped";
    return missions[2] === "completed" || missions[2] === "skipped";
  });
  const showCase = missions[3] === "completed" || missions[3] === "skipped";
  const nextPin = visiblePins.find((pin) => missions[pin.id] === "pending" || missions[pin.id] === "exploring");
  const showCast = (!sealed || recast) && !tutorial.opened;
  useEffect(() => {
    if (!named) setSealed(false);
  }, [named]);

  const travel = (next: { x: string; y: string }, after: () => void) => {
    if (walking) return;
    if (!sealed || !named) {
      session.setFeedback(chosen.length < needed ? "Primero elige a tu detective." : "Escribe el nombre antes de continuar.");
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
    travel({ x: pin.ax, y: pin.ay }, () => {
      if (missions[id] === "pending") session.markExploring(id);
      if (id === 2) session.prepareM2();
      session.setScreen(id === 1 ? "P07" : id === 2 ? "P12" : "P18");
    });
  };

  return (
    <section className="world">
      <img className="cover-blur" src="/assets/map/tablero.jpg" alt="" />
      <div className="board">
        <img src="/assets/map/tablero.jpg" alt="Tablero de corcho" />
        <h2 className="map-title">Mapa de misiones</h2>
        {(visiblePins.length > 0 || showCase) && (
          <svg className="strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {visiblePins.map((pin) => {
              const x = parseFloat(pin.x);
              const y = parseFloat(pin.y);
              return <path key={pin.id} d={`M78 24 Q ${(78 + x) / 2} ${(24 + y) / 2}, ${x} ${y}`} />;
            })}
            {showCase && <path d="M78 24 Q 76 50, 74 74" />}
          </svg>
        )}
        <button
          type="button"
          className={`secret-mail${letterClosed ? " parked" : " invite"}${tutorial.opened ? " open" : ""}${reducedMotion ? " still" : ""}`}
          style={letterClosed ? { left: "78%", top: "24%" } : { left: "50%", top: "52%" }}
          aria-label="Abrir el sobre"
          aria-hidden={tutorial.opened || undefined}
          onClick={() => {
            if (tutorial.opened) return;
            session.openTutorialLetter();
            blip(session.persisted.sounds);
          }}
        >
          <span className="mail-body">
            <span className="flap" />
            <span className="seal" />
          </span>
        </button>
        {visiblePins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            className={`pin mark pop status-${missions[pin.id]}${nextPin?.id === pin.id ? " is-next" : ""}${parseFloat(pin.x) > 50 ? " flip" : ""}`}
            style={{ left: pin.x, top: pin.y }}
            aria-label={`${pin.label}. ${missions[pin.id] === "completed" ? (pin.id === 1 ? "Carta 4" : pin.id === 2 ? "Radio 7" : "Huellas 2") : statusLabel(missions[pin.id])}`}
            onClick={() => openMission(pin.id)}
          >
            <span className="ring" aria-hidden="true" />
            <b className="stamp">{pin.label}</b>
          </button>
        ))}
        {showCase && (
          <button
            type="button"
            className="pin mark case ready pop"
            style={{ left: "74%", top: "74%" }}
            onClick={() => travel({ x: "66%", y: "84%" }, () => session.setScreen("P23"))}
          >
            <span className="ring" aria-hidden="true" />
            <b className="stamp">Maletín</b>
          </button>
        )}
        {sealed && !showCast && chosen.map((id, index) => {
          const person = agentById(id);
          if (!person) return null;
          const shift = (index - (chosen.length - 1) / 2) * 6;
          return (
            <button
              key={id}
              type="button"
              className={`${walking ? "walker is-walk" : "walker is-idle"}${chosen.length > 1 ? " crowded" : ""}`}
              style={{ left: `calc(${spot.x} + ${shift}%)`, top: spot.y, zIndex: 3 + index }}
              onClick={() => setRecast(true)}
              aria-label={`Detective ${detectiveName(names, selectedAgents, person.id)}. Toca para cambiar.`}
            >
              <CarriedNumbers />
              <img src={person.image} alt="" style={{ animationDelay: `${index * 0.18}s` }} />
              <span>{detectiveName(names, selectedAgents, person.id)}</span>
            </button>
          );
        })}
      </div>
      {tutorial.opened && (
        <div className="mission-letter" role="dialog" aria-label={letterFor(missions).label}>
          {letterFor(missions).lines.map((line) => <p key={line}>{line}</p>)}
          <button type="button" onClick={() => { session.closeTutorialLetter(); blip(session.persisted.sounds); }}>Cerrar el sobre</button>
        </div>
      )}
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
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (!named) {
                  session.setFeedback(chosen.length < needed ? "Primero elige a tu detective." : "Escribe el nombre antes de continuar.");
                  return;
                }
                setSealed(true);
                setRecast(false);
                blip(session.persisted.sounds);
              }}
            >
              Listo
            </button>
          </div>
          {mode === "grupal" && <p className="need-name">Cada detective necesita su nombre. El grupo camina junto.</p>}
          {!named && chosen.length > 0 && <p className="need-name">Escribe el nombre para poder seguir.</p>}
          <div className="cast-row">
            {AGENTS.map((item) => {
              const index = selectedAgents.findIndex((id) => id === item.id);
              const on = index >= 0;
              const label = on ? (names[index]?.trim() ?? "") : "";
              return (
                <button
                  key={item.id}
                  type="button"
                  className={on ? "portrait on" : "portrait"}
                  onClick={() => {
                    const removing = index >= 0;
                    session.pickAgent(item.id);
                    blip(session.persisted.sounds);
                    if (!removing && !label && !(names[session.activeSlot] ?? "").trim()) {
                      session.setFeedback("Escribe el nombre antes de continuar.");
                    }
                  }}
                >
                  <img src={item.image} alt={item.name} />
                  {label && <em>{label}</em>}
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
