import { getAllNodes } from './data.js';

let index = [];
const HISTORY_KEY = '40k-11e-search-history';

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\[\]]/g, '')
    .toLowerCase();
}

function searchableText(node) {
  return [
    node.titulo,
    node.nombre,
    node.etiqueta,
    node.texto,
    node.definicion,
    node.cuando,
    node.blanco,
    node.efecto,
    node.restricciones,
    node.nota,
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildSearchIndex() {
  index = getAllNodes().map((node) => ({
    node,
    text: normalize(searchableText(node)),
  }));
}

export function search(query, mode = 'mesa') {
  const normalized = normalize(query).trim();
  if (!normalized) return [];
  return index
    .filter(({ node, text }) => mode === 'estudio' || !node.no_confirmado)
    .filter(({ text }) => text.includes(normalized))
    .map(({ node }) => node);
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function remember(query) {
  const value = query.trim();
  if (!value) return;
  const next = [value, ...getHistory().filter((item) => item !== value)].slice(0, 6);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function normalizeSearch(value) {
  return normalize(value);
}
