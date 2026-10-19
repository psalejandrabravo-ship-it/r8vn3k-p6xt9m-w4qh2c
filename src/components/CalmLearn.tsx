import { useState } from "react";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";

const CARDS = [
  { id: "agua", label: "Tomar agua", image: "/assets/illustrations/cards/agua.jpg" },
  { id: "respirar", label: "Respirar", image: "/assets/illustrations/cards/respirar.jpg" },
  { id: "llorar", label: "Llorar (desahogarse)", image: "/assets/illustrations/cards/llorar.jpg" },
  { id: "abrazo", label: "Pedir un abrazo", image: "/assets/illustrations/cards/abrazo.jpg" },
  { id: "ayuda", label: "Pedir ayuda", image: "/assets/illustrations/cards/ayuda.jpg" },
  { id: "contar", label: "Contar hasta 10", image: "/assets/illustrations/cards/contar.jpg" },
];

const NOTES = [
  "¡Bien hecho! Ya tienes tu primer número secreto para abrir el maletín, anótalo y sigue investigando.",
  "¡Bien hecho! Ya tienes otro número secreto, anótalo y sigue investigando.",
  "¡Bien hecho! Ya tienes el último número secreto, anótalo y sigue investigando.",
];

export function CalmLearn({
  step,
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
  const showNote = revealed || open.length > 0;
  return (
    <div className="learn-board">
      <p className="riddle">¿Qué puedo hacer para encontrar la calma?</p>
      <p className="fine">Todas pueden ayudar. No hay una sola respuesta.</p>
      <div className="flip-grid">
        {CARDS.map((card) => {
          const on = open.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              className={on ? "flip open" : "flip"}
              aria-pressed={on}
              aria-label={on ? card.label : "Alternativa oculta"}
              onClick={() => {
                setOpen((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));
                blip(session.persisted.sounds);
              }}
            >
              <span className="flip-inner">
                <span className="flip-front" aria-hidden="true">?</span>
                <span className="flip-back">
                  <img src={card.image} alt="" />
                  <span>{card.label}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {showNote && (
        <button type="button" className="clue-note" onClick={onContinue}>
          <strong>{number}</strong>
          <span>
            <b>{NOTES[step - 1]}</b>
            Seguir investigando
          </span>
        </button>
      )}
    </div>
  );
}
