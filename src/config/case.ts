import type { Level } from "./gameConfig";

export const STORY_TITLE = "El caso de la torre caída";

export const STORY_INTRO = "Este es el caso de la torre caída. La historia sale del libro.";

export const MAP_INTRO = "Este es nuestro mapa. En cada misión encontraremos un número. Yo los recordaré para abrir el maletín. ¡Vamos a la primera!";

export interface StoryPage {
  id: string;
  image: string;
  text: string;
}

export const STORY: StoryPage[] = [
  {
    id: "construyen",
    image: "/assets/story/01-torre.png",
    text: "Dos compañeros construyen una torre para guardar una pista. Están ilusionados: ya casi terminan.",
  },
  {
    id: "cae",
    image: "/assets/story/02-cae.jpg",
    text: "Una pieza se mueve y la torre se cae. Así ocurrió. No hay un culpable.",
  },
  {
    id: "siente",
    image: "/assets/story/03-enojo.jpg",
    text: "Uno de ellos siente enojo y frustración. Quería que resultara, y no resultó.",
  },
  {
    id: "ganas",
    image: "/assets/story/04-ganas.jpg",
    text: "Tiene ganas de empujar las piezas o de gritar. Sentir esa rabia es válido. Todavía no la ha hecho.",
  },
  {
    id: "dice",
    image: "/assets/story/05-decirlo.jpg",
    text: "Encuentra una forma de decir que está enojado, sin hacer daño. La torre puede esperar.",
  },
];

export interface Choice {
  id: string;
  label: string;
  ok: boolean;
}

export interface CaseQuestion {
  prompt: string;
  image: string;
  hint: string;
  miss: string;
  options: Choice[];
}

export const QUESTIONS: Record<Level, CaseQuestion[]> = {
  exploradores: [
    {
      prompt: "¿Qué pasó con la torre?",
      image: "/assets/story/02-cae.jpg",
      hint: "Mira las piezas: quedaron en el suelo.",
      miss: "Casi. Vuelve a mirar qué le ocurrió a la torre.",
      options: [
        { id: "cae", label: "Se cayó", ok: true },
        { id: "alta", label: "Se hizo más alta", ok: false },
        { id: "fuera", label: "Desapareció", ok: false },
      ],
    },
    {
      prompt: "¿Cómo podría sentirse?",
      image: "/assets/story/03-enojo.jpg",
      hint: "Quería terminar y no resultó. Eso puede ser enojo o frustración.",
      miss: "Enojo y frustración pueden ser lo que siente. Prueba esa.",
      options: [
        { id: "enojo", label: "Enojo o frustración", ok: true },
        { id: "alegria", label: "Solo alegría", ok: false },
        { id: "sueno", label: "Sueño", ok: false },
      ],
    },
    {
      prompt: "¿Cuál permite expresar su enojo sin lastimar?",
      image: "/assets/story/05-decirlo.jpg",
      hint: "Se puede decir lo que se siente, sin empujar ni golpear.",
      miss: "Esa forma puede lastimar. Hay otra que cuida.",
      options: [
        { id: "decir", label: "Decirlo con palabras", ok: true },
        { id: "empujar", label: "Empujar las piezas", ok: false },
        { id: "golpear", label: "Golpear", ok: false },
      ],
    },
  ],
  detectives: [
    {
      prompt: "¿Por qué podría sentirse frustrado?",
      image: "/assets/story/03-enojo.jpg",
      hint: "La frustración aparece cuando algo que queríamos no resulta.",
      miss: "Fíjate en lo que quería y en lo que pasó.",
      options: [
        { id: "queria", label: "Quería terminar la torre y se cayó", ok: true },
        { id: "alta", label: "Porque la torre quedó más alta", ok: false },
        { id: "no", label: "Porque ya no quería jugar", ok: false },
      ],
    },
    {
      prompt: "¿Qué diferencia hay entre sentir ganas de empujar y hacerlo?",
      image: "/assets/story/04-ganas.jpg",
      hint: "La emoción puede estar. Importa cómo se expresa.",
      miss: "Sentir no es lo mismo que hacer daño. Mira la opción que las separa.",
      options: [
        { id: "separar", label: "Sentir ganas es válido; hacerlo puede lastimar", ok: true },
        { id: "igual", label: "Es exactamente lo mismo", ok: false },
        { id: "ya", label: "Las ganas ya son un daño", ok: false },
      ],
    },
    {
      prompt: "¿Qué podría decir sin dañar a su compañero?",
      image: "/assets/story/05-decirlo.jpg",
      hint: "Puede nombrar lo que siente y lo que pasó, sin culpar.",
      miss: "Esa frase puede herir. Hay una que dice el enojo sin dañar.",
      options: [
        { id: "decir", label: "Estoy enojado porque la torre se cayó", ok: true },
        { id: "culpa", label: "Fue tu culpa", ok: false },
        { id: "tirar", label: "Voy a tirar todo", ok: false },
      ],
    },
  ],
};

export const CLOSE_1 = "El enojo y la frustración son emociones válidas. Puedo expresarlas sin lastimarme, lastimar a otras personas ni dañar cosas.";
export const CLOSE_2 = "No todos encontramos calma de la misma manera. Puedo probar algo que me ayude a bajar un poco la intensidad y volver cuando esté listo.";
export const CLOSE_3 = "Puedo sentir frustración, detenerme para no hacer daño, buscar algo que me ayude y decidir qué hacer con el problema.";

export const CALM_INTRO = "Ya reconoció su enojo. Ahora puede buscar qué le ayude a hacer una pausa, antes de actuar por impulso.";
export const CALM_HINT = "La calma se siente al respirar y al descansar. La palabra empieza con C.";
export const CALM_NOTE = "La calma es sentirse más tranquilo por dentro. Se siente al respirar y al descansar. Si llega el enojo, se puede buscar otra vez.";

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
