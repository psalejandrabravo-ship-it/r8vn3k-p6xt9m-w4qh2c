import { useEffect, useState } from "react";
import { PACIENCIA } from "../config/gameConfig";
import { Companion, Hud, LetterBoard } from "../components/ui";
import { blip } from "../lib/sound";
import { solvedTiles } from "../state/logic";
import { useSession } from "../state/sessionStore";

const STEPS = [
  { title: "Detenernos", text: "Paramos un momento, aunque el impulso empuje.", image: "/assets/illustrations/steps/detener.jpg" },
  { title: "Pensar", text: "Miramos qué pasa y qué opciones hay.", image: "/assets/illustrations/steps/pensar.jpg" },
  { title: "Decidir", text: "Elegimos un paso que nos cuide.", image: "/assets/illustrations/steps/decidir.jpg" },
  { title: "Actuar", text: "Hacemos ese paso, con paciencia.", image: "/assets/illustrations/steps/actuar.jpg" },
];

function SituationVideo() {
  const [src, setSrc] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let cancel = false;
    fetch("/assets/video/mision2.json")
      .then((response) => response.json())
      .then((data: { src?: string }) => {
        if (cancel) return;
        if (data.src) setSrc(data.src);
        else setMissing(true);
      })
      .catch(() => { if (!cancel) setMissing(true); });
    return () => { cancel = true; };
  }, []);
  return (
    <div className="mission-video">
      {src ? (
        <video src={src} controls playsInline preload="metadata" />
      ) : missing ? (
        <div className="video-slot">
          <p>Aquí irá el video de la situación: el impulso estorba y la paciencia ayuda.</p>
        </div>
      ) : null}
    </div>
  );
}

function ThinkFirst({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="learn-board">
      <p className="riddle">Pensar antes de actuar</p>
      <ol className="steps">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <img src={step.image} alt="" />
            <b>{index + 1}. {step.title}</b>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="clue-note ready" onClick={onContinue} aria-label="Aprieta el 7 para avanzar">
        <strong>7</strong>
        <span>
          <b>Aprieta el número para avanzar.</b>
        </span>
      </button>
    </div>
  );
}

export function Mission2() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots, opened } = session.persisted.activity.m2;
  const done = session.persisted.missions[2] === "completed" || session.persisted.missions[2] === "skipped";
  const target = explorers ? "PACIENCIA" : PACIENCIA;
  const ready = solvedTiles(slots, target) || opened || done;
  useEffect(() => {
    session.prepareM2();
  }, []);
  const leave = () => {
    session.finishMission(2);
    session.setScreen("P06");
    session.setFeedback("El 7 acompaña a tu detective.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play with-scene">
      <img className="scene-art" src="/assets/illustrations/scenes/sala.jpg" alt="" />
      <Hud title="Puesto de escucha" onPrevious={() => session.setScreen("P07")} />
      <div className="play-layout">
        <Companion pose={ready ? "happy" : "idle"} />
        {ready ? (
          <ThinkFirst onContinue={leave} />
        ) : (
          <div className="dossier">
            <SituationVideo />
            <p className="lead">
              {explorers
                ? "El impulso empuja a hacerlo ya. Elige la tarjeta que ayuda: PACIENCIA."
                : "La situación pide paciencia, no impulso. Forma PACIENCIA."}
            </p>
            <LetterBoard
              wide={explorers}
              pool={pool}
              slots={slots}
              onPlace={(id) => {
                if (slots.every(Boolean)) {
                  session.setFeedback("El panel está lleno. Toca lo que colocaste para devolverlo.");
                  return;
                }
                const tile = pool.find((item) => item.id === id);
                if (explorers && tile?.char === "IMPULSO") {
                  session.setFeedback("IMPULSO empuja a hacerlo ya. Prueba la otra tarjeta. Tu turno sigue igual.");
                  return;
                }
                session.placeM2(id);
                blip(session.persisted.sounds);
              }}
              onRemove={(index) => session.returnM2(index)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
