import { useEffect, useState } from "react";
import { CLOSE_3, DECIDE_STEPS, TOWER_OPTIONS } from "../config/case";
import { clueByMission } from "../config/gameConfig";
import { Hud } from "../components/ui";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";

type Phase = "look" | "number" | "close";

export function Mission3() {
  const session = useSession();
  const older = session.persisted.level === "detectives";
  const done = session.persisted.missions[3] === "completed" || session.persisted.missions[3] === "skipped";
  const [phase, setPhase] = useState<Phase>(done ? "close" : "look");
  const [picked, setPicked] = useState<string | null>(null);
  const [hinted, setHinted] = useState(false);
  const number = clueByMission(3).number;
  const choice = TOWER_OPTIONS.find((item) => item.id === picked);
  const say = phase === "number"
    ? `El tercer número es ${number}. Yo lo recuerdo.`
    : phase === "close"
      ? CLOSE_3
      : hinted
        ? "Pedir ayuda, probar de otro modo o descansar y volver pueden servir."
        : choice
          ? `${choice.title} puede servir. También había otras formas.`
          : "La torre sigue en el suelo. ¿Qué puede hacer ahora? No hay una sola respuesta.";
  const pose: RobotPose = phase === "number" ? "descubrimiento" : picked ? "acompañando" : "pensando";

  useEffect(() => {
    if (phase === "number") session.finishMission(3);
  }, [phase]);

  const hint = () => setHinted(true);

  return (
    <section className={`play story-play guide-play${phase !== "look" ? " is-talk" : ""}`}>
      <Hud title="Mirar y decidir" onHint={phase === "look" ? hint : undefined} />
      <div className="story-layout">
        <Robot
          pose={pose}
          say={say}
          bubble={phase === "number" || phase === "close"}
          fresh={phase === "number" ? number : undefined}
          onTap={phase === "number" ? () => setPhase("close") : phase === "close" ? () => session.setScreen("P06") : phase === "look" && picked ? () => setPhase("number") : undefined}
        />
        {phase === "look" ? (
          <div className="dossier">
            {older && (
              <ol className="steps">
                {DECIDE_STEPS.map((step, index) => (
                  <li key={step.title}>
                    <img src={step.image} alt="" />
                    <b>{index + 1}. {step.title}</b>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="riddle">¿Qué puede hacer ahora con la torre?</p>
            <div className="visual-choices">
              {TOWER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={picked === option.id ? "vchoice on" : "vchoice"}
                  onClick={() => {
                    setPicked(option.id);
                    setHinted(false);
                    blip(session.persisted.sounds);
                  }}
                >
                  <img src={option.image} alt="" />
                  <span>{option.title}</span>
                  {older && <small>{option.text}</small>}
                </button>
              ))}
            </div>
            {picked && <p>{choice?.text} No es la única manera.</p>}
            <button type="button" className="advance-arrow" aria-label="Seguir" disabled={!picked} onClick={() => setPhase("number")}>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10 L34 24 L16 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        ) : phase === "number" ? (
          <div className="dossier calm-note">
            <p className="found-number">{number}</p>
            <button type="button" className="advance-arrow" aria-label="Seguir" onClick={() => setPhase("close")}>
              <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10 L34 24 L16 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        ) : (
          <div className="dossier calm-note">
            <button type="button" className="btn map-return" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
          </div>
        )}
      </div>
    </section>
  );
}
