#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const files = ['rules.json', 'abilities.json', 'stratagems.json', 'keywords.json', 'tables.json'];
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
