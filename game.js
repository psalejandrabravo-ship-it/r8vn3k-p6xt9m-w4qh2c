// El secreto del maletín - Complete educational adventure
// Provisional characters used where individual portraits are not provided.
// Replace images in /images/ folder as needed.

const CONFIG = {
  title: "El secreto del maletín",
  subtitle: "Tres pistas y un secreto por descubrir",
  clues: [
    { id: "carta", number: 4, icon: "✉️", name: "Carta" },
    { id: "radio", number: 7, icon: "📻", name: "Radio" },
    { id: "huellas", number: 2, icon: "👣", name: "Huellas" }
  ],
  word: "CALMA",
  patience: "PACIENCIA",
  scenes: ["A", "B", "C", "D"],
  agents: [
    { id: 1, name: "Agente Trenza Oscura", color: "#8B4513", image: "images/103269.png", desc: "Trenza oscura, gorra terracota, abrigo marrón, bufanda clara" },
    { id: 2, name: "Agente Cabello Oscuro Verde", color: "#556B2F", image: "images/103270.png", desc: "Cabello oscuro, gorra y abrigo verde, bufanda gris" },
    { id: 3, name: "Agente Rizado", color: "#4682B4", image: "images/103271.png", desc: "Cabello rizado, gorra beige, abrigo azul, bufanda mostaza" },
    { id: 4, name: "Agente Cabello Negro", color: "#D2B48C", image: "images/103272.png", desc: "Cabello negro recto, gorra y abrigo beige, bufanda marrón" },
    { id: 5, name: "Agente Trenza Cobriza", color: "#6B8E23", image: "images/103274.png", desc: "Trenza cobriza, gorra y abrigo verde, bufanda mostaza" },
    { id: 6, name: "Agente Azul", color: "#4169E1", image: "images/103275.png", desc: "Cabello oscuro, gorra y abrigo azul, camisa clara" }
  ]
};

const state = {
  screen: "P01",
  level: "detectives", // exploradores | detectives
  mode: "individual", // individual | grupal
  participants: 1,
  narration: true,
  sounds: true,
  reducedMotion: false,
  selectedAgents: [], // array of agent ids
  currentTurn: 0,
  missions: { 1: "pending", 2: "pending", 3: "pending" }, // pending, exploring, completed, skipped
  cluesFound: {}, // {carta: {number:4, source:"activity"}, ...}
  helpsUsed: [],
  voluntaryChoices: [],
  toolsChosen: {}, // per agent
  sessionNotes: "",
  activityState: {}, // for partial progress in missions
  videoConfig: { title: "Antes de despedirnos…", intro: "Veamos juntos este cierre de nuestra aventura.", src: null }
};

