const DATA_FILES = {
  rules: '../data/rules.json',
  abilities: '../data/abilities.json',
  stratagems: '../data/stratagems.json',
  keywords: '../data/keywords.json',
  tables: '../data/tables.json',
};

let dataCache;
let nodeIndex;

export async function loadData() {
  if (dataCache) return dataCache;
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`No se pudo cargar ${url}: ${response.status}`);
      return [key, await response.json()];
    }),
  );
  dataCache = Object.fromEntries(entries);
  nodeIndex = new Map();
  indexData(dataCache.rules.reglas, 'regla');
  indexData(dataCache.rules.actualizaciones, 'actualizacion');
  indexData(dataCache.rules.no_confirmados, 'regla');
  indexData(dataCache.abilities.habilidades, 'habilidad');
  indexData(dataCache.stratagems.estratagemas, 'estratagema');
  indexData(dataCache.keywords.claves, 'clave');
  indexData(dataCache.tables.tablas, 'tabla');
  return dataCache;
}

function indexData(nodes, type) {
  nodes.forEach((node) => {
    nodeIndex.set(node.id, { ...node, tipo: type });
    if (Array.isArray(node.pasos)) indexData(node.pasos, 'paso');
    if (Array.isArray(node.filas)) {
      node.filas.forEach((row) => nodeIndex.set(row.id, { ...row, tipo: 'fila' }));
    }
  });
}

export function getNode(id) {
  if (nodeIndex?.has(id)) return nodeIndex.get(id);
  return [...(nodeIndex?.values() || [])].find((node) => node.cita === id);
}

export function getAllNodes() {
  return [...(nodeIndex?.values() || [])];
}

export function getData() {
  return dataCache;
}

export function getPhaseRule(phase) {
  const ids = {
    mando: '08',
    movimiento: '09',
    disparo: '10',
    carga: '11',
    combate: '12',
  };
  return getNode(ids[phase]);
}

export function getTable(id) {
  return getNode(`tabla:${id}`) || getNode(id);
}

export function isRenderable(node, mode) {
  return mode === 'estudio' || node?.no_confirmado !== true;
}
