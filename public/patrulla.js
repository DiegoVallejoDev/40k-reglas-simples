/**
 * Combat Patrol - Dynamic Rendering System
 * Loads faction data from patrols.json and renders UI dynamically
 */

// ============================================================================
// Global State
// ============================================================================

let patrolData = null;
let currentFaction = null;

// ============================================================================
// Data Loading
// ============================================================================

async function loadPatrolData() {
  try {
    const response = await fetch('./patrols.json');
    if (!response.ok) throw new Error('Failed to load patrol data');
    patrolData = await response.json();
    return patrolData;
  } catch (error) {
    console.error('Error loading patrol data:', error);
    return null;
  }
}

// ============================================================================
// Faction Tab Rendering
// ============================================================================

function renderFactionTabs() {
  const tabsContainer = document.getElementById('faction-tabs');
  if (!tabsContainer || !patrolData) return;

  tabsContainer.innerHTML = patrolData.factions.map(faction => `
    <div class="faction-tab tab ${faction.id === currentFaction ? 'active' : ''}" 
         data-faction="${faction.id}"
         onclick="showFaction('${faction.id}')"
         style="--faction-color: ${faction.color}">
      <i class="fa-solid ${faction.icon}"></i>
      ${faction.faction}
    </div>
  `).join('');
}

// ============================================================================
// Faction Content Rendering
// ============================================================================

function showFaction(factionId) {
  currentFaction = factionId;
  localStorage.setItem('selectedPatrolFaction', factionId);
  
  // Update tab states
  document.querySelectorAll('.faction-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.faction === factionId);
  });
  
  // Render content
  renderFactionContent(factionId);
}

function renderFactionContent(factionId) {
  const contentContainer = document.getElementById('faction-content');
  if (!contentContainer || !patrolData) return;

  const faction = patrolData.factions.find(f => f.id === factionId);
  if (!faction) return;

  contentContainer.innerHTML = `
    <div class="faction-content active" style="--faction-color: ${faction.color}; --faction-color-dark: ${faction.colorDark}">
      <!-- Header -->
      <div class="phase-title" style="color: ${faction.color}">
        ${faction.name.toUpperCase()} - ${faction.faction.toUpperCase()}
      </div>

      <!-- Faction Ability -->
      ${renderFactionAbility(faction)}

      <!-- Options Section -->
      ${renderOptionsSection(faction)}

      <!-- Datacards -->
      ${renderDatacards(faction)}

      <!-- Stratagems -->
      ${renderStratagems(faction)}
    </div>
  `;

  // Setup dropdown listeners
  setupDropdownListeners(faction);
}

// ============================================================================
// Component Renderers
// ============================================================================

function renderFactionAbility(faction) {
  return `
    <div class="special-rule" style="border-left: 0.25rem solid ${faction.color}">
      <div class="special-rule-title">
        Habilidad de Facción: ${faction.factionAbility.name}
      </div>
      <div class="list-item">
        ${faction.factionAbility.description}
      </div>
    </div>
  `;
}

