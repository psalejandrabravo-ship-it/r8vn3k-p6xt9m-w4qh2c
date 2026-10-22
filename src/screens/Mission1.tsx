import { useEffect, useRef, useState } from "react";
import { CLOSE_1, QUESTIONS, STORY, STORY_INTRO, STORY_TITLE } from "../config/case";
import { clueByMission } from "../config/gameConfig";
import { Hud } from "../components/ui";
import { Robot, type RobotPose } from "../components/Robot";
import { blip } from "../lib/sound";
import { speak } from "../lib/speech";
import { useSession } from "../state/sessionStore";

type Phase = "story" | "questions" | "number" | "close";

export function Mission1() {
  const session = useSession();
  const done = session.persisted.missions[1] === "completed" || session.persisted.missions[1] === "skipped";
  const questions = QUESTIONS[session.persisted.level];
  const [phase, setPhase] = useState<Phase>(done ? "close" : "story");
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);
  const pending = useRef<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [note, setNote] = useState(STORY_INTRO);
  const number = clueByMission(1).number;
  const question = questions[qIndex];
  const pose: RobotPose = phase === "number" ? "descubrimiento" : phase === "questions" && note !== question?.prompt ? "acompañando" : phase === "story" && page === 0 ? "saludando" : "neutral";
  const say = phase === "story" ? STORY_INTRO : phase === "questions" ? note : phase === "number" ? `El primer número es ${number}. Yo lo recuerdo.` : CLOSE_1;

  useEffect(() => {
    if (phase === "number") session.finishMission(1);
  }, [phase]);

  const goPage = (next: number) => {
    if (turning || next < 0 || next >= STORY.length || next === page) return;
    if (session.persisted.reducedMotion) {
      setPage(next);
      blip(session.persisted.sounds);
      return;
    }
    pending.current = next;
    setTurning(next > page ? "next" : "prev");
  };
  const finishTurn = () => {
    if (pending.current == null) return;
    setPage(pending.current);
    pending.current = null;
    setTurning(null);
    blip(session.persisted.sounds);
  };

  const repeat = () => speak(say, session.persisted.narration);
  const hint = () => {
    if (phase !== "questions") return;
    setNote(question.hint);
  };

  return (
    <section className="play story-play">
      <Hud title={STORY_TITLE} onRepeat={repeat} onHint={phase === "questions" ? hint : undefined} />
      <div className="story-layout">
        <Robot pose={pose} say={say} bubble={phase === "number" || phase === "close"} fresh={phase === "number" ? number : undefined} />
        <div className={`storybook${turning ? ` turn-${turning}` : ""}`}>
          {phase === "story" && (
            <>
              <div className="open-book">
                <div className="paper left" />
                <div className="paper right" />
                <div className="gutter" />
                <p className="story-line">{STORY[page].text}</p>
                <img className="popout" src={STORY[page].image} alt="" />
                <span className="page-count">{page + 1} / {STORY.length}</span>
                <div className="leaf next" onAnimationEnd={finishTurn} />
                <div className="leaf prev" onAnimationEnd={finishTurn} />
                <button type="button" className="page-hit left" aria-label="Página anterior" disabled={page === 0 || !!turning} onClick={() => goPage(page - 1)} />
                <button
                  type="button"
                  className="page-hit right"
                  aria-label={page < STORY.length - 1 ? "Pasar la página" : "Responder"}
                  disabled={!!turning}
                  onClick={() => {
                    if (page < STORY.length - 1) goPage(page + 1);
                    else { setPhase("questions"); setNote(questions[0].prompt); }
                  }}
                />
              </div>
              {page === STORY.length - 1 && (
                <button type="button" className="btn story-next" onClick={() => { setPhase("questions"); setNote(questions[0].prompt); }}>Responder</button>
              )}
            </>
          )}
          {phase !== "story" && (
            <div className="book">
              {phase === "questions" && question && (
                <div className="book-page ask">
                  <img src={question.image} alt="" />
                  <div>
                    <p>{question.prompt}</p>
                    <div className="visual-choices">
                      {question.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="choice"
                          onClick={() => {
                            if (!option.ok) {
                              setNote(question.miss);
                              blip(session.persisted.sounds);
                              return;
                            }
                            blip(session.persisted.sounds);
                            if (qIndex + 1 < questions.length) {
                              const next = questions[qIndex + 1];
                              setQIndex(qIndex + 1);
                              setNote(next.prompt);
                            } else {
                              setPhase("number");
                            }
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {phase === "number" && (
                <div className="book-page ask">
                  <p className="riddle">El número {number} queda en la burbuja del robot.</p>
                  <button type="button" className="btn" onClick={() => setPhase("close")}>Seguir</button>
                </div>
              )}
              {phase === "close" && (
                <div className="book-page ask">
                  <p className="riddle">{CLOSE_1}</p>
                  <button type="button" className="btn" onClick={() => session.setScreen("P06")}>Volver al mapa</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
