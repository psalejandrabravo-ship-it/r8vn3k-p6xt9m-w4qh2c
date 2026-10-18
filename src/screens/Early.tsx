import { useState } from "react";
import { AGENTS, COVER, ROBOT, SUBTITLE, TITLE, agentById } from "../config/gameConfig";
import { CaseIcon } from "../components/Icons";
import { CluePips, TopBar } from "../components/ui";
import { blip } from "../lib/sound";
import { missionScreen } from "./nav";
import { useSession } from "../state/sessionStore";
import type { MissionId } from "../config/gameConfig";

export function CoverSetup() {
  const session = useSession();
  if (session.persisted.screen === "P02") return <Setup />;
  return (
    <section className="cover">
      <img className="cover-art" src={COVER} alt="Seis agentes y un robot investigan juntos en una mesa" />
      <div className="cover-panel">
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
          <button type="button" className="btn gold" onClick={() => session.openDialog("guide")}>Guía para acompañar</button>
        </div>
      </div>
    </section>
  );
}

function Setup() {
  const session = useSession();
  const { level, mode, participants, narration, sounds, reducedMotion } = session.persisted;
  return (
    <section className="stack">
      <TopBar title="Configuración" />
      <p className="lead">Este juego se explora con una persona adulta. Podemos ajustar los retos, pedir ayuda y terminar cuando lo necesitemos.</p>
      <div className="choice-row" role="group" aria-label="Nivel">
        <button type="button" className={level === "exploradores" ? "choice on" : "choice"} onClick={() => session.setLevel("exploradores")}>Exploradores, 4 a 5 años</button>
        <button type="button" className={level === "detectives" ? "choice on" : "choice"} onClick={() => session.setLevel("detectives")}>Detectives, 6 a 8 años</button>
      </div>
      <div className="choice-row" role="group" aria-label="Modo">
        <button type="button" className={mode === "individual" ? "choice on" : "choice"} onClick={() => session.setMode("individual")}>Individual</button>
        <button type="button" className={mode === "grupal" ? "choice on" : "choice"} onClick={() => session.setMode("grupal")}>Grupal</button>
      </div>
      {mode === "grupal" && (
        <div className="stepper">
          <button type="button" aria-label="Menos participantes" disabled={participants <= 2} onClick={() => session.setParticipants(participants - 1)}>−</button>
          <span>{participants} agentes</span>
          <button type="button" aria-label="Más participantes" disabled={participants >= 6} onClick={() => session.setParticipants(participants + 1)}>+</button>
        </div>
      )}
      <label className="check"><input type="checkbox" checked={narration} onChange={() => session.toggleFlag("narration")} /> Narración</label>
      <label className="check"><input type="checkbox" checked={sounds} onChange={() => session.toggleFlag("sounds")} /> Sonidos suaves</label>
      <label className="check"><input type="checkbox" checked={reducedMotion} onChange={() => session.toggleFlag("reducedMotion")} /> Movimiento reducido</label>
      <div className="row">
        <button type="button" className="btn quiet" onClick={() => session.setScreen("P01")}>Volver</button>
        <button type="button" className="btn" onClick={() => session.setScreen("P03")}>Elegir agentes</button>
      </div>
    </section>
  );
}

export function AgentsWelcome() {
  const screen = useSession().persisted.screen;
  if (screen === "P04") return <Welcome />;
  return <Agents />;
}

function Agents() {
  const session = useSession();
  const needed = session.persisted.mode === "individual" ? 1 : session.persisted.participants;
  const slots = Array.from({ length: needed }, (_, index) => session.persisted.selectedAgents[index] ?? 0);
  return (
    <section className="stack">
      <TopBar title={needed === 1 ? "Elige 1 agente" : `Elige ${needed} agentes`} />
      <div className="assign">
        {slots.map((id, index) => {
          const agent = agentById(id);
          return (
            <button key={index} type="button" className={session.activeSlot === index ? "slot on" : "slot"} onClick={() => session.setActiveSlot(index)}>
              <span>Participante {index + 1}</span>
              {agent ? <img src={agent.image} alt="" /> : <span className="empty">Toca un personaje</span>}
              {agent && <b>{agent.short}</b>}
            </button>
          );
        })}
      </div>
      <div className="roster">
        {AGENTS.map((agent) => {
          const taken = slots.includes(agent.id);
          return (
            <button key={agent.id} type="button" className={taken ? "agent-card on" : "agent-card"} onClick={() => session.assignAgent(agent.id)}>
              <img src={agent.image} alt="" />
              <strong>{agent.name}</strong>
              <small>{agent.desc}</small>
              <span className="mini-pips" aria-hidden="true"><i /><i /><i /></span>
            </button>
          );
        })}
      </div>
      <div className="row">
        <button type="button" className="btn quiet" onClick={() => session.setScreen("P02")}>Volver</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!session.confirmAgents()) session.setFeedback("Cada participante necesita un agente distinto.");
          }}
        >
          Entrar a la central
        </button>
      </div>
    </section>
  );
}

