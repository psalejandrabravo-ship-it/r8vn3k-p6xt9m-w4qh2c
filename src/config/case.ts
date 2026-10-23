import type { Level } from "./gameConfig";

export const STORY_TITLE = "El caso de las torres";

export const MAP_INTRO = "Este es nuestro mapa. En cada misión encontraremos un número. Yo los recordaré para abrir el maletín. ¡Vamos a la primera!";

export const OPEN_CASE = "Agentes, este libro guarda un caso para investigar. Primero leamos la historia. Después, revisaremos las pistas para encontrar el primer número del maletín.";

export const CASE_BRIDGE = "Ahora sí, agentes. Miremos qué sintió el personaje y qué podría hacer antes de actuar.";

export const NUMBER_LINE = "¡Encontramos la primera pista! Este es el primer número del maletín. Lo guardaré para recordarlo.";

export const CLOSE_1 = "Sentir enojo o frustración está bien. Lastimar no. Podemos detenernos un momento antes de actuar, aunque todavía estemos enojados.";

export const CLOSE_1_NEXT = "Ahora investiguemos qué puede ayudarnos a encontrar un poco de calma.";

export const MAP_AFTER_1 = "Nuestra próxima misión: descubrir maneras de encontrar calma.";

export interface StoryPage {
  id: string;
  image: string;
  text: string;
}

export const STORY: StoryPage[] = [
  {
    id: "construyen",
    image: "/assets/story/pagina-1.png",
    text: "Dos amigos construían una torre.\nQuerían que llegara muy alto.",
  },
  {
    id: "ultima",
    image: "/assets/story/pagina-2.png",
    text: "El niño levantó la última pieza.\n—¡Mira! ¡Está casi lista!",
  },
  {
    id: "cae",
    image: "/assets/story/pagina-3.png",
    text: "Pero la torre se tambaleó…\n¡Y las piezas cayeron al suelo!",
  },
  {
    id: "enojo",
    image: "/assets/story/pagina-4.png",
    text: "Había trabajado mucho.\nSintió la cara roja y apretó las manos.\n¡Estaba muy enojado y frustrado!",
  },
  {
    id: "impulso",
    image: "/assets/story/pagina-5.png",
    text: "Le dieron ganas de tirar las otras torres,\ngritarle a su amiga y empujarla.",
  },
];

export interface CaseOption {
  id: string;
  label: string;
  image?: string;
  face?: string;
  reply: string;
  next: "retry" | "continue" | "number";
}

export interface CaseQuestion {
  prompt: string;
  hint: string;
  support?: string;
  options: CaseOption[];
}

const IMPULSO = "/assets/story/impulso.png";
const BERRINCHE = "/assets/story/berrinche.png";
const DETENER = "/assets/story/detenerse.png";

const ACTION_OPTIONS: CaseOption[] = [
  {
    id: "gritar",
    label: "Gritar o empujar a su amiga",
    image: IMPULSO,
    reply: "Puede sentir mucho enojo. Pero gritarle o empujarla puede asustarla o lastimarla. Busquemos una forma de expresarlo sin lastimar.",
    next: "retry",
  },
  {
    id: "berrinche",
    label: "Hacer berrinche o tirar las cosas",
    image: BERRINCHE,
    reply: "Está bien sentir enojo. Hacer un berrinche o tirar las cosas puede lastimar o romper algo. Probemos otra opción.",
    next: "retry",
  },
  {
    id: "detenerse",
    label: "Detenerse un momento",
    image: DETENER,
    reply: "Detenerse un momento puede ayudarlo a no actuar por impulso. Puede seguir enojado mientras hace esa pausa.",
    next: "number",
  },
];