function renderOptionsSection(faction) {
  const enhancementDefault = faction.enhancements.find(e => e.default);
  const secondaryDefault = faction.secondaries.find(s => s.default);
  
  return `
    <div class="options-section">
      <div class="special-rule-title">Mejoras</div>
      
      <select class="option-dropdown" id="${faction.id}-enhancement-select" 
              data-faction="${faction.id}" data-type="enhancement">
        ${faction.enhancements.map(e => `
          <option value="${e.id}" ${e.default ? 'selected' : ''}>
            ${e.name} ${e.default ? '(Defecto)' : '(Opcional)'}
          </option>
        `).join('')}
      </select>

      <div class="option-description-box">
        ${faction.enhancements.map(e => `
          <div id="desc-${faction.id}-${e.id}" class="option-desc" 
               style="display: ${e.default ? 'block' : 'none'};">
            <strong>${e.name}:</strong>
            <p>${e.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="special-rule-title" style="margin-top: 1rem">Objetivo Secundario</div>
      
      <select class="option-dropdown" id="${faction.id}-secondary-select" 
              data-faction="${faction.id}" data-type="secondary">
        ${faction.secondaries.map(s => `
          <option value="${s.id}" ${s.default ? 'selected' : ''}>
            ${s.name} ${s.default ? '(Defecto)' : '(Opcional)'}
          </option>
        `).join('')}
      </select>

      <div class="option-description-box">
        ${faction.secondaries.map(s => `
          <div id="desc-${faction.id}-${s.id}" class="option-desc" 
               style="display: ${s.default ? 'block' : 'none'};">
            <strong>${s.name}:</strong>
            <p>${s.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDatacards(faction) {
  const headerClass = faction.id.includes('tiranidos') ? 'tyranid-header' : 
                      faction.id === 'orkos' ? 'ork-header' :
                      faction.id === 'spacemarines' ? 'marine-header' : 'necron-header';
  
  return `
    <div class="datacards-section">
      <div class="special-rule-title">Unidades</div>
      <div class="datacards-grid">
        ${faction.units.map(unit => renderDatacard(unit, faction, headerClass)).join('')}
      </div>
    </div>
  `;
}

function renderDatacard(unit, faction, headerClass) {
  // Filter abilities to exclude Invulnerable mentions (avoid duplication)
  const filteredAbilities = unit.abilities ? unit.abilities.filter(a => 
    !a.toLowerCase().includes('invulnerable') && 
    !a.match(/^inv\s*\d/i)
  ) : [];
  
  // Check for invuln save
  const hasInvuln = unit.invuln;
  
  return `
    <div class="datacard">
      <div class="datacard-header ${headerClass}">
        <span class="datacard-name">${unit.name}</span>
        <span class="datacard-keywords">${unit.keywords.join(', ')}</span>
      </div>
      <div class="datacard-stats">
        <div class="stat"><span class="stat-label">M</span><span class="stat-value">${unit.stats.M}</span></div>
        <div class="stat"><span class="stat-label">R</span><span class="stat-value">${unit.stats.R}</span></div>
        <div class="stat stat-save-container">
          <span class="stat-label">S</span>
          <span class="stat-value">${unit.stats.S}</span>
          ${hasInvuln ? `<span class="invuln-badge">${unit.invuln}</span>` : ''}
        </div>
        <div class="stat"><span class="stat-label">H</span><span class="stat-value">${unit.stats.H}</span></div>
        <div class="stat"><span class="stat-label">Ld</span><span class="stat-value">${unit.stats.L}</span></div>
        <div class="stat"><span class="stat-label">CO</span><span class="stat-value">${unit.stats.CO}</span></div>
      </div>
      <div class="datacard-weapons">
        ${renderWeaponsSection(unit.weapons)}
      </div>
      ${filteredAbilities.length > 0 ? `
        <div class="datacard-abilities">
          ${filteredAbilities.map(a => `<span class="ability-tag">${a}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderWeaponsSection(weapons) {
  let html = '';
  
  if (weapons.ranged && weapons.ranged.length > 0) {
    html += `
      <div class="weapon-section">
        <div class="weapon-section-title">Disparo</div>
        <table class="weapon-table">
          <thead>
            <tr>
              <th>Arma</th>
              <th class="text-center">Alc</th>
              <th class="text-center">A</th>
              <th class="text-center">HP</th>
              <th class="text-center">F</th>
              <th class="text-center">FP</th>
              <th class="text-center">D</th>
            </tr>
          </thead>
          <tbody>
            ${weapons.ranged.map(w => `
              <tr>
                <td class="weapon-name-cell">${w.name}</td>
                <td class="weapon-stat-cell">${w.range}</td>
                <td class="weapon-stat-cell">${w.A}</td>
                <td class="weapon-stat-cell">${w.BS}</td>
                <td class="weapon-stat-cell">${w.S}</td>
                <td class="weapon-stat-cell">${w.AP}</td>
                <td class="weapon-stat-cell">${w.D}</td>
              </tr>
              ${w.abilities ? `<tr><td colspan="7" class="weapon-abilities-cell">${w.abilities}</td></tr>` : ''}
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  if (weapons.melee && weapons.melee.length > 0) {
    html += `
      <div class="weapon-section">
        <div class="weapon-section-title">Combate</div>
        <table class="weapon-table">
          <thead>
            <tr>
              <th>Arma</th>
              <th class="text-center">Alc</th>
              <th class="text-center">A</th>
              <th class="text-center">HA</th>
              <th class="text-center">F</th>
              <th class="text-center">FP</th>
              <th class="text-center">D</th>
            </tr>
          </thead>
          <tbody>
            ${weapons.melee.map(w => `
              <tr>
                <td class="weapon-name-cell">${w.name}</td>
                <td class="weapon-stat-cell">CaC</td>
                <td class="weapon-stat-cell">${w.A}</td>
                <td class="weapon-stat-cell">${w.WS}</td>
                <td class="weapon-stat-cell">${w.S}</td>
                <td class="weapon-stat-cell">${w.AP}</td>
                <td class="weapon-stat-cell">${w.D}</td>
              </tr>
              ${w.abilities ? `<tr><td colspan="7" class="weapon-abilities-cell">${w.abilities}</td></tr>` : ''}
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  return html || '<div class="weapon-section"><em>Sin armas especiales</em></div>';
}

function renderStratagems(faction) {
  // Get faction color
  const factionColor = faction.color;
  
  return `
    <div class="stratagems-section">
      <div class="special-rule-title">Estratagemas: ${faction.name}</div>
      <div class="stratagem-container">
        ${faction.stratagems.map(strat => {
          const phases = detectPhases(strat.when);
          const phaseSymbols = phases.map(phase => 
            `<div class="when-symbol" style="background-color: ${factionColor}; box-shadow: 1px 1px 3px ${factionColor};">
              <img src="./svg/${phase}.svg" alt="${phase}" loading="lazy" class="phase-icon">
            </div>`
          ).join('');
          
          return `
          <article class="card" role="region" aria-label="${strat.name}">
            <div class="left-border" style="background-color: ${factionColor}">
              ${phaseSymbols}
              <div class="cost-diamond" style="background-color: ${factionColor}; box-shadow: 1px 1px 3px ${factionColor};">
                <span class="cost-text">${strat.cost} PM</span>
              </div>
            </div>
            <div class="content">
              <div class="title" style="color: ${factionColor}">${strat.name}</div>
              <div class="subtitle">Patrulla de Combate</div>
              <div class="dotted-line"></div>
              <div class="rule-section">
                <div class="rule-label"><span style="color: ${factionColor}">CUÁNDO</span>:</div>
                <div class="rule-text">${strat.when}</div>
              </div>
              <div class="rule-section">
                <div class="rule-label"><span style="color: ${factionColor}">EFECTO</span>:</div>
                <div class="rule-text">${strat.effect}</div>
              </div>
            </div>
          </article>
        `}).join('')}
      </div>
    </div>
  `;
}

/**
 * Detect which phases a stratagem can be used in based on the "when" text
 * Returns array of SVG filenames (without extension)
 */
function detectPhases(whenText) {
  const phases = [];
  const text = whenText.toLowerCase();
  
  // Check for each phase
  if (text.includes('mando') || text.includes('command')) {
    phases.push('mando');
  }
  if (text.includes('movimiento') || text.includes('movement')) {
    phases.push('movimiento');
  }
  if (text.includes('disparo') || text.includes('shooting')) {
    phases.push('disparo');
  }
  if (text.includes('carga') || text.includes('charge')) {
    phases.push('carga');
  }
  if (text.includes('combate') || text.includes('fight') || text.includes('melee')) {
    phases.push('combate');
  }
  
  // Default to combate if no phase detected
  if (phases.length === 0) {
    phases.push('combate');
  }
  
  return phases;
}

// ============================================================================
// Dropdown Interactivity
// ============================================================================

function setupDropdownListeners(faction) {
  const dropdowns = document.querySelectorAll('.option-dropdown');
  
  dropdowns.forEach(dropdown => {
    // Restore from localStorage
    const factionId = dropdown.dataset.faction;
    const type = dropdown.dataset.type;
    const storageKey = `40k_patrulla_${factionId}_${type}`;
    const savedValue = localStorage.getItem(storageKey);
    
    if (savedValue) {
      const optionExists = Array.from(dropdown.options).some(opt => opt.value === savedValue);
      if (optionExists) {
        dropdown.value = savedValue;
        updateOptionDescription(dropdown);
      }
    }
    
    // Add change listener
    dropdown.addEventListener('change', () => {
      updateOptionDescription(dropdown);
    });
  });
}

function updateOptionDescription(dropdown) {
  const factionId = dropdown.dataset.faction;
  const selectedValue = dropdown.value;
  const type = dropdown.dataset.type;
  
  // Get the description box (next sibling)
  const descriptionBox = dropdown.nextElementSibling;
  if (!descriptionBox || !descriptionBox.classList.contains('option-description-box')) return;
  
  // Hide all descriptions
  const descs = descriptionBox.querySelectorAll('.option-desc');
  descs.forEach(desc => desc.style.display = 'none');
  
  // Show selected
  const targetDesc = document.getElementById(`desc-${factionId}-${selectedValue}`);
  if (targetDesc) {
    targetDesc.style.display = 'block';
  }
  
  // Save to localStorage
  const storageKey = `40k_patrulla_${factionId}_${type}`;
  localStorage.setItem(storageKey, selectedValue);
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

function setupKeyboardNavigation() {
  document.querySelectorAll('.faction-tab').forEach(tab => {
    tab.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
    tab.setAttribute('tabindex', '0');
    tab.setAttribute('role', 'tab');
  });
  
  // Number shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    
    if (patrolData && patrolData.factions[parseInt(e.key) - 1]) {
      showFaction(patrolData.factions[parseInt(e.key) - 1].id);
    }
  });
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', async function() {
  // Load data
  await loadPatrolData();
  
  if (!patrolData) {
    document.getElementById('faction-content').innerHTML = '<p>Error loading patrol data.</p>';
    return;
  }
  
  // Restore or default faction
  currentFaction = localStorage.getItem('selectedPatrolFaction') || patrolData.factions[0].id;
  
  // Render UI
  renderFactionTabs();
  renderFactionContent(currentFaction);
  setupKeyboardNavigation();
});
