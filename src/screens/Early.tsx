import { useEffect, useRef, useState } from "react";
import { COVER, SUBTITLE, TITLE, statusLabel } from "../config/gameConfig";
import { MAP_AFTER_1, MAP_INTRO } from "../config/case";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";
import type { MissionId } from "../config/gameConfig";

const VIDEO = "https://videos.mirarim.com/Videos%20en%20juegos/Introduccion%20maletin%20secreto.mp4";

const PINS: { id: MissionId; label: string; x: number; y: number }[] = [
  { id: 1, label: "Misión 1", x: 34, y: 30 },
  { id: 2, label: "Misión 2", x: 66, y: 32 },
  { id: 3, label: "Misión 3", x: 36, y: 66 },
];
const CASE = { x: 50, y: 48 };

function unlocked(id: MissionId | "case", missions: Record<MissionId, string>) {
  const done = (mission: MissionId) => missions[mission] === "completed" || missions[mission] === "skipped";
  if (id === 1) return true;
  if (id === 2) return done(1);
  if (id === 3) return done(2);
  return done(3);
}

function mapSpeech(missions: Record<MissionId, string>) {
  const done = (id: MissionId) => missions[id] === "completed" || missions[id] === "skipped";
  if (done(3)) return "Los tres números están listos. El maletín puede abrirse.";
  if (done(2)) return "Ya van dos números. Ahora podemos mirar y decidir.";
  if (done(1)) return MAP_AFTER_1;
  return MAP_INTRO;
}

export function CoverSetup() {
  const session = useSession();
  const [askAge, setAskAge] = useState(false);
  const play = () => {
    if (!session.persisted.levelSet) {
      setAskAge(true);
      return;
    }
    session.beginPlay();
  };
  const choose = (level: "exploradores" | "detectives") => {
    session.setLevel(level);
    session.beginPlay();
  };
  return (
    <section className="cover">
      <img className="cover-blur" src={COVER} alt="" />
      <div className="cover-frame">
        <img className="cover-art" src={COVER} alt="Seis agentes y un robot investigan juntos en una mesa" />
        <img className="brand-logo" src="/assets/brand/84070.png" alt="MIRARIM" />
        <div className="cover-copy">
          <div className="cover-titles">
            <h1>{TITLE}</h1>
            <p className="sub">{SUBTITLE}</p>
          </div>
          <div className="row cover-actions">
            <button type="button" className="btn secondary" onClick={() => session.openDialog("config")}>Configuración</button>
            <button type="button" className="btn" onClick={play}>Jugar</button>
          </div>
        </div>
        {askAge && (
          <div className="age-gate" role="dialog" aria-label="Grupo de edad">
            <p>Elige el grupo. Las actividades cambian según la edad.</p>
            <button type="button" className="btn" onClick={() => choose("exploradores")}>Exploradores, 4 a 5 años</button>
            <button type="button" className="btn secondary" onClick={() => choose("detectives")}>Detectives, 6 a 8 años</button>
          </div>
        )}
      </div>
    </section>
  );
}

export function IntroVideo() {
  const session = useSession();
  const gone = useRef(false);
  const [failed, setFailed] = useState(false);
  const toMap = () => {
    if (gone.current) return;
    gone.current = true;
    session.setScreen("P06");
  };
  return (
    <section className="intro">
      {!failed && (
        <video
          className="intro-video"
          src={VIDEO}
          controls
          playsInline
          autoPlay
          onEnded={toMap}
          onError={() => setFailed(true)}
        />
      )}
      {failed && <p className="intro-card">El video no cargó. Puedes seguir al mapa.</p>}
      <button type="button" className="skip-video" onClick={toMap}>Saltar video</button>
    </section>
  );
}

export function MapScreen() {
  const session = useSession();
  const { missions, activity } = session.persisted;
  const [line] = useState(() => mapSpeech(missions));
  const [showNumbers, setShowNumbers] = useState(false);
  const next = ([1, 2, 3] as MissionId[]).find((id) => unlocked(id, missions) && missions[id] !== "completed" && missions[id] !== "skipped");
  const pose: RobotPose = unlocked("case", missions) ? "descubrimiento" : "señalando";
  useEffect(() => {
    if (activity.tutorial.hinted) return;
    session.patch({
      activity: {
        ...session.persisted.activity,
        tutorial: { ...session.persisted.activity.tutorial, hinted: true },
      },
    });
  }, []);
  const openMission = (id: MissionId) => {
    if (!unlocked(id, missions)) return;
    if (missions[id] === "pending") session.markExploring(id);
    session.setScreen(id === 1 ? "P07" : id === 2 ? "P12" : "P18");
    blip(session.persisted.sounds);
  };
  return (
    <section className="world">
      <img className="cover-blur" src="/assets/map/tablero.jpg" alt="" />
      <div className="board">
        <img src="/assets/map/tablero.jpg" alt="Tablero de corcho" />
        <h2 className="map-title">Mapa de misiones</h2>
        <svg className="strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {(missions[1] === "completed" || missions[1] === "skipped") && <path d="M34 30 Q 50 22 66 32" />}
          {(missions[2] === "completed" || missions[2] === "skipped") && <path d="M66 32 Q 72 50 36 66" />}
          {(missions[3] === "completed" || missions[3] === "skipped") && <path d="M36 66 Q 44 56 50 48" />}
        </svg>
        {PINS.map((pin) => {
          const open = unlocked(pin.id, missions);
          return (
            <button
              key={pin.id}
              type="button"
              className={`pin mark pop status-${missions[pin.id]}${next === pin.id ? " is-next" : ""}${open ? "" : " is-locked"}`}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              disabled={!open}
              aria-label={`${pin.label}. ${open ? statusLabel(missions[pin.id]) : "Todavía no"}`}
              onClick={() => openMission(pin.id)}
            >
              <span className="ring" aria-hidden="true" />
              <b className="stamp">{pin.label}</b>
            </button>
          );
        })}
        <button
          type="button"
          className={`pin mark case pop${unlocked("case", missions) ? " ready" : " is-locked"}`}
          style={{ left: `${CASE.x}%`, top: `${CASE.y}%` }}
          disabled={!unlocked("case", missions)}
          aria-label={unlocked("case", missions) ? "Abrir el maletín" : "El maletín espera los tres números"}
          onClick={() => session.setScreen("P23")}
        >
          <span className="ring" aria-hidden="true" />
          <b className="stamp">Maletín</b>
        </button>
        <div className="map-robot">
          <Robot pose={pose} say={line} bubble={showNumbers} />
          <button type="button" className="text-arrow numbers-toggle" onClick={() => setShowNumbers((value) => !value)}>
            {showNumbers ? "Ocultar números" : "Ver números"}
          </button>
        </div>
      </div>
      <button type="button" className="btn secondary map-config" onClick={() => session.openDialog("config")}>Configuración</button>
    </section>
  );
}
