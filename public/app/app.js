import { loadData, getData } from './data.js';
import { navigate, onRouteChange, parseRoute } from './router.js';
import {
  addPm,
  changeVp,
  getMode,
  getState,
  setMode,
  setTurno,
  spendPm,
  subscribe,
  undo,
} from './state.js';
import { buildSearchIndex } from './search.js';
import { bindViewEvents, renderRoute } from './views.js';
import { closeSheets, initSheets, openRef } from './sheets.js';

const viewRoot = document.getElementById('view-root');
const liveRegion = document.getElementById('live-region');
let currentRoute;
let loaded = false;

init();

async function init() {
  try {
    await loadData();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('../sw.js')
        .catch((error) => console.warn('SW:', error.message));
    }
    buildSearchIndex();
    initSheets();
    setupGlobalEvents();
    subscribe(() => {
      updateHeader();
      if (loaded) render();
    });
    loaded = true;
    render();
  } catch (error) {
    viewRoot.innerHTML = `<section class="empty-state"><h1>No se pudieron cargar las reglas</h1><p>${escapeHtml(error.message)}</p></section>`;
    console.error(error);
  }
}

function setupGlobalEvents() {
  document.getElementById('mode-toggle').addEventListener('click', () => {
    const next = getMode() === 'mesa' ? 'estudio' : 'mesa';
    setMode(next);
    applyMode();
    announce(next === 'mesa' ? 'Modo Mesa activado' : 'Modo Estudio activado');
    render();
  });
  document.getElementById('menu-button').addEventListener('click', () => {
    const button = document.getElementById('menu-button');
    const nav = document.getElementById('secondary-nav');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.hidden = expanded;
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select')) return;
    const phases = ['mando', 'movimiento', 'disparo', 'carga', 'combate'];
    if (event.key >= '1' && event.key <= '5') navigate(`fase/${phases[Number(event.key) - 1]}`);
  });
  onRouteChange((route) => {
    currentRoute = route;
    closeSheets();
    render();
  });
}

function render() {
  if (!loaded) return;
  currentRoute ||= parseRoute();
  applyMode();
  viewRoot.innerHTML = renderRoute(currentRoute, handleAction);
  bindViewEvents(viewRoot, handleAction);
  updateActivePhase(currentRoute);
  updateHeader();
  document.getElementById('main-content').focus({ preventScroll: true });
}

function handleAction(action, button) {
  const state = getState();
  if (action === 'open-stratagems') {
    navigate(`estratagemas/${button.dataset.phase}`);
    return;
  }
  if (action === 'end-turn') {
    setTurno(state.turno === 'tu_turno' ? 'turno_rival' : 'tu_turno');
    announce('Turno actualizado');
    return;
  }
  if (action === 'add-pm') {
    addPm('tu', 1);
    announce('Punto de mando añadido');
    return;
  }
  if (action === 'vp-up') {
    changeVp('tu', 1);
    announce('Punto de victoria añadido');
    return;
  }
  if (action === 'vp-down') {
    changeVp('tu', -1);
    announce('Punto de victoria retirado');
    return;
  }
  if (action === 'undo') {
    undo();
    announce('Última acción deshecha');
    return;
  }
  if (action === 'use-stratagem') {
    const stratagem = getData().stratagems.estratagemas.find(
      (item) => item.id === button.dataset.id,
    );
    const phase = document.querySelector('[data-strat-list]')?.dataset.phase || 'mando';
    const target = document.querySelector('[data-strat-target]')?.value.trim() || stratagem.blanco;
    if (spendPm(stratagem.pm, stratagem.id, phase, target)) {
      announce(`${stratagem.nombre} usada. ${stratagem.pm} PM gastados.`);
      render();
    }
  }
}

function updateActivePhase(route) {
  const phase =
    route.name === 'fase' ? route.params[0] : route.name === 'estratagemas' ? route.params[0] : '';
  document.querySelectorAll('.phase-link').forEach((link) => {
    const active = link.dataset.phase === phase;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateHeader() {
  const state = getState();
  document.getElementById('round-status').textContent = `R${state.ronda}`;
  document.getElementById('turn-status').textContent =
    state.turno === 'tu_turno' ? 'TU TURNO' : 'TURNO RIVAL';
  document.getElementById('cp-status').textContent =
    state.turno === 'tu_turno' ? state.pm.tu : state.pm.rival;
  document.getElementById('vp-status').textContent =
    state.turno === 'tu_turno' ? state.pv.tu : state.pv.rival;
  const mode = getMode();
  const toggle = document.getElementById('mode-toggle');
  toggle.setAttribute('aria-pressed', String(mode === 'estudio'));
  toggle.querySelector('.mode-toggle-label').textContent = mode === 'estudio' ? 'ESTUDIO' : 'MESA';
  toggle.querySelector('.mode-toggle-icon').textContent = mode === 'estudio' ? '☀' : '☾';
}

function applyMode() {
  document.documentElement.classList.toggle('mode-study', getMode() === 'estudio');
}

function announce(message) {
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
