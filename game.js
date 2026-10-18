// Minimal functional version to unblock Vercel deployment
const CONFIG = {
  title: "El secreto del maletín",
  subtitle: "Tres pistas y un secreto por descubrir"
};

const state = { screen: "P01" };

function goTo(id) {
  state.screen = id;
  render();
}

function render() {
  const container = document.getElementById("screens");
  if (!container) return;
  if (state.screen === "P01") {
    container.innerHTML = `
      <div style="text-align:center; flex:1; display:flex; flex-direction:column; justify-content:center; padding:20px;">
        <img src="images/84070.png" alt="MIRARIM" style="height:50px; margin:10px auto;" onerror="this.style.display='none'">
        <img src="images/103261.jpg" alt="Portada" style="max-width:90%; max-height:40vh; margin:15px auto; border-radius:16px; object-fit:contain;" onerror="this.alt='Portada (imagen pendiente)'">
        <h1 style="font-size:2.2rem; color:#2B2155; margin:10px 0;">${CONFIG.title}</h1>
        <p style="font-size:1.3rem; color:#E07A5F;">${CONFIG.subtitle}</p>
        <div style="margin-top:30px; display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
          <button class="btn" onclick="goTo('P02')">Empezar</button>
          <button class="btn secondary" onclick="alert('Continuar sesión (próximamente)')">Continuar sesión</button>
          <button class="btn gold" onclick="alert('Guía para acompañar:\\nValidar emociones, ofrecer apoyo, no forzar frustración.')">Guía para acompañar</button>
        </div>
      </div>`;
  } else if (state.screen === "P02") {
    container.innerHTML = `
      <div class="top-bar"><span>Configuración</span><button class="btn secondary" onclick="goTo('P01')">Volver</button></div>
      <div style="flex:1; padding:30px; text-align:center;">
        <p style="font-size:1.2rem;">Este juego se explora con una persona adulta.</p>
        <p>Nivel, modo y agentes se configurarán en la versión completa.</p>
        <button class="btn" style="margin-top:30px;" onclick="goTo('P04')">Entrar a la central</button>
      </div>`;
  } else if (state.screen === "P04") {
    container.innerHTML = `
      <div style="text-align:center; flex:1; padding:20px;">
        <img src="images/103469.jpg" alt="Robot" style="max-height:35vh; margin:20px auto;" onerror="this.alt='Robot'">
        <p style="font-size:1.3rem; margin:15px;">¡Bienvenidos, agentes! Este maletín guarda un secreto.</p>
        <p>Para descubrirlo, investigaremos tres pistas.</p>
        <button class="btn" style="margin-top:20px;" onclick="goTo('P06')">Ver el mapa</button>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="top-bar"><span>Mapa de misiones</span><button class="btn secondary" onclick="goTo('P01')">Inicio</button></div>
      <div style="flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:20px;">
        <p style="font-size:1.3rem; margin-bottom:20px;">Mapa en construcción (versión mínima funcional)</p>
        <p>La lógica completa de misiones, pistas 4-7-2 y maletín está en el archivo game.js original.</p>
        <button class="btn" onclick="goTo('P01')">Volver al inicio</button>
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", render);
window.goTo = goTo;
