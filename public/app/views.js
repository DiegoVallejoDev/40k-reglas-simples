import {
  displayLabel,
  displayTypeLabel,
  getData,
  getNode,
  getPhaseRule,
  getTable,
  getAllNodes,
  isRenderable,
} from './data.js';
import {
  getMode,
  getState,
  canUndo,
  getUndoLabel,
  targetWasUsed,
  wasStratagemUsed,
} from './state.js';
import { getHistory, remember, search } from './search.js';

const PHASE_LABELS = {
  mando: 'Mando',
  movimiento: 'Movimiento',
  disparo: 'Disparo',
  carga: 'Carga',
  combate: 'Combate',
};

const PHASE_TABLES = {
  mando: ['acobardamiento'],
  movimiento: ['coherencia', 'reservas'],
  disparo: ['herir', 'salvaciones', 'criticos', 'cobertura'],
  carga: ['coherencia'],
  combate: ['herir', 'criticos'],
};

export function renderRoute(route) {
  if (route.name === 'fase') return renderPhase(route.params[0] || 'mando');
  if (route.name === 'dashboard') return renderDashboard();
  if (route.name === 'chuleta') return renderCheatSheet();
  if (route.name === 'buscar') return renderSearch();
  if (route.name === 'estudio') return renderStudyIndex();
  if (route.name === 'glosario') return renderGlossary();
  if (route.name === 'regla') return renderFullRule(route.params[0]);
  if (route.name === 'estratagemas') return renderStratagems(route.params[0] || 'mando');
  if (route.name === 'roster') return renderRoster();
  return renderDashboard();
}

function renderDashboard() {
  const state = getState();
  const phase = state.fase || 'mando';
  const phaseRule = getPhaseRule(phase) || getPhaseRule('mando');
  const warnings = state.unidades.filter(
    (unit) => unit.efectivos && unit.bajas >= Math.ceil(unit.efectivos / 2),
  );
  return `
    <section class="view dashboard-view">
      <header class="view-header">
        <div><p class="eyebrow">Modo Mesa · Marcador</p><h1>Marcador de partida</h1></div>
        <span class="citation">08.02 · 08.03</span>
      </header>
      <div class="dashboard-grid">
        <article class="dashboard-card"><p class="eyebrow">Ronda</p><div class="dashboard-value">R${state.ronda}</div><div class="dashboard-controls"><button class="secondary-button" data-action="end-turn">FIN TURNO</button></div></article>
        <article class="dashboard-card"><p class="eyebrow">Puntos de mando</p><div class="dashboard-value">${state.pm.tu}</div><div class="dashboard-controls"><button class="number-button" data-action="add-pm">+1 PM</button>${canUndo() ? `<button class="undo-button" data-action="undo">↶ ${escapeHtml(getUndoLabel())}</button>` : ''}</div></article>
        <article class="dashboard-card"><p class="eyebrow">PV · tú / rival</p><div class="dashboard-value">${state.pv.tu} / ${state.pv.rival}</div><div class="dashboard-controls"><button class="number-button" data-action="vp-up">+PV</button><button class="number-button" data-action="vp-down">−PV</button></div></article>
      </div>
      <article class="dashboard-card current-phase-card">
        <div class="card-header"><div><p class="eyebrow">Fase actual</p><h2>${escapeHtml(PHASE_LABELS[phase])}</h2></div><a class="primary-button" href="#/fase/${phase}">ABRIR FASE</a></div>
        <div class="active-steps">${phaseRule.pasos
          .filter((step) => isRenderable(step, getMode()))
          .map(
            (step) =>
              `<div class="active-step ${step.id === state.paso ? 'active' : ''}"><span class="phase-number">${escapeHtml(step.id.split('.').at(-1))}</span><span>${escapeHtml(displayLabel(step))}</span><span class="citation">${escapeHtml(step.cita)}</span></div>`,
          )
          .join('')}</div>
      </article>
      ${warnings.length && state.turno === 'tu_turno' ? `<article class="dashboard-card warning-card" style="margin-top:.7rem"><h2>Acobardamiento pendiente</h2><p>Estas unidades están a mitad de efectivos o por debajo: ${warnings.map((unit) => escapeHtml(unit.nombre)).join(', ')}.</p><span class="citation">08.03</span></article>` : ''}
      <article class="dashboard-card" style="margin-top:.7rem"><h2>Consulta rápida</h2><p class="muted">Elige una fase en la barra inferior. Las reglas, tablas y referencias se cargan desde los datos citados.</p><div class="dashboard-controls"><a class="primary-button" href="#/fase/${phase}">Ir a ${escapeHtml(PHASE_LABELS[phase])}</a><a class="secondary-button" href="#/estratagemas/${phase}">Estratagemas</a></div></article>
    </section>
  `;
}