// Speech synthesis helper
function speak(text) {
  if (!state.narration || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function saveState() {
  try { sessionStorage.setItem("maletin-state", JSON.stringify(state)); } catch(e) {}
}

function loadState() {
  try {
    const s = sessionStorage.getItem("maletin-state");
    if (s) Object.assign(state, JSON.parse(s));
  } catch(e) {}
}

// Screen definitions - simplified for full flow
const screens = {
  P01: {
    title: "Portada",
    render: () => `
      <div style="text-align:center; flex:1; display:flex; flex-direction:column; justify-content:center;">
        <img src="images/84070.png" alt="MIRARIM" class="logo" style="align-self:center; height:50px;">
        <img src="images/103261.jpg" alt="Portada grupal" style="max-width:80%; max-height:50vh; margin:20px auto; border-radius:16px; object-fit:contain;">
        <h1 style="font-size:2.5rem; color:var(--deep-blue); margin:10px 0;">${CONFIG.title}</h1>
        <p style="font-size:1.4rem; color:var(--coral);">${CONFIG.subtitle}</p>
        <div style="margin-top:30px; display:flex; gap:20px; justify-content:center; flex-wrap:wrap;">
          <button class="btn" onclick="goTo('P02')">Empezar</button>
          <button class="btn secondary" onclick="continueSession()">Continuar sesión</button>
          <button class="btn gold" onclick="showAdultGuide()">Guía para acompañar</button>
        </div>
      </div>
    `
  },
  P02: {
    title: "Configuración",
    render: () => `
      <div class="top-bar"><span>Configuración</span><button class="btn secondary" onclick="goTo('P01')">Volver</button></div>
      <div style="flex:1; overflow:auto; padding:20px;">
        <p style="font-size:1.2rem; margin-bottom:20px;">Este juego se explora con una persona adulta. Podemos ajustar los retos, pedir ayuda y terminar cuando lo necesitemos.</p>
        <label>Nivel: 
          <select id="level" onchange="state.level=this.value">
            <option value="exploradores" ${state.level==="exploradores"?"selected":""}>Exploradores (4-5 años)</option>
            <option value="detectives" ${state.level==="detectives"?"selected":""}>Detectives (6-8 años)</option>
          </select>
        </label><br><br>
        <label>Modo: 
          <select id="mode" onchange="updateMode()">
            <option value="individual" ${state.mode==="individual"?"selected":""}>Individual (1 niño + adulto)</option>
            <option value="grupal" ${state.mode==="grupal"?"selected":""}>Grupal (2-6 niños + adulto)</option>
          </select>
        </label><br>
        <div id="num-participants" style="display:${state.mode==="grupal"?"block":"none"}; margin:10px 0;">
          Número de agentes: <input type="number" min="2" max="6" value="${state.participants||2}" id="participants" onchange="state.participants=parseInt(this.value)||2">
        </div>
        <label><input type="checkbox" ${state.narration?"checked":""} onchange="state.narration=this.checked"> Narración</label><br>
        <label><input type="checkbox" ${state.sounds?"checked":""} onchange="state.sounds=this.checked"> Sonidos suaves</label><br>
        <label><input type="checkbox" ${state.reducedMotion?"checked":""} onchange="state.reducedMotion=this.checked"> Movimiento reducido</label>
      </div>
      <div class="bottom-tools">
        <button class="btn" onclick="goTo('P03')">Elegir agentes</button>
      </div>
    `
  },
  P03: {
    title: "Selección de agentes",
    render: () => {
      const max = state.mode === "individual" ? 1 : state.participants;
      let html = `<div class="top-bar"><span>Elige ${max} agente(s)</span></div><div class="agents-grid">`;
      CONFIG.agents.forEach(a => {
        const sel = state.selectedAgents.includes(a.id);
        const portrait = a.image
          ? `<img class="agent-portrait" src="${a.image}" alt="${a.name}">`
          : `<div class="placeholder-avatar" style="background:${a.color}">A${a.id}</div>`;
        html += `<div class="agent-card ${sel?'selected':''}" onclick="toggleAgent(${a.id})">
          ${portrait}
          <strong>${a.name}</strong><br><small>${a.desc}</small>
        </div>`;
      });
      html += `</div><div class="bottom-tools">
        <button class="btn secondary" onclick="goTo('P02')">Volver</button>
        <button class="btn" onclick="confirmAgents()">Entrar a la central</button>
      </div>`;
      return html;
    }
  },
  P04: {
    title: "Bienvenida del robot",
    render: () => `
      <div style="text-align:center; flex:1;">
        <img src="images/103469.png" alt="Robot" style="max-height:40vh; margin:20px auto; display:block;">
        <p style="font-size:1.3rem; margin:15px;">¡Bienvenidos, agentes! Este maletín guarda un secreto. Para descubrirlo, investigaremos tres pistas.</p>
        <p style="font-size:1.2rem;">En una investigación, a veces algo cuesta o no sale a la primera. Podemos mirar otra vez, pedir ayuda o descansar.</p>
      </div>
      <div class="bottom-tools">
        <button class="btn" onclick="goTo('P05')">Conocer mis herramientas</button>
      </div>
    `
  },
  P05: {
    title: "Tutorial",
    render: () => `
      <div class="top-bar"><span>Tutorial</span></div>
      <div style="flex:1; text-align:center;">
        <p>Carta cerrada sobre una mesa.</p>
        <p style="font-size:1.2rem; margin:20px;">Toca “Una pista” para saber dónde empezar.</p>
        <button class="btn" onclick="tutorialStep()">Una pista</button>
        <div id="tutorial-content"></div>
      </div>
      <div class="bottom-tools">
        <button class="btn secondary" onclick="goTo('P06')">Ver el mapa</button>
        <button class="btn gold" onclick="adultSkipTutorial()">Omitir tutorial (adulto)</button>
      </div>
    `
  },
  P06: {
    title: "Mapa",
    render: () => {
      const m = state.missions;
      return `
        <div class="top-bar">
          <span>Mapa de misiones</span>
          <span>Turno: ${getCurrentAgentName()}</span>
          <button class="btn secondary" onclick="showNotebook()">Libreta</button>
          <button class="btn gold" onclick="showAdultPanel()">Adulto</button>
        </div>
        <div style="flex:1; display:flex; gap:20px; justify-content:center; align-items:center; flex-wrap:wrap;">
          <div class="agent-card" onclick="enterMission(1)" style="min-width:200px;">
            <h3>1. Sala de las cartas</h3>
            <p>Estado: ${m[1]}</p>
          </div>
          <div class="agent-card" onclick="enterMission(2)" style="min-width:200px;">
            <h3>2. Puesto de escucha</h3>
            <p>Estado: ${m[2]}</p>
          </div>
          <div class="agent-card" onclick="enterMission(3)" style="min-width:200px;">
            <h3>3. Archivo de las huellas</h3>
            <p>Estado: ${m[3]}</p>
          </div>
        </div>
        <div style="text-align:center; margin:10px;">
          Maletín: ${renderClueSlots()}
        </div>
        <div class="bottom-tools">
          <button class="btn secondary" onclick="pauseGame()">Una pausa</button>
          <button class="btn gold" onclick="earlyEnd()">Terminar por hoy</button>
        </div>
      `;
    }
  }
  // Additional screens P07-P30 will be handled dynamically or extended
};

// Extend with more screens as needed for full flow
function getCurrentAgentName() {
  if (!state.selectedAgents.length) return "Agente";
  const id = state.selectedAgents[state.currentTurn % state.selectedAgents.length];
  return CONFIG.agents.find(a => a.id === id)?.name || "Agente";
}

function renderClueSlots() {
  return CONFIG.clues.map(c => {
    const found = state.cluesFound[c.id];
    return `<span class="clue-slot">${c.icon} ${found ? c.number : "?"}</span>`;
  }).join("");
}

function goTo(screenId) {
  state.screen = screenId;
  saveState();
  render();
  if (state.narration && screens[screenId]?.speak) speak(screens[screenId].speak);
}

function render() {
  const container = document.getElementById("screens");
  const s = screens[state.screen];
  if (s) {
    container.innerHTML = s.render();
  } else {
    container.innerHTML = `<div class="top-bar"><span>${state.screen}</span></div><p>Pantalla en construcción funcional: ${state.screen}</p><button class="btn" onclick="goTo('P06')">Volver al mapa</button>`;
  }
}

// Core functions
function toggleAgent(id) {
  const max = state.mode === "individual" ? 1 : state.participants;
  if (state.selectedAgents.includes(id)) {
    state.selectedAgents = state.selectedAgents.filter(x => x !== id);
  } else if (state.selectedAgents.length < max) {
    state.selectedAgents.push(id);
  }
  render();
}

function confirmAgents() {
  if (state.selectedAgents.length === 0) { alert("Selecciona al menos un agente"); return; }
  goTo("P04");
}

function updateMode() {
  state.mode = document.getElementById("mode").value;
  document.getElementById("num-participants").style.display = state.mode === "grupal" ? "block" : "none";
  if (state.mode === "individual") state.participants = 1;
}

function continueSession() {
  loadState();
  goTo(state.screen || "P06");
}

function showAdultGuide() {
  alert("Guía para acompañar:\n\n- Validar emociones sin exigir que desaparezcan.\n- Ofrecer apoyos concretos.\n- Ajustar nivel según necesidad.\n- No forzar frustración.\n- Detenerse si se necesita acompañamiento fuera de pantalla.\n\nMensaje transversal: Podemos sentir frustración y seguir teniendo opciones.");
}

function tutorialStep() {
  document.getElementById("tutorial-content").innerHTML = `
    <p>Puedes tocar la solapa.</p>
    <button class="btn" onclick="openLetter()">Tocar solapa</button>
  `;
}

function openLetter() {
  document.getElementById("tutorial-content").innerHTML = `
    <p>Aquí guardamos las pistas. No necesitas recordarlas todas.</p>
    <p>Ayuda juntos: pensar con el acompañante.</p>
    <p>Por partes: mirar un paso.</p>
    <p>Una pausa: detenerse sin perder avances.</p>
  `;
  speak("Aquí guardamos las pistas. No necesitas recordarlas todas.");
}

function adultSkipTutorial() {
  goTo("P06");
}

function enterMission(num) {
  state.missions[num] = "exploring";
  saveState();
  // Simplified mission entry - in full version each has activities
  if (num === 1) goTo("P07");
  else if (num === 2) goTo("P12");
  else goTo("P18");
}

// Simplified mission implementations for completeness
function completeMission1() {
  state.cluesFound.carta = { number: 4, source: "activity" };
  state.missions[1] = "completed";
  saveState();
  alert("¡Encontramos la primera pista! Ya está en la libreta. Carta - 4");
  goTo("P11");
}

function completeMission2() {
  state.cluesFound.radio = { number: 7, source: "activity" };
  state.missions[2] = "completed";
  saveState();
  alert("Segunda pista: Radio - 7");
  goTo("P17");
}

function completeMission3() {
  state.cluesFound.huellas = { number: 2, source: "activity" };
  state.missions[3] = "completed";
  saveState();
  alert("Tercera pista: Huellas - 2");
  if (Object.keys(state.cluesFound).length === 3) goTo("P23");
  else goTo("P06");
}

// Placeholder handlers for full flow
function showNotebook() {
  let html = "<h3>Libreta de investigación</h3>";
  CONFIG.clues.forEach(c => {
    const f = state.cluesFound[c.id];
    html += `<p>${c.icon} ${c.name}: ${f ? f.number + " (" + f.source + ")" : "Pendiente"}</p>`;
  });
  html += "<button class='btn' onclick='closeModal()'>Cerrar</button>";
  showModal(html);
}

function showModal(content) {
  let m = document.getElementById("modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "modal";
    m.className = "modal";
    document.getElementById("stage").appendChild(m);
  }
  m.innerHTML = content;
  m.classList.add("active");
}

function closeModal() {
  const m = document.getElementById("modal");
  if (m) m.classList.remove("active");
}

function pauseGame() {
  showModal(`
    <h3>Podemos detenernos. Lo que hicimos sigue guardado.</h3>
    <button class="btn" onclick="closeModal()">Descansar un momento</button>
    <button class="btn" onclick="closeModal()">Moverme un poco</button>
    <button class="btn" onclick="closeModal()">Respirar suave, si quiero</button>
    <button class="btn secondary" onclick="closeModal()">Volver</button>
    <button class="btn gold" onclick="earlyEnd()">Terminar por hoy</button>
  `);
}

function earlyEnd() {
  if (confirm("¿El adulto confirma terminar por hoy?")) {
    goTo("P29");
  }
}

function showAdultPanel() {
  showModal(`
    <h3>Panel del adulto</h3>
    <button class="btn" onclick="skipMissionWithSupport()">Omitir misión y recibir pista con apoyo</button>
    <button class="btn" onclick="goTo('P30')">Resumen del acompañante</button>
    <button class="btn secondary" onclick="closeModal()">Cerrar</button>
    <p><small>No se pierden avances. Las pistas con apoyo se marcan como tal.</small></p>
  `);
}

function skipMissionWithSupport() {
  // Example for current
  const missing = CONFIG.clues.find(c => !state.cluesFound[c.id]);
  if (missing) {
    state.cluesFound[missing.id] = { number: missing.number, source: "apoyo adulto" };
    saveState();
    alert("Pista entregada con apoyo: " + missing.name + " - " + missing.number);
  }
  closeModal();
  goTo("P06");
}

// Orientation check
function checkOrientation() {
  const w = document.getElementById("rotate-warning");
  if (window.innerHeight > window.innerWidth && window.innerWidth < 900) {
    w.classList.add("active");
  } else {
    w.classList.remove("active");
  }
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);

// Init
loadState();
document.addEventListener("DOMContentLoaded", () => {
  checkOrientation();
  render();
});

// Additional mission screens stubs for navigation completeness
["P07","P08","P09","P10","P11","P12","P13","P14","P15","P16","P17","P18","P19","P20","P21","P22","P23","P24","P25","P26","P27","P28","P29","P30"].forEach(id => {
  if (!screens[id]) {
    screens[id] = {
      render: () => {
        let content = `<div class="top-bar"><span>${id}</span><button class="btn secondary" onclick="goTo('P06')">Mapa</button></div>`;
        if (id === "P09") content += `<button class="btn" onclick="completeMission1()">Probar palabra CALMA (demo)</button>`;
        if (id === "P16") content += `<button class="btn" onclick="completeMission2()">Abrir con PACIENCIA</button>`;
        if (id === "P20") content += `<button class="btn" onclick="completeMission3()">Revisar historia A-B-C-D</button>`;
        if (id === "P24") content += `<button class="btn" onclick="goTo('P25')">Abrir maletín 4-7-2</button>`;
        if (id === "P25") content += `<p>Secret: herramientas para momentos difíciles.</p><button class="btn" onclick="goTo('P26')">Explorar herramientas</button>`;
        if (id === "P28") content += `<div style="background:#F4F1DE; padding:40px; text-align:center; border:2px dashed var(--gold);"><p>Aquí irá nuestro video de cierre.</p><button class="btn" onclick="goTo('P29')">Continuar</button></div>`;
        if (id === "P29") content += `<img src="images/103469.png" style="max-height:30vh;"><p>A veces algo cuesta. Podemos sentirlo, buscar apoyo y elegir qué hacer después.</p><p>Gracias por explorar juntos.</p><img src="images/84070.png" class="logo"><button class="btn" onclick="goTo('P01')">Nueva sesión</button>`;
        if (id === "P30") content += `<h3>Resumen del acompañante</h3><p>Nivel: ${state.level}</p><p>Misiones: ${JSON.stringify(state.missions)}</p><p>Pistas: ${JSON.stringify(state.cluesFound)}</p><p><small>Este resumen describe la experiencia. No mide ni diagnostica el desarrollo socioemocional.</small></p><button class="btn" onclick="window.print()">Imprimir</button>`;
        content += `<div class="bottom-tools"><button class="btn" onclick="nextScreen('${id}')">Continuar</button></div>`;
        return content;
      }
    };
  }
});

function nextScreen(current) {
  const order = ["P07","P08","P09","P10","P11","P06","P12","P13","P14","P15","P16","P17","P06","P18","P19","P20","P21","P22","P23","P24","P25","P26","P27","P28","P29","P30"];
  const idx = order.indexOf(current);
  if (idx >= 0 && idx < order.length - 1) goTo(order[idx + 1]);
  else goTo("P06");
}

// Make functions global for onclick
window.state = state;
Object.assign(window, {
  goTo, toggleAgent, confirmAgents, updateMode, continueSession, showAdultGuide,
  tutorialStep, openLetter, adultSkipTutorial, enterMission, showNotebook,
  pauseGame, earlyEnd, showAdultPanel, skipMissionWithSupport, closeModal,
  completeMission1, completeMission2, completeMission3, nextScreen
});

// Enhanced mission content
function renderMission1() {
  if (state.level === "detectives") {
    return `
      <div class="top-bar"><span>Sala de las cartas</span></div>
      <p>Cuando algo cuesta, puedo parar un momento, notar cómo estoy y pensar qué hacer. No hago desaparecer lo que siento, pero puedo ayudarme a encontrar…</p>
      <button class="btn" onclick="chooseWord('CALMA')">CALMA</button>
      <button class="btn" onclick="chooseWord('PRISA')">PRISA</button>
      <button class="btn" onclick="chooseWord('RUIDO')">RUIDO</button>
      <div id="feedback"></div>
    `;
  } else {
    return `
      <div class="top-bar"><span>Sala de las cartas</span></div>
      <p>Al agente no le sale todavía. ¿Qué puede ayudarle a mirar el problema otra vez?</p>
      <button class="btn" onclick="chooseExplorer('parar')">Parar y mirar</button>
      <button class="btn" onclick="chooseExplorer('golpear')">Golpear la mesa</button>
      <button class="btn" onclick="chooseExplorer('empujar')">Apartar todo de un empujón</button>
      <div id="feedback"></div>
    `;
  }
}

function chooseWord(w) {
  const fb = document.getElementById("feedback");
  if (w === "CALMA") {
    fb.innerHTML = "<p>CALMA es la palabra de esta puerta. No tenemos que sentirla todo el tiempo para seguir jugando.</p><button class='btn' onclick='completeMission1()'>Continuar</button>";
    speak("CALMA es la palabra de esta puerta.");
  } else if (w === "PRISA") {
    fb.innerHTML = "<p>La prisa puede hacer que queramos hacerlo enseguida. Esta carta habla de parar y pensar.</p>";
  } else {
    fb.innerHTML = "<p>El ruido es algo que escuchamos. La carta busca otra palabra.</p>";
  }
}

function chooseExplorer(opt) {
  const fb = document.getElementById("feedback");
  if (opt === "parar") {
    fb.innerHTML = "<p>La palabra de entrada es CALMA.</p><button class='btn' onclick='completeMission1()'>Continuar</button>";
  } else {
    fb.innerHTML = "<p>A veces dan ganas de hacer eso cuando algo molesta. Veamos una opción que cuide al agente y sus cosas.</p>";
  }
}

// Override P08
screens.P08 = { render: renderMission1 };

// Simple code formation for demo
screens.P24 = {
  render: () => `
    <div class="top-bar"><span>Formar el código</span><button class="btn secondary" onclick="showNotebook()">Libreta</button></div>
    <p>Forma 4 – 7 – 2 con las pistas.</p>
    ${renderClueSlots()}
    <button class="btn" onclick="checkCode()">Abrir maletín</button>
    <div id="code-feedback"></div>
  `
};

function checkCode() {
  if (Object.keys(state.cluesFound).length === 3) {
    goTo("P25");
  } else {
    document.getElementById("code-feedback").innerHTML = "<p>Una pista está en otro lugar. Podemos mirar la libreta.</p>";
  }
}

Object.assign(window, { chooseWord, chooseExplorer, checkCode, renderMission1 });
