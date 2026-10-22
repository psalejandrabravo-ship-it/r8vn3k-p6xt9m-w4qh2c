import { useEffect, useState } from "react";
import { CALM_HINT, CALM_INTRO, CALM_NOTE, CLOSE_2 } from "../config/case";
import { CALMA, clueByMission } from "../config/gameConfig";
import { CalmLearn } from "../components/CalmLearn";
import { Hud, LetterBoard } from "../components/ui";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { speak } from "../lib/speech";
import { placeTile } from "../state/logic";
import { useSession } from "../state/sessionStore";

type Phase = "word" | "explain" | "ways" | "number" | "close";

export function Mission2() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots, riddleSolved, doorOpen } = session.persisted.activity.m1;
  const done = session.persisted.missions[2] === "completed" || session.persisted.missions[2] === "skipped";
  const learned = riddleSolved || doorOpen;
  const [phase, setPhase] = useState<Phase>(done ? "close" : learned ? "ways" : "word");
  const [note, setNote] = useState(CALM_INTRO);
  const number = clueByMission(2).number;
  const say = phase === "word" ? note : phase === "explain" ? CALM_NOTE : phase === "ways" ? "¿Qué puedo hacer para encontrar la calma?" : phase === "number" ? `El segundo número es ${number}. Yo lo recuerdo.` : CLOSE_2;
  const pose: RobotPose = phase === "number" ? "descubrimiento" : note !== CALM_INTRO && phase === "word" ? "acompañando" : "pensando";

  useEffect(() => {
    if (phase === "number") session.finishMission(2);
  }, [phase]);

  const solved = () => {
    session.solveRiddle();
    setPhase("explain");
    setNote(CALM_NOTE);
    blip(session.persisted.sounds);
  };
  const repeat = () => speak(say, session.persisted.narration);
  const hint = () => {
    if (phase === "word") setNote(CALM_HINT);
    if (phase === "ways") setNote("No hay una sola forma. Puedes mirar otra posibilidad.");
  };

  return (
    <section className="play story-play guide-play">
      <Hud title="Detenerse y buscar la calma" onRepeat={repeat} onHint={phase === "word" || phase === "ways" ? hint : undefined} />
      <div className="story-layout">
        <Robot pose={pose} say={say} bubble={phase === "number" || phase === "close"} fresh={phase === "number" ? number : undefined} />
        {phase === "ways" ? (
          <CalmLearn step={2} number={number} revealed={done} onContinue={() => setPhase("number")} />
        ) : phase === "explain" ? (
          <div className="dossier calm-note">
            <img src="/assets/illustrations/cards/calma.jpg" alt="" />
            <p className="riddle">{CALM_NOTE}</p>
            <button type="button" className="btn" onClick={() => setPhase("ways")}>Ver formas de calma</button>
          </div>
        ) : phase === "number" ? (
          <div className="dossier calm-note">
            <p className="riddle">El número {number} queda en la burbuja del robot.</p>
            <button type="button" className="btn" onClick={() => setPhase("close")}>Seguir</button>
          </div>
        ) : phase === "close" ? (
          <div className="dossier calm-note">
            <p className="riddle">{CLOSE_2}</p>
            <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
          </div>
        ) : (
          <div className="dossier">
            {explorers ? (
              <>
                <p className="riddle">La siento al respirar,{"\n"}la siento al descansar.{"\n"}Me puedo enojar y frustrar,{"\n"}y luego la voy a buscar.</p>
                <div className="visual-choices">
                  <button type="button" className="vchoice" onClick={() => setNote("Los juguetes pueden acompañar, pero no son la palabra. Puedes elegir otra.")}>
                    <img src="/assets/illustrations/cards/juguetes.jpg" alt="" />
                    <span>Juguetes</span>
                  </button>
                  <button type="button" className="vchoice" onClick={solved}>
                    <img src="/assets/illustrations/cards/calma.jpg" alt="" />
                    <span>Calma</span>
                  </button>
                  <button type="button" className="vchoice" onClick={() => setNote("Los dulces son ricos, pero no son la palabra. Escucha otra vez y elige de nuevo.")}>
                    <img src="/assets/illustrations/cards/dulces.jpg" alt="" />
                    <span>Dulces</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="riddle">Una palabra que me da paz,{"\n"}cinco letras y no más.{"\n"}Una emoción que rima con alma.{"\n"}Empieza con C y la palabra es…</p>
                <LetterBoard
                  pool={pool}
                  slots={slots}
                  onPlace={(id) => {
                    if (slots.every(Boolean)) {
                      setNote("La palabra está llena. Toca una letra para cambiarla.");
                      return;
                    }
                    const next = placeTile(pool, slots, id);
                    if (!next) return;
                    session.placeM1(id);
                    blip(session.persisted.sounds);
                    const word = next.slots.map((slot) => slot?.char ?? "").join("");
                    if (!next.slots.every(Boolean)) return;
                    if (word === CALMA) solved();
                    else setNote("Todavía no es esa palabra. Empieza con C y rima con alma.");
                  }}
                  onRemove={(index) => session.returnM1(index)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
