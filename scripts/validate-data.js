#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const files = [
  'rules.json',
  'abilities.json',
  'stratagems.json',
  'keywords.json',
  'tables.json',
  'formulas.json',
];
const ids = new Map();
const refs = [];
const errors = [];
let parsedFiles = 0;

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function walk(value, location) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${location}[${index}]`));
    return;
  }
  if (!isObject(value)) return;

  if (typeof value.id === 'string') {
    if (ids.has(value.id)) {
      errors.push(`duplicate id "${value.id}" at ${location}; first seen at ${ids.get(value.id)}`);
    } else {
      ids.set(value.id, location);
    }
    if (typeof value.cita !== 'string' && value.no_confirmado !== true) {
      errors.push(`${location} (${value.id}) must have cita or no_confirmado: true`);
    }
    if (value.ver_tambien !== undefined) {
      if (!Array.isArray(value.ver_tambien)) {
        errors.push(`${location} (${value.id}) ver_tambien must be an array`);
      } else {
        value.ver_tambien.forEach((target, index) => {
          if (typeof target !== 'string') {
            errors.push(`${location}.ver_tambien[${index}] must be an id string`);
          } else {
            refs.push({ source: value.id, target, location: `${location}.ver_tambien[${index}]` });
          }
        });
      }
    }
  }

  for (const [key, child] of Object.entries(value)) {
    if (key !== 'ver_tambien') walk(child, `${location}.${key}`);
  }
}

function validateTableColumns(data) {
  if (!Array.isArray(data.tablas)) return;
  const technicalKeys = new Set(['id', 'cita', 'pagina']);
  data.tablas.forEach((table, index) => {
    const location = `tables.json.tablas[${index}]`;
    const rows = Array.isArray(table.filas) ? table.filas : [];
    if (!rows.length) return;
    if (!isObject(table.columnas) || Array.isArray(table.columnas)) {
      errors.push(`${location} (${table.id}) must define columnas for every row key`);
      return;
    }
    const rowKeys = new Set(rows.flatMap((row) => Object.keys(row)));
    rowKeys.forEach((key) => {
      if (technicalKeys.has(key)) return;
      if (typeof table.columnas[key] !== 'string' || !table.columnas[key].trim()) {
        errors.push(`${location} (${table.id}) is missing a label for row key "${key}"`);
      }
    });
    Object.keys(table.columnas).forEach((key) => {
      if (technicalKeys.has(key)) {
        errors.push(`${location} (${table.id}) must not label technical row key "${key}"`);
      }
    });
  });
}

function validateFormulas(data) {
  const phases = ['mando', 'movimiento', 'disparo', 'carga', 'combate'];
  if (!isObject(data.fases)) {
    errors.push('formulas.json must define fases');
    return;
  }
  phases.forEach((phase) => {
    const section = data.fases[phase];
    const location = `formulas.json.fases.${phase}`;
    if (!isObject(section)) {
      errors.push(`${location} is required`);
      return;
    }
    if (typeof section.resumen !== 'string' || !section.resumen.trim()) {
      errors.push(`${location} must define a resumen`);
    }
    if (!Array.isArray(section.formulas) || !section.formulas.length) {
      errors.push(`${location} must define formulas`);
      return;
    }
    section.formulas.forEach((formula, index) => {
      const formulaLocation = `${location}.formulas[${index}]`;
      if (!isObject(formula)) {
        errors.push(`${formulaLocation} must be an object`);
        return;
      }
      ['id', 'titulo', 'formula'].forEach((field) => {
        if (typeof formula[field] !== 'string' || !formula[field].trim()) {
          errors.push(`${formulaLocation} must define ${field}`);
        }
      });
      const cited = typeof formula.cita === 'string' && formula.cita.trim();
      const unconfirmed =
        formula.no_confirmado === true && typeof formula.nota === 'string' && formula.nota.trim();
      if ((!cited || typeof formula.pagina !== 'number') && !unconfirmed) {
        errors.push(`${formulaLocation} must define cita + pagina or no_confirmado + nota`);
      }
    });
  });
}

for (const file of files) {
  const filename = path.join(dataDir, file);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filename, 'utf8'));
    parsedFiles += 1;
  } catch (error) {
    errors.push(`${file} is not valid JSON: ${error.message}`);
    continue;
  }
  walk(parsed, file);
  if (file === 'tables.json') validateTableColumns(parsed);
  if (file === 'formulas.json') validateFormulas(parsed);
}

for (const ref of refs) {
  if (!ids.has(ref.target)) errors.push(`${ref.location}: target "${ref.target}" does not resolve`);
}

if (errors.length) {
  console.error(`Data validation failed: ${errors.length} error(s)`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Data validation passed: ${parsedFiles} JSON files, ${ids.size} unique ids, ${refs.length} resolved references.`,
);
