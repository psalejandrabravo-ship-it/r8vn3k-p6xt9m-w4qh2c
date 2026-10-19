import { CALMA } from "../config/gameConfig";
import { Companion, Hud, LetterBoard } from "../components/ui";
import { blip } from "../lib/sound";
import { placeTile } from "../state/logic";
import { useSession } from "../state/sessionStore";

function CalmMark() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <circle cx="40" cy="28" r="16" fill="#f6e2a8" stroke="#2b2155" strokeWidth="2.5" />
      <path d="M32 28 h5 M43 28 h5" stroke="#2b2155" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 34 q6 4 12 0" fill="none" stroke="#e07a5f" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 48 q10 -8 20 0 t20 0 t16 -2" fill="none" stroke="#2b2155" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SweetMark() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <rect x="18" y="22" width="18" height="22" rx="4" fill="#e07a5f" stroke="#2b2155" strokeWidth="2.5" />
      <rect x="40" y="18" width="18" height="22" rx="4" fill="#e6b84c" stroke="#2b2155" strokeWidth="2.5" />
      <path d="M27 22 v22 M49 18 v22" stroke="#fffaf3" strokeWidth="2" />
    </svg>
  );
}

function HitMark() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <path d="M22 40 q8 -18 16 -8 l6 8" fill="#f4f1de" stroke="#2b2155" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M44 36 h22" stroke="#2b2155" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 28 l8 8 l-8 8" fill="none" stroke="#e07a5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Mission1() {
  const session = useSession();
  const explorers = session.persisted.level === "exploradores";
  const { pool, slots } = session.persisted.activity.m1;
  const found = () => {
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
        <Companion pose="idle" />
        <div className="dossier">
          {explorers ? (
            <>
              <p className="riddle">La siento al respirar,{"\n"}la siento al descansar.{"\n"}Si me enojo, voy a buscar{"\n"}esa palabra y no pegar.</p>
              <div className="visual-choices">
                <button type="button" className="vchoice" onClick={found}>
                  <CalmMark />
                  <span>Calma</span>
                </button>
                <button type="button" className="vchoice" onClick={() => session.setFeedback("Los dulces son ricos, pero no son la palabra. Escucha otra vez y elige de nuevo.")}>
                  <SweetMark />
                  <span>Dulces</span>
                </button>
                <button type="button" className="vchoice" onClick={() => session.setFeedback("Pegar no ayuda a seguir. Busca lo que sientes cuando respiras despacito.")}>
                  <HitMark />
                  <span>Pegar</span>
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
                  if (word === CALMA) found();
                  else session.setFeedback("Todavía no es esa palabra. Empieza con C y rima con alma. Tu turno sigue igual.");
                }}
                onRemove={(index) => session.returnM1(index)}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
