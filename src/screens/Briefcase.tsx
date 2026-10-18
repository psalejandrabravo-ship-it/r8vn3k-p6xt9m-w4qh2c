import { useState } from "react";
import { CLUES, CODE, CODE_ICONS, TOOLS } from "../config/gameConfig";
import { ClueIcon } from "../components/Icons";
import { CluePips, CodeToken, HelpBar, TopBar } from "../components/ui";
import { blip } from "../lib/sound";
import { useSession } from "../state/sessionStore";

export function Briefcase() {
  const screen = useSession().persisted.screen;
  if (screen === "P24") return <Code />;
  if (screen === "P25") return <OpenCase />;
  if (screen === "P26") return <Explore />;
  if (screen === "P27") return <Choose />;
  return <Review />;
}

function Review() {
  const session = useSession();
  const missing = CLUES.filter((clue) => !session.persisted.cluesFound[clue.id]);
  return (
    <section className="stack">
      <TopBar title="El maletín" />
      <CluePips />
      {missing.length > 0 ? (
        <p className="lead">Falta {missing.map((clue) => clue.name).join(", ")}. Puedes volver al mapa. Nada de lo encontrado se pierde.</p>
      ) : (
        <p className="lead">Las tres pistas están aquí. El código es 4, 7 y 2, en ese orden.</p>
      )}
      <div className="row">
        <button type="button" className="btn quiet" onClick={() => session.setScreen("P06")}>Mapa</button>
        <button type="button" className="btn" onClick={() => session.setScreen("P24")}>Formar el código</button>
      </div>
    </section>
  );
}

function Code() {
  const session = useSession();
  const [mode, setMode] = useState<"iconos" | "numeros">("iconos");
  const slots = session.persisted.activity.code.slots;
  const found = CLUES.filter((clue) => session.persisted.cluesFound[clue.id]);
  const target = mode === "iconos" ? CODE_ICONS : CODE;
  const ready = slots.every((slot, index) => slot === target[index]);
  return (
    <section className="stack">
      <TopBar title="Formar 4 – 7 – 2" />
      <div className="row">
        <button type="button" className={mode === "iconos" ? "btn on" : "btn quiet"} onClick={() => { setMode("iconos"); session.clearCode(); }}>Usar pistas</button>
        <button type="button" className={mode === "numeros" ? "btn on" : "btn quiet"} onClick={() => { setMode("numeros"); session.clearCode(); }}>Usar números</button>
      </div>
      <div className="slots">
        {slots.map((token, index) => (
          <button key={index} type="button" className="letter wide" onClick={() => session.returnCode(index)}>
            {token ? <CodeToken token={token} /> : index + 1}
          </button>
        ))}
      </div>
      <div className="tray">
        {mode === "iconos"
          ? found.map((clue) => (
            <button key={clue.id} type="button" className="choice" onClick={() => session.placeCode(clue.id)}>
              <ClueIcon id={clue.id} /> {clue.name}
            </button>
          ))
          : found.map((clue) => (
            <button key={clue.id} type="button" className="letter" onClick={() => session.placeCode(String(clue.number))}>{clue.number}</button>
          ))}
      </div>
      {found.length < 3 && <p>Una pista está en otro lugar. La libreta muestra cuáles ya tenemos.</p>}
      <HelpBar
        onJuntos={() => {
          const placed = session.assistCode(mode);
          session.setFeedback(placed ? "Colocamos la siguiente pista del código." : "Esa pieza no está en la libreta. Podemos mirarla juntas.");
          if (!placed) session.openDialog("notebook");
        }}
        onPartes={() => {
          const placed = session.assistCode(mode);
          session.setFeedback(placed ? "Un espacio del código quedó listo." : "Falta una pista en la libreta. No inventamos el número.");
          if (!placed) session.openDialog("notebook");
        }}
      />
      <div className="row">
        <button type="button" className="btn quiet" onClick={() => session.clearCode()}>Vaciar</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!ready) {
              session.setFeedback("El código todavía no es 4, 7, 2. Puedes vaciarlo y probar de nuevo.");
              return;
            }
            blip(session.persisted.sounds);
            session.setScreen("P25");
          }}
        >
          Abrir maletín
        </button>
      </div>
    </section>
  );
}

function OpenCase() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="El secreto" />
      <p className="lead">Dentro no hay un premio para ganar. Hay cuatro herramientas para los momentos en que algo cuesta.</p>
      <ul className="tools">
        {TOOLS.map((tool) => <li key={tool.id}>{tool.name}</li>)}
      </ul>
      <button type="button" className="btn" onClick={() => session.setScreen("P26")}>Explorar herramientas</button>
    </section>
  );
}

function Explore() {
  const session = useSession();
  const [open, setOpen] = useState<string | null>(null);
  const tool = TOOLS.find((item) => item.id === open);
  return (
    <section className="stack">
      <TopBar title="Herramientas" />
      <div className="tool-grid">
        {TOOLS.map((item) => {
          const seen = session.persisted.activity.toolsSeen.includes(item.id);
          return (
            <button key={item.id} type="button" className={seen ? "tool on" : "tool"} onClick={() => { session.seeTool(item.id); setOpen(item.id); blip(session.persisted.sounds); }}>
              {item.name}
            </button>
          );
        })}
      </div>
      {tool && <p className="lead">{tool.text}</p>}
      <button type="button" className="btn" onClick={() => session.setScreen("P27")}>Elegir una, si quiero</button>
    </section>
  );
}

function Choose() {
  const session = useSession();
  return (
    <section className="stack">
      <TopBar title="Si quieres llevarte una" />
      <p className="lead">Puedes elegir una herramienta o seguir sin elegir. Esta elección se queda en esta visita.</p>
      {TOOLS.map((tool) => (
        <button key={tool.id} type="button" className="choice" onClick={() => { session.chooseTool(tool.id); session.setScreen("P28"); }}>
          {tool.name}
        </button>
      ))}
      <button type="button" className="btn quiet" onClick={() => { session.skipToolChoice(); session.setScreen("P28"); }}>Seguir sin elegir</button>
    </section>
  );
}
