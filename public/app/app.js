import { loadData, getData } from './data.js';
import { navigate, onRouteChange, parseRoute } from './router.js';
import {
  addPm,
  changeVp,
  formatCount,
  getMode,
  getMarkerExpanded,
  getState,
  setMode,
  setMarkerExpanded,
  setPhase,
  setTurno,
  spendPm,
  subscribe,
  targetWasUsed,
  undo,
} from './state.js';
import { buildSearchIndex } from './search.js';
import { bindViewEvents, renderRoute } from './views.js';
import { closeSheets, initSheets } from './sheets.js';

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
        .register('./sw.js')
        .catch((error) => console.warn('SW:', error.message));
    }
    buildSearchIndex();
    initSheets();
    setupGlobalEvents();
    subscribe(() => {
      updateHeader();
      if (loaded) render({ focus: false });
    });
    loaded = true;
    render();
  } catch (error) {
    viewRoot.innerHTML = `<section class="empty-state"><h1>No se pudieron cargar las reglas</h1><p>${escapeHtml(error.message)}</p></section>`;
    console.error(error);
  }
}

function setupGlobalEvents() {
  const markerToggle = document.getElementById('marker-toggle');
  markerToggle.addEventListener('click', () => {
    setMarkerExpanded(!getMarkerExpanded());
    updateMarker();
    markerToggle.focus({ preventScroll: true });
  });
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
    if (
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      !event.shiftKey &&
      event.key >= '1' &&
      event.key <= '5'
    ) {
      navigate(`fase/${phases[Number(event.key) - 1]}`);
    }
  });
  onRouteChange((route) => {
    currentRoute = route;
    closeSheets();
    if (route.name === 'fase' || route.name === 'estratagemas') {
      const phase = route.params[0] || 'mando';
      setPhase(phase, `${phaseRuleId(phase)}.01`);
    }
    render({ focus: true });
  });
}

function render(options = { focus: true }) {
  if (!loaded) return;
  const focused = options.focus ? null : getFocusDescriptor();
  currentRoute ||= parseRoute();
  applyMode();
  viewRoot.innerHTML = renderRoute(currentRoute);
  bindViewEvents(viewRoot, handleAction);
  updateActivePhase(currentRoute);
  updateHeader();
  updateMarker();
  if (options.focus) {
    document.getElementById('main-content').focus({ preventScroll: true });
  } else {
    restoreFocus(focused);
  }
}

function handleAction(action, button) {
  const state = getState();
  if (action === 'open-stratagems') {
    navigate(`estratagemas/${button.dataset.phase}`);
    return;
  }
  if (action === 'end-turn') {
    setTurno(state.turno === 'tu_turno' ? 'turno_rival' : 'tu_turno');
    setPhase('mando', '08.01');
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
    const phase = currentRoute?.params[0] || 'mando';
    const selectedTarget = document.querySelector('[data-strat-target]')?.value.trim();
    const target = selectedTarget || stratagem.blanco;
    if (selectedTarget && targetWasUsed(selectedTarget, phase)) {
      announce('Esa unidad ya fue blanco de otra estratagema en esta fase.');
      return;
    }
    if (spendPm(stratagem.pm, stratagem.id, phase, target, stratagem.nombre)) {
      announce(
        `${stratagem.nombre} usada. ${formatCount(stratagem.pm, 'PM gastado', 'PM gastados')}.`,
      );
    }
  }
}

function phaseRuleId(phase) {
  return (
    { mando: '08', movimiento: '09', disparo: '10', carga: '11', combate: '12' }[phase] || '08'
  );
}

function getFocusDescriptor() {
  const element = document.activeElement;
  if (!element || element === document.body) return null;
  return {
    id: element.id,
    action: element.dataset?.action,
    actionId: element.dataset?.id,
    name: element.getAttribute('name'),
  };
}

function restoreFocus(descriptor) {
  if (!descriptor) return;
  let element = descriptor.id ? document.getElementById(descriptor.id) : null;
  if (!element && descriptor.action) {
    element = viewRoot.querySelector(
      `[data-action="${descriptor.action}"]${descriptor.actionId ? `[data-id="${descriptor.actionId}"]` : ''}`,
    );
  }
  if (!element && descriptor.name) element = viewRoot.querySelector(`[name="${descriptor.name}"]`);
  element?.focus({ preventScroll: true });
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
  document.getElementById('cp-status').textContent = state.pm.tu;
  document.getElementById('vp-status').textContent = state.pv.tu;
  const mode = getMode();
  const toggle = document.getElementById('mode-toggle');
  toggle.setAttribute('aria-pressed', String(mode === 'estudio'));
  toggle.querySelector('.mode-toggle-label').textContent = mode === 'estudio' ? 'ESTUDIO' : 'MESA';
  toggle.querySelector('.mode-toggle-icon').textContent = mode === 'estudio' ? '☀' : '☾';
}

function updateMarker() {
  const expanded = getMarkerExpanded();
  const strip = document.getElementById('marker-strip');
  const toggle = document.getElementById('marker-toggle');
  strip.hidden = !expanded;
  toggle.setAttribute('aria-expanded', String(expanded));
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