function renderPhase(phase) {
  const label = PHASE_LABELS[phase] || PHASE_LABELS.mando;
  const rule = getPhaseRule(phase) || getPhaseRule('mando');
  const chips = getData().abilities.habilidades.filter(
    (ability) => ability.fase.includes(phase) || ability.fase.includes('cualquiera'),
  );
  const tables = (PHASE_TABLES[phase] || []).map(getTable).filter(Boolean);
  return `
    <section class="view phase-view" data-current-phase="${phase}">
      <header class="view-header">
        <div class="phase-heading"><img class="phase-icon" src="./svg/${escapeAttr(phase)}.svg" alt="" /><div><p class="eyebrow">Fase de ${label} · Modo Mesa</p><h1>${label}</h1></div></div>
        <button class="primary-button" data-action="open-stratagems" data-phase="${phase}">Estratagemas</button>
      </header>
      ${renderFormulas(phase)}
      <div class="phase-grid">
        ${rule.pasos
          .filter((step) => isRenderable(step, getMode()))
          .map(renderStep)
          .join('')}
      </div>
      ${tables.length ? `<section class="table-grid phase-tables"><h2>Chuleta de fase</h2>${tables.map(renderTable).join('')}</section>` : ''}
      <section class="phase-tools"><strong>En esta fase:</strong>${chips.map((ability) => `<button type="button" class="chip" data-ref="${escapeAttr(ability.id)}">${escapeHtml(displayLabel(ability))}</button>`).join('')}</section>
    </section>
  `;
}

function renderFormulas(phase) {
  const formulas = getData().formulas?.fases?.[phase];
  if (!formulas) return '';
  return `
    <section class="formula-summary" data-phase="${escapeAttr(phase)}" aria-labelledby="formula-summary-title">
      <div class="formula-summary-header">
        <div>
          <p class="eyebrow">Consulta rápida</p>
          <h2 id="formula-summary-title">Fórmulas rápidas</h2>
        </div>
        <p class="formula-sequence">${escapeHtml(formulas.resumen)}</p>
      </div>
      <div class="formula-grid">
        ${formulas.formulas.map(renderFormula).join('')}
      </div>
    </section>
  `;
}

function renderFormula(formula) {
  const references = (formula.ver_tambien || [])
    .map((ref) => {
      const node = getNode(ref);
      if (!node) return '';
      return `<button class="formula-reference" type="button" data-ref="${escapeAttr(ref)}">${escapeHtml(displayLabel(node))}</button>`;
    })
    .join('');
  return `
    <article class="formula-tile">
      <button class="formula-main" type="button" data-ref="${escapeAttr(formula.cita)}" aria-label="Consultar ${escapeAttr(formula.titulo)}">
        <span class="formula-title">${escapeHtml(formula.titulo)}</span>
        <strong class="formula-expression">${escapeHtml(formula.formula)}</strong>
        <span class="citation">${escapeHtml(formula.cita)} · pág. ${escapeHtml(formula.pagina)}</span>
      </button>
      ${references ? `<div class="formula-links"><span>Ver también:</span>${references}</div>` : ''}
    </article>
  `;
}

function renderStep(step) {
  return `<article class="step-card"><div class="step-card-header"><h2>${escapeHtml(displayLabel(step))}</h2><span class="citation">${escapeHtml(step.cita)}</span></div><p>${escapeHtml(step.texto)}</p></article>`;
}

