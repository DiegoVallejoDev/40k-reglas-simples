import { getNode, isRenderable } from './data.js';
import { getMode } from './state.js';
import { navigate } from './router.js';

let stack = [];
let root;
let lastFocused;
let startY = null;
let swipeStarted = false;

export function initSheets() {
  root = document.getElementById('sheet-root');
  document.body.addEventListener('click', handleReferenceClick);
  root.addEventListener('click', handleSheetClick);
  document.addEventListener('keydown', handleKeydown);
  root.addEventListener('pointerdown', (event) => {
    swipeStarted = Boolean(event.target.closest('.sheet-header'));
    startY = swipeStarted ? event.clientY : null;
  });
  root.addEventListener('pointerup', (event) => {
    if (swipeStarted && startY !== null && event.clientY - startY > 70) popSheet();
    startY = null;
    swipeStarted = false;
  });
}

export function openRef(id) {
  const node = getNode(id);
  if (!node || !isRenderable(node, getMode())) return false;
  if (stack.length >= 3) stack = stack.slice(-2);
  if (!lastFocused) lastFocused = document.activeElement;
  stack.push(node);
  render();
  return true;
}

export function closeSheets() {
  stack = [];
  render();
  if (lastFocused?.focus) lastFocused.focus();
  lastFocused = null;
}

export function popSheet() {
  if (stack.length <= 1) return closeSheets();
  stack.pop();
  render();
}

function handleReferenceClick(event) {
  const trigger = event.target.closest('[data-ref]');
  if (!trigger) return;
  event.preventDefault();
  openRef(trigger.dataset.ref);
}

function handleSheetClick(event) {
  if (event.target === root.querySelector('.sheet-backdrop')) {
    closeSheets();
    return;
  }
  const close = event.target.closest('[data-sheet-close]');
  if (close) closeSheets();
  const back = event.target.closest('[data-sheet-back]');
  if (back) popSheet();
  const full = event.target.closest('[data-open-full]');
  if (full) {
    const id = full.dataset.openFull;
    closeSheets();
    navigate(`regla/${id}`);
  }
}

function handleKeydown(event) {
  if (!stack.length) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSheets();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [
    ...root.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  ];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function nodeCopy(node) {
  return node.texto || node.definicion || node.efecto || node.nota || node.cuando || '';
}

function render() {
  if (!root) return;
  if (!stack.length) {
    root.innerHTML = '';
    return;
  }
  root.innerHTML = `
    <div class="sheet-backdrop" role="presentation">
      <div class="sheet-stack" data-level="${stack.length}" role="dialog" aria-modal="true" aria-label="Detalle de regla">
        ${stack.map((node, index) => renderSheet(node, index)).join('')}
      </div>
    </div>
  `;
  root.querySelector('.sheet-close, .sheet-back')?.focus();
}

function renderSheet(node, index) {
  const title = node.titulo || node.nombre || node.etiqueta || node.id;
  const refs = (node.ver_tambien || []).filter((ref) => {
    const target = getNode(ref);
    return target && isRenderable(target, getMode());
  });
  const isRule = node.tipo === 'regla' || node.tipo === 'paso';
  return `
    <article class="sheet" data-sheet-index="${index}">
      <header class="sheet-header">
        ${index > 0 ? '<button class="sheet-back" type="button" data-sheet-back aria-label="Volver">‹</button>' : ''}
        <div class="sheet-title">
          <h2>${escapeHtml(title)}</h2>
          <span class="citation">${escapeHtml(node.cita || 'SIN CITA')} · pág. ${node.pagina || '—'}</span>
        </div>
        <button class="sheet-close" type="button" data-sheet-close aria-label="Cerrar hoja">×</button>
      </header>
      <div class="sheet-body">
        ${node.no_confirmado ? `<div class="unconfirmed-block"><div class="unconfirmed-label">Sin confirmar en las fuentes</div><p>${escapeHtml(node.nota || '')}</p></div>` : ''}
        ${node.cuando ? `<dl class="stratagem-copy"><dt>Cuándo</dt><dd>${escapeHtml(node.cuando)}</dd></dl>` : ''}
        ${node.blanco ? `<dl class="stratagem-copy"><dt>Blanco</dt><dd>${escapeHtml(node.blanco)}</dd></dl>` : ''}
        ${node.efecto ? `<dl class="stratagem-copy"><dt>Efecto</dt><dd>${escapeHtml(node.efecto)}</dd></dl>` : ''}
        ${node.restricciones ? `<dl class="stratagem-copy"><dt>Restricciones</dt><dd>${escapeHtml(node.restricciones)}</dd></dl>` : ''}
        ${nodeCopy(node) ? `<p>${escapeHtml(nodeCopy(node))}</p>` : ''}
        ${isRule ? `<button class="sheet-full-link" type="button" data-open-full="${escapeAttr(node.id)}">Leer sección completa</button>` : ''}
        ${refs.length ? `<div class="sheet-refs"><strong>Ver también:</strong>${refs.map((ref) => `<button type="button" class="chip" data-ref="${escapeAttr(ref)}">${escapeHtml(ref)}</button>`).join('')}</div>` : ''}
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
