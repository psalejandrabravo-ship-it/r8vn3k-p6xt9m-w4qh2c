import { useEffect, useState } from "react";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";

const CARDS = [
  { id: "agua", label: "Tomar agua", legend: "Tomar un poco de agua puede ayudarte a hacer una pausa.", image: "/assets/illustrations/cards/agua.jpg" },
  { id: "respirar", label: "Respirar despacio", legend: "Respirar suave y despacio puede ayudar a bajar el ritmo.", image: "/assets/illustrations/cards/respirar.jpg" },
  { id: "llorar", label: "Llorar, si lo necesito", legend: "Si necesitas llorar, está bien. Puedes pedir compañía.", image: "/assets/illustrations/cards/llorar.jpg" },
  { id: "abrazo", label: "Pedir un abrazo", legend: "Si te gustan los abrazos, puedes pedir uno para sentirte acompañado.", image: "/assets/illustrations/cards/abrazo.jpg" },
  { id: "ayuda", label: "Pedir ayuda o compañía", legend: "Alguien de confianza puede acompañarte cuando lo necesitas.", image: "/assets/illustrations/cards/ayuda.jpg" },
  { id: "contar", label: "Contar hasta diez", legend: "Contar despacio puede darte un momento antes de actuar.", image: "/assets/illustrations/cards/contar.jpg" },
  { id: "distancia", label: "Tomar un poco de distancia", legend: "Apartarte un momento a un lugar seguro puede darte espacio.", image: "/assets/illustrations/cards/distancia.jpg" },
  { id: "estirarse", label: "Moverse o estirarse", legend: "Moverte o estirarte suavemente puede ayudar a soltar la tensión.", image: "/assets/illustrations/cards/estirarse.jpg" },
];

export function CalmLearn({
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
  const showNote = revealed || open.length >= 3;
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
        <button type="button" className="advance-arrow" aria-label="Seguir" onClick={onContinue}>
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M16 10 L34 24 L16 38" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      )}
    </div>
  );
}