function Welcome() {
  const session = useSession();
  const [who, setWho] = useState<"none" | "robot" | "case">("none");
  return (
    <section className="stack center">
      <TopBar title="La central" />
      <div className="pair">
        <button type="button" className={who === "robot" ? "figure on" : "figure"} onClick={() => { setWho("robot"); blip(session.persisted.sounds); }}>
          <img src={ROBOT} alt="Robot de la central" />
          <span>Saludar al robot</span>
        </button>
        <button type="button" className={who === "case" ? "figure on" : "figure"} onClick={() => { setWho("case"); blip(session.persisted.sounds); }}>
          <CaseIcon className="case-icon" />
          <span>Mirar el maletín</span>
        </button>
      </div>
      {who === "robot" && <p className="lead">Este maletín guarda un secreto. Para descubrirlo investigaremos tres pistas. Si algo cuesta, podemos mirar otra vez, pedir ayuda o descansar.</p>}
      {who === "case" && (
        <div>
          <p className="lead">Hay tres espacios vacíos. Cada misión deja una pista.</p>
          <CluePips />
        </div>
      )}
      <button type="button" className="btn" onClick={() => session.setScreen("P05")}>Conocer mis herramientas</button>
    </section>
  );
}

export function TutorialMap() {
  return useSession().persisted.screen === "P06" ? <MapScreen /> : <Tutorial />;
}

function Tutorial() {
  const session = useSession();
  const tutorial = session.persisted.activity.tutorial;
  const lines = [
    "Aquí guardamos las pistas. No necesitas recordarlas todas.",
    "Ayuda juntos: pensar con quien acompaña. Abrimos la libreta.",
    "Por partes: mirar un solo paso. Una pausa: detenerse sin perder avances.",
  ];
  return (
    <section className="stack center">
      <TopBar title="Tutorial" />
      <button
        type="button"
        className={tutorial.opened ? "envelope open" : tutorial.hinted ? "envelope hot" : "envelope"}
        onClick={() => {
          if (!tutorial.hinted) {
            session.setFeedback("Primero toca Una pista. La solapa te mostrará por dónde seguir.");
            return;
          }
          session.openTutorialLetter();
          blip(session.persisted.sounds);
        }}
        aria-label="Carta cerrada"
      >
        <span className="flap" />
        <span className="seal" />
      </button>
      <p>{tutorial.opened ? "La carta se abrió. Esta será nuestra libreta." : "Carta cerrada sobre la mesa."}</p>
      {tutorial.opened && <p className="lead">{lines[Math.max(0, tutorial.line - 1)] ?? lines[0]}</p>}
      <div className="row">
        <button type="button" className="btn" onClick={() => session.hintTutorial()}>Una pista</button>
        {tutorial.opened && <button type="button" className="btn secondary" onClick={() => { session.revealTutorialLine(); session.openDialog("notebook"); }}>Ayuda juntos</button>}
        {tutorial.opened && <button type="button" className="btn quiet" onClick={() => session.revealTutorialLine()}>Por partes</button>}
      </div>
      <div className="row">
        <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Ver el mapa</button>
        <button type="button" className="btn gold" onClick={() => { session.openTutorialLetter(); session.setScreen("P06"); }}>Omitir tutorial</button>
      </div>
    </section>
  );
}

function MapScreen() {
  const session = useSession();
  const places: { id: MissionId; title: string; text: string }[] = [
    { id: 1, title: "Sala de las cartas", text: "Una puerta y una palabra." },
    { id: 2, title: "Puesto de escucha", text: "Una radio y dos caminos." },
    { id: 3, title: "Archivo de las huellas", text: "La historia de Alma." },
  ];
  return (
    <section className="stack">
      <TopBar title="Mapa de misiones">
        <button type="button" className="btn quiet" onClick={() => session.openDialog("pause")}>Una pausa</button>
      </TopBar>
      <div className="map-grid">
        {places.map((place) => (
          <button
            key={place.id}
            type="button"
            className={`place status-${session.persisted.missions[place.id]}`}
            onClick={() => {
              session.markExploring(place.id);
              if (place.id === 2) session.prepareM2();
              session.setScreen(missionScreen(place.id, {
                ...session.persisted,
                missions: {
                  ...session.persisted.missions,
                  [place.id]: session.persisted.missions[place.id] === "pending" ? "exploring" : session.persisted.missions[place.id],
                },
              }));
            }}
          >
            <span className={`thumb thumb-${place.id}`} />
            <strong>{place.id}. {place.title}</strong>
            <small>{place.text}</small>
            <em>{label(session.persisted.missions[place.id])}</em>
          </button>
        ))}
      </div>
      <button type="button" className="case-row" onClick={() => session.setScreen("P23")}>
        <CaseIcon />
        <span>Maletín</span>
        <CluePips />
      </button>
      <button type="button" className="btn gold" onClick={() => session.openDialog("end")}>Terminar por hoy</button>
    </section>
  );
}

function label(status: string): string {
  if (status === "exploring") return "En curso";
  if (status === "completed") return "Pista encontrada";
  if (status === "skipped") return "Con apoyo";
  return "Por explorar";
}
