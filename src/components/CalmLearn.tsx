import { useEffect, useState } from "react";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";

const CARDS = [
  { id: "agua", label: "Tomar agua", legend: "Un vaso de agua puede ayudar a bajar el ritmo.", image: "/assets/illustrations/cards/agua.jpg" },
  { id: "respirar", label: "Respirar", legend: "Respirar despacio ayuda a encontrar la calma.", image: "/assets/illustrations/cards/respirar.jpg" },
  { id: "llorar", label: "Llorar (desahogarse)", legend: "Llorar también puede aliviar lo que se siente.", image: "/assets/illustrations/cards/llorar.jpg" },
  { id: "abrazo", label: "Pedir un abrazo", legend: "Un abrazo de alguien de confianza puede acompañar.", image: "/assets/illustrations/cards/abrazo.jpg" },
  { id: "ayuda", label: "Pedir ayuda", legend: "Pedir ayuda es una forma de cuidarse.", image: "/assets/illustrations/cards/ayuda.jpg" },
  { id: "contar", label: "Contar hasta 10", legend: "Contar despacio da un momento para elegir qué hacer.", image: "/assets/illustrations/cards/contar.jpg" },
];

export function CalmLearn({
  number,
  revealed,
  onContinue,
}: {
  step: 1 | 2 | 3;
  number: number;
  revealed?: boolean;
  onContinue: () => void;
}) {
  const session = useSession();
  const [open, setOpen] = useState<string[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const card = CARDS.find((item) => item.id === focus);
  const seenAll = open.length >= CARDS.length;
  const showNote = revealed || open.length > 0;
  useEffect(() => {
    session.setFeedback("");
  }, []);
  return (
    <div className="learn-board">
      <p className="riddle">¿Qué puedo hacer para encontrar la calma?</p>
      <figure className="strategy-stage">
        {card ? (
          <>
            <img src={card.image} alt="" />
            <figcaption>
              <strong>{card.label}</strong>
              <span>{card.legend}</span>
            </figcaption>
          </>
        ) : (
          <p>Toca una carta. La forma de calmarse aparece aquí.</p>
        )}
      </figure>
      <div className="flip-grid" aria-label="Formas de encontrar la calma">
        {CARDS.map((item) => {
          const on = open.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={item.id === focus ? "strategy-pick on" : "strategy-pick"}
              aria-pressed={on}
              aria-label={on ? item.label : "Alternativa oculta"}
              onClick={() => {
                setFocus(item.id);
                setOpen((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
                blip(session.persisted.sounds);
              }}
            >
              {on ? <img src={item.image} alt="" /> : <span>?</span>}
            </button>
          );
        })}
      </div>
      {showNote && (
        <button
          type="button"
          className={seenAll || revealed ? "clue-note ready" : "clue-note"}
          onClick={onContinue}
          aria-label={`Aprieta el ${number} para avanzar`}
        >
          <strong>{number}</strong>
          <span>
            <b>{seenAll || revealed ? "Ya viste las formas. Aprieta el número para avanzar." : "Aprieta el número para avanzar."}</b>
          </span>
        </button>
      )}
    </div>
  );
}
