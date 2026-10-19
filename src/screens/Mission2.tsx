import { useEffect } from "react";
import { PACIENCIA } from "../config/gameConfig";
import { CalmLearn } from "../components/CalmLearn";
import { Companion, Hud, LetterBoard } from "../components/ui";
import { blip } from "../lib/sound";
import { solvedTiles } from "../state/logic";
import { useSession } from "../state/sessionStore";

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
    session.setFeedback("El número 7 queda en el tablero.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play with-scene">
      <img className="scene-art" src="/assets/illustrations/scenes/sala.jpg" alt="" />
      <Hud title="Puesto de escucha" onPrevious={() => session.setScreen("P07")} />
      <div className="play-layout">
        <Companion pose={ready ? "happy" : "idle"} />
        {ready ? (
          <CalmLearn step={2} number={7} revealed={done} onContinue={leave} />
        ) : (
          <div className="dossier">
            <p className="lead">
              {explorers
                ? "La radio mezcla dos caminos. Elige la tarjeta PACIENCIA."
                : "Forma PACIENCIA en el panel. Toca una letra colocada para devolverla."}
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