function renderTable(table) {
  const rows = table.filas || [];
  const columns = Object.entries(table.columnas || {}).filter(([key]) =>
    rows.some((row) => key in row),
  );
  return `<article class="table-card"><div class="card-header"><h3>${escapeHtml(table.nombre)}</h3><span class="citation">${escapeHtml(table.cita)}</span></div>${rows.length ? `<table><thead><tr>${columns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map(([key]) => `<td>${escapeHtml(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>` : ''}${table.nota ? `<p class="source-line">${escapeHtml(table.nota)}</p>` : ''}</article>`;
}

function renderStratagems(phase) {
  const label = PHASE_LABELS[phase] || PHASE_LABELS.mando;
  const stratagems = getData().stratagems.estratagemas.filter((stratagem) =>
    stratagem.fase.includes(phase),
  );
  const state = getState();
  const player = state.turno === 'tu_turno' ? 'tu' : 'rival';
  return `
    <section class="view stratagem-view">
      <header class="view-header"><div><p class="eyebrow">Estratagemas · ${label}</p><h1>Estratagemas</h1></div><span class="citation">15.01</span></header>
      ${canUndo() ? `<div class="dashboard-controls"><button class="undo-button" data-action="undo">↶ ${escapeHtml(getUndoLabel())}</button></div>` : ''}
      <div class="filter-row" role="group" aria-label="Filtro de turno"><button class="filter-button active" data-strat-turn="all">Todas</button><button class="filter-button" data-strat-turn="tu_turno">Mi turno</button><button class="filter-button" data-strat-turn="turno_rival">Rival</button></div>
      <div class="dashboard-controls"><label class="source-line" for="target-filter">Unidad objetivo (opcional)</label><input class="search-input" id="target-filter" data-strat-target placeholder="Nombre o identificador"></div>
      <div class="stratagem-list" data-strat-list data-phase="${phase}" data-player="${player}">${stratagems.map((stratagem) => renderStratagem(stratagem, phase)).join('')}</div>
    </section>
  `;
}

function renderStratagem(stratagem, phase) {
  const state = getState();
  const used = wasStratagemUsed(stratagem.id, phase);
  const insufficient = state.pm.tu < stratagem.pm;
  const momentAllowed =
    stratagem.momento.tipo === 'cualquiera' || stratagem.momento.tipo === state.turno;
  const reason = used
    ? 'Ya usada en esta fase (15.01).'
    : insufficient
      ? `Necesitas ${stratagem.pm} PM.`
      : !momentAllowed
        ? state.turno === 'tu_turno'
          ? 'Solo puede usarse durante el turno rival.'
          : 'Solo puede usarse durante tu turno.'
        : '';
  const showFlavor = getMode() === 'estudio';
  return `
    <article class="stratagem-card ${reason ? 'ineligible' : ''} ${used ? 'used' : ''}" data-stratagem-id="${escapeAttr(stratagem.id)}" data-momento="${stratagem.momento.tipo}" data-cost="${stratagem.pm}" data-target="${escapeAttr(stratagem.blanco)}" data-used="${used}">
      <div class="card-header"><h2>${escapeHtml(stratagem.nombre)}</h2><span class="pm-cost">${stratagem.pm} PM</span></div>
      <div class="stratagem-meta"><span>${stratagem.momento.paso}</span><span class="citation">${stratagem.cita}</span></div>
      <dl class="stratagem-copy"><dt>Cuándo</dt><dd>${escapeHtml(stratagem.cuando)}</dd><dt>Blanco</dt><dd>${escapeHtml(stratagem.blanco)}</dd><dt>Efecto</dt><dd>${escapeHtml(stratagem.efecto)}</dd>${stratagem.restricciones ? `<dt>Restricciones</dt><dd>${escapeHtml(stratagem.restricciones)}</dd>` : ''}</dl>
      <div class="stratagem-actions"><span class="reason">${escapeHtml(reason)}</span><button class="primary-button" data-action="use-stratagem" data-id="${escapeAttr(stratagem.id)}" ${reason ? 'disabled' : ''}>USAR · −${stratagem.pm} PM</button></div>
      ${showFlavor ? `<div class="flavor-text"><p class="source-line">${escapeHtml(stratagem.flavor)}</p></div>` : ''}
    </article>
  `;
}

function renderCheatSheet() {
  return `<section class="view"><header class="view-header"><div><p class="eyebrow">Modo Mesa · Referencia</p><h1>Chuleta</h1></div><span class="citation">05 · 13 · 14 · 20</span></header><div class="table-grid">${getData()
    .tables.tablas.filter((table) => isRenderable(table, getMode()))
    .map(renderTable)
    .join('')}</div></section>`;
}

function renderSearch() {
  return `<section class="view search-view"><header class="view-header"><div><p class="eyebrow">Búsqueda global</p><h1>Buscar</h1></div></header><form class="search-form" data-search-form><input class="search-input" name="query" placeholder="Buscar área, cobertura, estratagema…" autocomplete="off" aria-label="Buscar en las reglas" /><button class="primary-button" type="submit">Buscar</button></form><div class="search-history">${getHistory()
    .map(
      (term) =>
        `<button class="chip" type="button" data-history="${escapeAttr(term)}">${escapeHtml(term)}</button>`,
    )
    .join(
      '',
    )}</div><div class="search-groups" data-search-results><p class="empty-state">Escribe una duda para buscar en el texto literal.</p></div></section>`;
}

function renderStudyIndex() {
  if (getMode() !== 'estudio') {
    return '<section class="empty-state"><h1>Modo Estudio</h1><p>Activa el Modo Estudio para leer el índice completo.</p></section>';
  }
  const sections = getData().rules.reglas.filter((section) => isRenderable(section, 'estudio'));
  return `<section class="view"><header class="view-header"><div><p class="eyebrow">Modo Estudio · Índice</p><h1>Índice de reglas</h1></div><span class="citation">01–24</span></header><div class="study-grid">${sections.map((section) => `<article class="study-section"><a href="#/regla/${section.id}"><strong>${escapeHtml(section.cita)} · ${escapeHtml(displayLabel(section))}</strong><span class="citation">pág. ${section.pagina}</span></a></article>`).join('')}</div><div class="study-grid study-only">${getData()
    .rules.no_confirmados.map(
      (node) =>
        `<article class="unconfirmed-block"><div class="unconfirmed-label">Sin confirmar en las fuentes</div><strong>${escapeHtml(displayLabel(node))}</strong><p>${escapeHtml(node.nota)}</p></article>`,
    )
    .join('')}</div></section>`;
}

function renderGlossary() {
  if (getMode() !== 'estudio') {
    return '<section class="empty-state"><h1>Glosario</h1><p>Activa el Modo Estudio para consultar habilidades y claves.</p></section>';
  }
  const data = getData();
  return `<section class="view"><header class="view-header"><div><p class="eyebrow">Modo Estudio · Glosario</p><h1>Glosario</h1></div><span class="citation">24 · 02.05</span></header><div class="study-grid">${data.abilities.habilidades.map((node) => `<article class="study-section"><button class="chip" data-ref="${escapeAttr(node.id)}">${escapeHtml(displayLabel(node))}</button><span class="citation">${node.cita}</span></article>`).join('')}${data.keywords.claves.map((node) => `<article class="study-section"><button class="chip" data-ref="${escapeAttr(node.id)}">${escapeHtml(displayLabel(node))}</button><span class="citation">${node.cita}</span>${node.no_confirmado ? `<div class="unconfirmed-block"><div class="unconfirmed-label">Sin confirmar en las fuentes</div><p>${escapeHtml(node.nota)}</p></div>` : ''}</article>`).join('')}</div></section>`;
}

function renderFullRule(id) {
  const section = getNode(id);
  if (!section)
    return '<section class="empty-state">No se encontró el contenido solicitado.</section>';
  if (section.no_confirmado && getMode() !== 'estudio') {
    return '<section class="empty-state"><h1>Contenido no disponible en Modo Mesa</h1><p>Esta afirmación no está confirmada en las fuentes suministradas.</p></section>';
  }
  if (!section.pasos) {
    return `<section class="view study-view"><header class="view-header"><div><p class="eyebrow">Modo Estudio · ${escapeHtml(displayTypeLabel(section.tipo || 'regla'))}</p><h1>${escapeHtml(displayLabel(section))}</h1></div><span class="citation">${escapeHtml(section.cita || 'Sin cita')} · pág. ${section.pagina || '—'}</span></header><p>${escapeHtml(section.texto || section.definicion || section.nota || '')}</p></section>`;
  }
  return `<section class="view study-view"><header class="view-header"><div><p class="eyebrow">Modo Estudio · ${escapeHtml(displayTypeLabel(section.tipo || 'regla'))}</p><h1>${escapeHtml(displayLabel(section))}</h1></div><span class="citation">${escapeHtml(section.cita)} · pág. ${section.pagina}</span></header><p>${escapeHtml(section.texto || '')}</p><div class="phase-grid">${(
    section.pasos || []
  )
    .filter((step) => isRenderable(step, 'estudio'))
    .map(renderStep)
    .join(
      '',
    )}</div>${section.ejemplos?.length && getMode() === 'estudio' ? `<section><h2>Ejemplos</h2>${section.ejemplos.map((example) => `<p>${escapeHtml(example)}</p>`).join('')}</section>` : ''}${section.no_confirmado ? `<div class="unconfirmed-block"><div class="unconfirmed-label">Sin confirmar en las fuentes</div><p>${escapeHtml(section.nota || '')}</p></div>` : ''}</section>`;
}

function renderRoster() {
  if (getMode() !== 'estudio') {
    return '<section class="view"><header class="view-header"><div><p class="eyebrow">Modo Mesa · Ejército</p><h1>Mi ejército</h1></div></header><p class="empty-state">La gestión del ejército estará disponible en una fase posterior.</p></section>';
  }
  return `<section class="view"><header class="view-header"><div><p class="eyebrow">Modo Estudio · Ejército</p><h1>Mi ejército</h1></div><span class="citation">Sin confirmar en las fuentes</span></header><article class="unconfirmed-block"><div class="unconfirmed-label">Ejército sin validación</div><p>Las fuentes suministradas no contienen reglas de destacamentos, puntos, mejoras ni límites de lista. Esta superficie queda preparada para una fase posterior.</p></article></section>`;
}

export function bindViewEvents(root, actions) {
  root.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => actions(button.dataset.action, button));
  });
  root.querySelectorAll('[data-strat-turn]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-strat-turn]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      filterStratagems(
        root,
        button.dataset.stratTurn,
        root.querySelector('[data-strat-target]')?.value || '',
      );
    });
  });
  root.querySelector('[data-strat-target]')?.addEventListener('input', (event) => {
    const selected = root.querySelector('.filter-button.active')?.dataset.stratTurn || 'all';
    filterStratagems(root, selected, event.target.value);
  });
  root.querySelector('[data-search-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('query');
    remember(String(query));
    renderSearchResults(root, String(query));
  });
  root.querySelectorAll('[data-history]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelector('[name="query"]').value = button.dataset.history;
      renderSearchResults(root, button.dataset.history);
    });
  });
}

function filterStratagems(root, turnFilter, targetFilter) {
  const phase = root.querySelector('[data-strat-list]')?.dataset.phase || 'mando';
  root.querySelectorAll('[data-stratagem-id]').forEach((card) => {
    const momentMatch =
      turnFilter === 'all' ||
      card.dataset.momento === 'cualquiera' ||
      card.dataset.momento === turnFilter;
    const targetAlreadyUsed = targetFilter && targetWasUsed(targetFilter.trim(), phase);
    const used = card.dataset.used === 'true';
    const reason = card.querySelector('.reason');
    const stratagem = getData().stratagems.estratagemas.find(
      (item) => item.id === card.dataset.stratagemId,
    );
    const insufficient = getState().pm.tu < Number(card.dataset.cost);
    const actualMomentAllowed =
      stratagem.momento.tipo === 'cualquiera' || stratagem.momento.tipo === getState().turno;
    const failures = [];
    if (used) failures.push('Ya usada en esta fase (15.01).');
    else if (insufficient) failures.push(`Necesitas ${card.dataset.cost} PM.`);
    else if (!actualMomentAllowed) {
      failures.push(
        getState().turno === 'tu_turno'
          ? 'Solo puede usarse durante el turno rival.'
          : 'Solo puede usarse durante tu turno.',
      );
    }
    if (!momentMatch)
      failures.push(
        `El filtro requiere ${turnFilter === 'tu_turno' ? 'tu turno' : 'el turno rival'}.`,
      );
    if (targetAlreadyUsed)
      failures.push('Esa unidad ya fue blanco de otra estratagema en esta fase (15.01).');
    const shouldDim = failures.length > 0;
    card.classList.toggle('ineligible', shouldDim);
    card.classList.toggle('used', used);
    const button = card.querySelector('[data-action="use-stratagem"]');
    if (button) button.disabled = shouldDim;
    if (reason) reason.textContent = failures.join(' ');
  });
}

function renderSearchResults(root, query) {
  const results = search(query, getMode());
  const container = root.querySelector('[data-search-results]');
  if (!results.length) {
    container.innerHTML = `<p class="empty-state">Sin resultados para «${escapeHtml(query)}».</p>`;
    return;
  }
  const groups = results.reduce((acc, node) => {
    const type = node.tipo || 'regla';
    (acc[type] ||= []).push(node);
    return acc;
  }, {});
  container.innerHTML = Object.entries(groups)
    .map(
      ([type, nodes]) =>
        `<section><h2>${escapeHtml(displayTypeLabel(type, true))}</h2>${nodes
          .slice(0, 20)
          .map(
            (node) =>
              `<button class="search-result" type="button" data-ref="${escapeAttr(node.id)}"><span class="search-result-type">${escapeHtml(node.cita || 'Sin cita')}</span><strong>${escapeHtml(displayLabel(node))}</strong><div class="search-result-text">${escapeHtml((node.texto || node.definicion || node.efecto || node.nota || '').slice(0, 180))}</div></button>`,
          )
          .join('')}</section>`,
    )
    .join('');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