export const QUESTIONS: Record<Level, CaseQuestion[]> = {
  exploradores: [
    {
      prompt: "¿Cómo se sintió cuando se cayó la torre?",
      hint: "Apretó las manos y tenía la cara roja.",
      support: "/assets/story/pagina-4.png",
      options: [
        { id: "enojo", label: "Enojado o frustrado.", face: "/assets/ui/cara-enojo.png", reply: "Sí. Quería que la torre resultara y se cayó. Eso puede causar enojo o frustración.", next: "continue" },
        { id: "contento", label: "Contento.", face: "/assets/ui/cara-contento.png", reply: "Miremos las pistas: apretó las manos y sintió la cara roja. ¿Cómo podría sentirse?", next: "retry" },
        { id: "tranquilo", label: "Tranquilo.", face: "/assets/ui/cara-tranquilo.png", reply: "Miremos las pistas: apretó las manos y sintió la cara roja. ¿Cómo podría sentirse?", next: "retry" },
      ],
    },
    {
      prompt: "¿Está bien sentir enojo o frustración?",
      hint: "Sentir una emoción puede ser incómodo y, aun así, estar bien.",
      support: "/assets/story/pagina-4.png",
      options: [
        { id: "si", label: "Sí.", reply: "Sí. Todos podemos sentir enojo o frustración. Sentirlo no nos hace malos.", next: "continue" },
        { id: "no", label: "No.", reply: "El enojo puede ser incómodo, pero no está mal sentirlo. Lo importante es qué hacemos cuando aparece.", next: "continue" },
      ],
    },
    {
      prompt: "¿Qué podría hacer ahora que está frustrado y/o enojado?",
      hint: "Busca lo que hace una pausa, sin lastimar.",
      options: ACTION_OPTIONS,
    },
  ],
  detectives: [
    {
      prompt: "¿Cómo se sintió el personaje y qué pistas del cuento te ayudan a saberlo?",
      hint: "Apretó las manos y tenía la cara roja.",
      support: "/assets/story/pagina-4.png",
      options: [
        { id: "enojo", label: "Enojado o frustrado.", face: "/assets/ui/cara-enojo.png", reply: "Las pistas nos ayudan a comprender cómo podría sentirse. Había trabajado mucho y la torre no resultó como esperaba.", next: "continue" },
        { id: "contento", label: "Contento.", face: "/assets/ui/cara-contento.png", reply: "Miremos otra vez las pistas: las manos, la cara y lo que pasó con la torre.", next: "retry" },
        { id: "tranquilo", label: "Tranquilo.", face: "/assets/ui/cara-tranquilo.png", reply: "Miremos otra vez las pistas: las manos, la cara y lo que pasó con la torre.", next: "retry" },
      ],
    },
    {
      prompt: "¿Está mal sentir enojo? ¿Es lo mismo sentirlo que lastimar a alguien?",
      hint: "Una emoción y una acción pueden ser distintas.",
      support: "/assets/story/pagina-4.png",
      options: [
        { id: "distinto", label: "Sentir enojo está bien; lastimar es distinto.", reply: "Exacto. Una emoción y una acción no son lo mismo. Podemos sentir enojo y elegir cómo expresarlo.", next: "continue" },
        { id: "mal", label: "Sentir enojo siempre está mal.", reply: "Sentir enojo no está mal. Pero estar enojados no hace que lastimar sea una opción segura. Podemos buscar otra forma de expresarlo.", next: "continue" },
        { id: "permite", label: "Estar enojado permite lastimar.", reply: "Sentir enojo no está mal. Pero estar enojados no hace que lastimar sea una opción segura. Podemos buscar otra forma de expresarlo.", next: "continue" },
      ],
    },
    {
      prompt: "¿Qué podría hacer ahora que está frustrado y/o enojado?",
      hint: "Busca lo que hace una pausa, sin lastimar.",
      options: ACTION_OPTIONS,
    },
  ],
};
export const CLOSE_2 = "No todos encontramos calma de la misma manera. Puedo probar algo que me ayude a bajar un poco la intensidad y volver cuando esté listo.";
export const CLOSE_3 = "Puedo sentir enojo, hacer una pausa y elegir qué hacer sin lastimar.";
export const CLOSE_3_MORE = "A veces necesitamos más de una pausa, probar otra estrategia o pedir compañía. No tiene que salir todo de una vez.";
export const CLOSE_3_CASE = "¡Tenemos los tres números! Vamos a abrir el maletín.";

export const CALM_INTRO = "Ya reconoció su enojo. Ahora puede buscar qué le ayude a hacer una pausa, antes de actuar por impulso.";
export const CALM_HINT = "La calma se siente al respirar y al descansar. La palabra empieza con C.";
export const CALM_NOTE = "La calma es sentirse más tranquilo por dentro. Se siente al respirar y al descansar. Si llega el enojo, se puede buscar otra vez.";
export const WAYS_INTRO = "Encontrar la calma nos ayuda a detenernos y pensar. Pero no tienes que dejar de estar enojado de inmediato.";

export interface TowerOption {
  id: string;
  title: string;
  text: string;
  image: string;
}

export const TOWER_OPTIONS: TowerOption[] = [
  { id: "ayuda", title: "Pedir ayuda", text: "Alguien de confianza puede mirar la torre con él.", image: "/assets/illustrations/cards/ayuda.jpg" },
  { id: "otra", title: "Probar otra forma", text: "Puede hacer una base más firme, sin apurarse.", image: "/assets/illustrations/steps/decidir.jpg" },
  { id: "pausa", title: "Descansar y volver", text: "Puede alejarse un momento y regresar cuando esté listo.", image: "/assets/illustrations/steps/detener.jpg" },
];

export const DECIDE_STEPS = [
  { title: "Detenerse", text: "Paramos un momento, aunque el impulso empuje.", image: "/assets/illustrations/steps/detener.jpg" },
  { title: "Mirar", text: "Vemos qué pasó con la torre y qué opciones hay.", image: "/assets/illustrations/steps/pensar.jpg" },
  { title: "Decidir", text: "Elegimos un paso que nos cuide.", image: "/assets/illustrations/steps/decidir.jpg" },
  { title: "Probar", text: "Hacemos ese paso. Si no resulta, se puede intentar de otro modo.", image: "/assets/illustrations/steps/actuar.jpg" },
];
