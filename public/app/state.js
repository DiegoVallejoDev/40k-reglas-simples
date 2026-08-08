const STORAGE_KEY = '40k-11e-state';
const MODE_KEY = '40k-11e-mode';
const MAX_UNDO_EVENTS = 20;

const DEFAULT_STATE = {
  ronda: 1,
  turno: 'tu_turno',
  fase: 'mando',
  paso: '08.01',
  pm: { tu: 0, rival: 0 },
  pv: { tu: 0, rival: 0 },
  usos: [],
  unidades: [],
  eventos: [],
};

let state = loadState();
const listeners = new Set();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...clone(DEFAULT_STATE),
      ...stored,
      pm: { ...DEFAULT_STATE.pm, ...stored.pm },
      pv: { ...DEFAULT_STATE.pv, ...stored.pv },
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener(getState()));
}

function commit(type, payload, mutate) {
  const before = clone(state);
  mutate();
  state.eventos.push({ type, payload, before, at: new Date().toISOString() });
  if (state.eventos.length > MAX_UNDO_EVENTS) state.eventos.shift();
  persist();
}

export function getState() {
  return clone(state);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMode() {
  return localStorage.getItem(MODE_KEY) === 'estudio' ? 'estudio' : 'mesa';
}

export function setMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
  listeners.forEach((listener) => listener(getState()));
}

export function setTurno(turno) {
  commit('cambiar_turno', { turno }, () => {
    if (state.turno === 'turno_rival' && turno === 'tu_turno') state.ronda += 1;
    state.turno = turno;
  });
}

export function setPhase(fase, paso = '01') {
  commit('cambiar_fase', { fase, paso }, () => {
    state.fase = fase;
    state.paso = paso;
  });
}

export function addPm(jugador = 'tu', amount = 1) {
  commit('añadir_pm', { jugador, amount }, () => {
    state.pm[jugador] = Math.max(0, state.pm[jugador] + amount);
  });
}

export function changeVp(jugador = 'tu', amount = 1) {
  commit('cambiar_pv', { jugador, amount }, () => {
    state.pv[jugador] = Math.max(0, state.pv[jugador] + amount);
  });
}

export function spendPm(amount, stratagemId, phase, target) {
  const jugador = 'tu';
  if (state.pm.tu < amount) return false;
  commit('gastar_pm', { amount, stratagemId, phase, target, jugador }, () => {
    state.pm.tu -= amount;
    state.usos.push({ stratagemId, phase, target, jugador, at: Date.now() });
  });
  return true;
}

export function markCasualties(unitId, casualties, wounds) {
  commit('bajas_unidad', { unitId, casualties, wounds }, () => {
    const existing = state.unidades.find((unit) => unit.id === unitId);
    if (existing) {
      existing.bajas = Math.max(0, casualties);
      existing.heridas = Math.max(0, wounds);
    }
  });
}

export function addUnit(unit) {
  if (!unit?.id) return;
  commit('añadir_unidad', { unit }, () => {
    if (!state.unidades.some((existing) => existing.id === unit.id)) {
      state.unidades.push({ ...unit, bajas: 0, heridas: 0 });
    }
  });
}

export function undo() {
  const event = state.eventos.pop();
  if (!event) return false;
  state = clone(event.before);
  persist();
  return true;
}

export function wasStratagemUsed(stratagemId, phase) {
  return state.usos.some((use) => use.stratagemId === stratagemId && use.phase === phase);
}

export function targetWasUsed(target, phase) {
  if (!target) return false;
  return state.usos.some((use) => use.phase === phase && use.target && use.target === target);
}

export function canUndo() {
  return state.eventos.length > 0;
}

export function reset() {
  state = clone(DEFAULT_STATE);
  persist();
}
