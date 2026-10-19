import { CALMA } from "../config/gameConfig";
import { CalmLearn } from "../components/CalmLearn";
import { Companion, Hud, LetterBoard } from "../components/ui";
import { blip } from "../lib/sound";
import { placeTile } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission1() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots, riddleSolved, doorOpen } = session.persisted.activity.m1;
  const done = session.persisted.missions[1] === "completed" || session.persisted.missions[1] === "skipped";
  const learned = riddleSolved || doorOpen || done;
  const solved = () => {
    session.setFeedback("");
    session.solveRiddle();
    blip(session.persisted.sounds);
  };
  const leave = () => {
    session.finishMission(1);
    session.setScreen("P06");
    session.setFeedback("El 4 acompaña a tu detective.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play with-scene">
      <img className="scene-art" src="/assets/illustrations/scenes/sala.jpg" alt="" />
      <Hud title="Sala de las cartas" />
      <div className="play-layout">
        <Companion pose={learned ? "happy" : "idle"} />
        {learned ? (
          <CalmLearn step={1} number={4} revealed={done} onContinue={leave} />
        ) : (
          <div className="dossier">
            {explorers ? (
              <>
                <p className="riddle">La siento al respirar,{"\n"}la siento al descansar.{"\n"}Me puedo enojar y frustrar,{"\n"}y luego la voy a buscar.</p>
                <div className="visual-choices">
                  <button type="button" className="vchoice" onClick={() => session.setFeedback("Los juguetes pueden acompañar, pero no son la palabra. Puedes elegir otra.")}>
                    <img src="/assets/illustrations/cards/juguetes.jpg" alt="" />
                    <span>Juguetes</span>
                  </button>
                  <button type="button" className="vchoice" onClick={solved}>
                    <img src="/assets/illustrations/cards/calma.jpg" alt="" />
                    <span>Calma</span>
                  </button>
                  <button type="button" className="vchoice" onClick={() => session.setFeedback("Los dulces son ricos, pero no son la palabra. Escucha otra vez y elige de nuevo.")}>
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
                      session.setFeedback("La palabra está llena. Toca una letra para cambiarla.");
                      return;
                    }
                    const next = placeTile(pool, slots, id);
                    if (!next) return;
                    session.placeM1(id);
                    blip(session.persisted.sounds);
                    const word = next.slots.map((slot) => slot?.char ?? "").join("");
                    if (!next.slots.every(Boolean)) return;
                    if (word === CALMA) solved();
                    else session.setFeedback("Todavía no es esa palabra. Empieza con C y rima con alma. Tu turno sigue igual.");
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
