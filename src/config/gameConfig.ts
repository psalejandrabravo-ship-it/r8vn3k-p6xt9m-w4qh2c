export type Level = "exploradores" | "detectives";
export type Mode = "individual" | "grupal";
export type ScreenId =
  | "P01" | "P02" | "P03" | "P04" | "P05" | "P06"
  | "P07" | "P08" | "P09" | "P10" | "P11"
  | "P12" | "P13" | "P14" | "P15" | "P16" | "P17"
  | "P18" | "P19" | "P20" | "P21" | "P22"
  | "P23" | "P24" | "P25" | "P26" | "P27"
  | "P28" | "P29" | "P30";

export type MissionId = 1 | 2 | 3;
export type MissionStatus = "pending" | "exploring" | "completed" | "skipped";
export type ClueId = "carta" | "radio" | "huellas";
export type ClueSource = "activity" | "apoyo adulto";

export interface Agent {
  id: number;
  name: string;
  short: string;
  desc: string;
  image: string;
}

export interface Clue {
  id: ClueId;
  number: number;
  name: string;
  mission: MissionId;
}

export interface Tile {
  id: string;
  char: string;
}

export interface Tool {
  id: string;
  name: string;
  text: string;
}

export const TITLE = "El secreto del maletín";
export const SUBTITLE = "Tres pistas y un secreto por descubrir";
export const STORAGE_KEY = "mirarim-el-secreto-del-maletin-session-v1";
export const TRANSVERSAL = "Podemos sentir frustración y seguir teniendo opciones.";

export const AGENTS: Agent[] = [
  { id: 1, name: "Agente Trenza Oscura", short: "Trenza oscura", desc: "Trenza oscura, gorra terracota, abrigo marrón, bufanda clara", image: "/assets/illustrations/characters/103269.png" },
  { id: 2, name: "Agente Cabello Oscuro Verde", short: "Abrigo verde", desc: "Cabello oscuro, gorra y abrigo verde, bufanda gris", image: "/assets/illustrations/characters/103270.png" },
  { id: 3, name: "Agente Rizado", short: "Rizado", desc: "Cabello rizado, gorra beige, abrigo azul, bufanda mostaza", image: "/assets/illustrations/characters/103271.png" },
  { id: 4, name: "Agente Cabello Negro", short: "Cabello negro", desc: "Cabello negro recto, gorra y abrigo beige, bufanda marrón", image: "/assets/illustrations/characters/103272.png" },
  { id: 5, name: "Agente Trenza Cobriza", short: "Trenza cobriza", desc: "Trenza cobriza, gorra y abrigo verde, bufanda mostaza", image: "/assets/illustrations/characters/103274.png" },
  { id: 6, name: "Agente Azul", short: "Abrigo azul", desc: "Cabello oscuro, gorra y abrigo azul, camisa clara", image: "/assets/illustrations/characters/103275.png" },
];

export const ROBOT = "/assets/illustrations/characters/103469.png";
export const COVER = "/assets/illustrations/scenes/103261.jpg";
export const ALMA = AGENTS[0];

export const CLUES: Clue[] = [
  { id: "carta", number: 4, name: "Carta", mission: 1 },
  { id: "radio", number: 7, name: "Radio", mission: 2 },
  { id: "huellas", number: 2, name: "Huellas", mission: 3 },
];

export const TOOLS: Tool[] = [
  { id: "parar", name: "Reconocer el enojo", text: "El enojo y la frustración son emociones válidas." },
  { id: "ayuda", name: "Decirlo sin dañar", text: "Puedo expresar lo que siento sin lastimar a nadie ni dañar cosas." },
  { id: "partes", name: "Buscar una calma", text: "Puedo probar algo que me ayude a bajar un poco la intensidad." },
  { id: "pausa", name: "Probar otra forma", text: "Puedo pedir ayuda, cambiar de estrategia o volver después." },
];

export const SCENES: { id: string; title: string; text: string }[] = [
  { id: "A", title: "La tapa no cede", text: "Alma intenta abrir el archivo. La tapa no se mueve y se le aprieta el cuerpo." },
  { id: "B", title: "Alma se detiene", text: "Alma para. Nota que está molesta y pide mirar junto a alguien." },
  { id: "C", title: "Un solo paso", text: "Alma compara las huellas despacito, una por una." },
  { id: "D", title: "Sigue, con lo que siente", text: "Alma anota lo que encontró. Sigue, aunque todavía sienta que costó." },
];

export const SCENE_ORDER = ["A", "B", "C", "D"];
export const CALMA = "CALMA";
export const PACIENCIA = "PACIENCIA";
export const CODE = ["4", "7", "2"];
export const CODE_ICONS: ClueId[] = ["carta", "radio", "huellas"];
export const FINAL_VIDEO = "";

export const REFLECTIONS = [
  { id: "ayuda", label: "Pedir ayuda a alguien" },
  { id: "respirar", label: "Parar y respirar" },
  { id: "partes", label: "Mirar el problema por partes" },
  { id: "descansar", label: "Descansar y volver después" },
];

export const LINES: Partial<Record<ScreenId, string>> = {
  P01: "El secreto del maletín. Tres pistas y un secreto por descubrir.",
  P05: "La misión comienza. Un maletín guarda un secreto y tres pistas lo abren.",
  P06: "Mapa de misiones. El sobre cerrado espera que lo abras.",
  P07: "Escucha el acertijo y descubre la palabra secreta.",
  P08: "Cuando algo cuesta, puedo parar, notar cómo estoy y pensar qué hacer.",
  P12: "En el puesto de escucha, la radio trae dos caminos: paciencia e impulso.",
  P18: "En el archivo hay cuatro momentos de Alma. Hay que ponerlos en orden.",
  P23: "El maletín espera las tres pistas.",
  P25: "Dentro hay herramientas para los momentos en que algo cuesta.",
  P29: "A veces algo cuesta. Podemos sentirlo, buscar apoyo y elegir qué hacer después.",
};

export function agentById(id: number): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function detectiveName(names: string[] | undefined, agents: number[], agentId: number): string {
  const index = agents.findIndex((id) => id === agentId);
  const custom = index >= 0 ? names?.[index]?.trim() : "";
  return custom || agentById(agentId)?.short || "Detective";
}

export function clueByMission(mission: MissionId): Clue {
  return CLUES[mission - 1];
}

export function statusLabel(status: MissionStatus): string {
  switch (status) {
    case "pending": return "Por explorar";
    case "exploring": return "En curso";
    case "completed": return "Pista encontrada";
    case "skipped": return "Con apoyo";
  }
}

export function sourceLabel(source: ClueSource): string {
  return source === "activity" ? "Encontrada en la misión" : "Entregada con apoyo";
}
