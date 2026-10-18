import { useEffect } from "react";
import { Feedback, FullscreenButton, Orientation } from "./components/ui";
import { LINES } from "./config/gameConfig";
import { hush, speak } from "./lib/speech";
import { AgentsWelcome, CoverSetup, TutorialMap } from "./screens/Early";
import { Mission1 } from "./screens/Mission1";
import { Mission2 } from "./screens/Mission2";
import { Mission3 } from "./screens/Mission3";
import { Briefcase } from "./screens/Briefcase";
import { Closing } from "./screens/Closing";
import { Dialogs } from "./screens/Dialogs";
import { useSession } from "./state/sessionStore";

function Flow() {
  const screen = useSession().persisted.screen;
  if (screen === "P01" || screen === "P02") return <CoverSetup />;
  if (screen === "P03" || screen === "P04") return <AgentsWelcome />;
  if (screen === "P05" || screen === "P06") return <TutorialMap />;
  if (screen === "P07" || screen === "P08" || screen === "P09" || screen === "P10" || screen === "P11") return <Mission1 />;
  if (screen === "P12" || screen === "P13" || screen === "P14" || screen === "P15" || screen === "P16" || screen === "P17") return <Mission2 />;
  if (screen === "P18" || screen === "P19" || screen === "P20" || screen === "P21" || screen === "P22") return <Mission3 />;
  if (screen === "P23" || screen === "P24" || screen === "P25" || screen === "P26" || screen === "P27") return <Briefcase />;
  return <Closing />;
}

export function App() {
  const session = useSession();
  const { screen, narration, reducedMotion } = session.persisted;
  const feedback = session.feedback;

  useEffect(() => {
    const line = LINES[screen];
    if (line) speak(line, narration);
    return () => hush();
  }, [screen, narration]);

  useEffect(() => {
    if (feedback) speak(feedback, narration);
  }, [feedback, narration]);

  useEffect(() => {
    document.body.classList.toggle("reduce", reducedMotion);
  }, [reducedMotion]);

  return (
    <div id="stage" className="stage">
      <FullscreenButton />
      <div className="screen">
        <Feedback />
        <Flow />
      </div>
      <Dialogs />
      <Orientation />
    </div>
  );
}
