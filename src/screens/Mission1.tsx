import { CALMA } from "../config/gameConfig";
import { Companion, Hud, LetterBoard } from "../components/ui";
import { blip } from "../lib/sound";
import { placeTile } from "../state/logic";
import { useSession } from "../state/sessionStore";

export function Mission1() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots, doorOpen } = session.persisted.activity.m1;
  const learn = () => {
    session.solveRiddle();
    session.finishMission(1);
    session.setScreen("P06");
    session.setFeedback("Carta, 4 queda en el tablero.");
    blip(session.persisted.sounds);
  };
  return (
    <section className="play">
      <Hud title="Sala de las cartas" />
      <div className="play-layout">
        <Companion pose={doorOpen ? "happy" : "idle"} />
        <div className="dossier">
          {!doorOpen && (
            <>
              <p className="lead">La puerta espera una palabra. Forma CALMA. Las dos A valen igual.</p>
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
                  if (next.slots.every(Boolean) && word !== CALMA) {
                    session.setFeedback("Todavía no dice CALMA. Toca una letra para probar otra. Tu turno sigue igual.");
                  }
                }}
                onRemove={(index) => session.returnM1(index)}
              />
            </>
          )}
          {doorOpen && (
            <>
              <p className="lead">La puerta se abrió. Encontramos Carta, 4. Cuando algo cuesta, ¿qué ayuda?</p>
              {explorers ? (
                <>
                  <button type="button" className="choice" onClick={learn}>Parar y mirar</button>
                  <button type="button" className="choice" onClick={() => session.setFeedback("Golpear no cuida la pista. Puedes elegir otra forma.")}>Golpear la mesa</button>
                  <button type="button" className="choice" onClick={() => session.setFeedback("Empujar todo puede desordenar. Podemos mirar de otra forma.")}>Apartar todo de un empujón</button>
                </>
              ) : (
                <>
                  <button type="button" className="choice" onClick={learn}>Parar, notar y pensar</button>
                  <button type="button" className="choice" onClick={() => session.setFeedback("La prisa empuja a hacerlo ya. Esta puerta se abrió con calma.")}>Hacerlo con prisa</button>
                  <button type="button" className="choice" onClick={() => session.setFeedback("El ruido no abre la puerta. Busquemos otra opción.")}>Hacer ruido</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
