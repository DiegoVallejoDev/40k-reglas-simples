

const stratagems = {
  "Repetición de Mando": {
    "name": "Repetición de Mando",
    "type": "Básica",
    "category": "Táctica de Batalla",
    "flavorText": undefined,
    "when": "En cualquier fase, después de que hagas por un ataque, miniatura o unidad de tu ejército una tirada para impactar, para herir, de Daño, de salvación, de avanzar, de carga, para determinar el número de ataques de un arma o un chequeo de huida desesperada o de riesgo.",
    "target": undefined,
    "effect": "Repites esa tirada, chequeo o tirada de salvación.",
    "cost": "1 PM",
    "color": "#2c5a4d",
    "icons": ["reroll"]
  },
  "Contraofensiva": {
    "name": "Contraofensiva",
    "type": "Básica",
    "category": "Ardid Estratégico",
    "flavorText": undefined,
    "when": "En la fase de combate, justo después de que una unidad enemiga haya combatido.",
    "target": "Una unidad de tu ejército que esté en la zona de amenaza de una o más unidades enemigas y no haya sido elegida ya para combatir en esta fase.",
    "effect": "Tu unidad combate a continuación.",
    "cost": "2 PM",
    "color": "#2c5a4d",
    "icons": ["combate"]
  },
  "Desafío Épico": {
    "name": "Desafío Épico",
    "type": "Básica",
    "category": "Hazaña Épica",
    "flavorText": undefined,
    "when": "En la fase de combate, cuando una unidad Personaje de tu ejército con una o más unidades adjuntas enemigas en su zona de amenaza sea elegida para combatir.",
    "target": "Una miniatura Personaje de tu unidad.",
    "effect": "Hasta el final de la fase, todos los ataques de combate realizados por esa miniatura tienen la habilidad [PRECISIÓN] (pág. 26).",
    "cost": "1 PM",
    "color": "#2c5a4d",
    "icons": ["combate"]
  },
  "Valor Insensato": {
    "name": "Valor Insensato",
    "type": "Básica",
    "category": "Hazaña Épica",
    "flavorText": undefined,
    "when": "En el paso de acobardamiento de tu fase de mando, justo tras fallar un chequeo de acobardamiento para una unidad de tu ejército (pág. 11).",
    "target": "La unidad de tu ejército por la que se acaba de hacer el chequeo de acobardamiento (aunque normalmente tus unidades acobardadas no puedan verse afectadas por tus estratagemas).",
    "effect": "Se considera que tu unidad ha superado el chequeo, y no queda acobardada debido a él.",
    "cost": "1 PM",
    "color": "#224262",
    "icons": ["mando"]
  },
  "Granada": {
    "name": "Granada",
    "type": "Básica",
    "category": "Estratagema de Equipo",
    "flavorText": undefined,
    "when": "En tu fase de disparo.",
    "target": "Una unidad Granadas de tu ejército que esté fuera de la zona de amenaza de todas las unidades enemigas y que no haya sido elegida para disparar en esta fase.",
    "effect": "Elige a una unidad enemiga que no esté en la zona de amenaza de alguna unidad de tu ejército, que esté a 8\" o menos de tu unidad Granadas y que sea visible para ella. Tira seis dados: por cada 4+, esa unidad enemiga sufre 1 herida mortal.",
    "cost": "1 PM",
    "color": "#224262",
    "icons": ["disparo"]
  },
  "Brutalidad Acorazada": {
    "name": "Brutalidad Acorazada",
    "type": "Básica",
    "category": "Ardid Estratégico",
    "flavorText": undefined,
    "when": "En tu fase de carga.",
    "target": "Una unidad Vehículo de tu ejército.",
    "effect": "Hasta el final de la fase, cuando tu unidad termine un movimiento de carga, elige a una unidad enemiga en su zona de amenaza y un arma de combate con la que esté equipada tu unidad. Tira tantos dados como el atributo Fuerza del arma. Si el atributo Fuerza es mayor que el atributo Resistencia de la unidad enemiga, tira 2 dados adicionales. Por cada 5+, la unidad enemiga sufre 1 herida mortal (hasta un máximo de 6).",
    "cost": "1 PM",
    "color": "#224262",
    "icons": ["carga"]
  },
  "Disparos Preventivos": {
    "name": "Disparos Preventivos",
    "type": "Básica",
    "category": "Ardid Estratégico",
    "flavorText": undefined,
    "when": "En la fase de movimiento o de carga del oponente, justo después de que una unidad enemiga sea desplegada o empiece o termine un movimiento normal, de avanzar, de retroceder o de carga.",
    "target": "Una unidad de tu ejército que esté a 24\" o menos de esa unidad enemiga y que podría ser elegida para disparar si fuera tu fase de disparo.",
    "effect": "Tu unidad puede disparar a esa unidad enemiga como si fuera tu fase de disparo.",
    "cost": "1 PM",
    "color": "#a4151f",
    "icons": ["movimiento", "carga"]
  },
  "Inserción Rápida": {
    "name": "Inserción Rápida",
    "type": "Básica",
    "category": "Ardid Estratégico",
    "flavorText": undefined,
    "when": "Al final de la fase de movimiento de tu oponente.",
    "target": "Una unidad de tu ejército en la reserva.",
    "effect": "Tu unidad puede llegar al campo de batalla como si fuera el paso de refuerzos de tu fase de movimiento.",
    "cost": "1 PM",
    "color": "#a4151f",
    "icons": ["movimiento"]
  },
  "Pantalla de Humo": {
    "name": "Pantalla de Humo",
    "type": "Básica",
    "category": "Estratagema de Equipo",
    "flavorText": undefined,
    "when": "En la fase de disparo de tu oponente, justo después de que una unidad enemiga haya elegido blancos.",
    "target": "Una unidad Humo de tu ejército que haya sido elegida como blanco de algún ataque de la unidad enemiga.",
    "effect": "Hasta el final de la fase, todas las miniaturas de tu unidad se benefician de cobertura (pág. 44) y tienen la habilidad Sigilo (pág. 20).",
    "cost": "1 PM",
    "color": "#a4151f",
    "icons": ["movimiento"]
  },
  "Cuerpo a Tierra": {
    "name": "Cuerpo a Tierra",
    "type": "Básica",
    "category": "Táctica de Batalla",
    "flavorText": undefined,
    "when": "En la fase de disparo de tu oponente, justo después de que una unidad enemiga haya elegido blancos.",
    "target": "Una unidad Infantería de tu ejército que haya sido elegida como blanco de uno o más de los ataques de la unidad atacante.",
    "effect": "Hasta el final de la fase, todas las miniaturas de tu unidad tienen una salvación invulnerable de 6+ y tu unidad se beneficia de cobertura (pág. 44).",
    "cost": "1 PM",
    "color": "#a4151f",
    "icons": ["disparo"]
  },
  "Intervención Heroica": {
    "name": "Intervención Heroica",
    "type": "Básica",
    "category": "Ardid Estratégico",
    "flavorText": undefined,
    "when": "En la fase de carga de tu oponente, justo después de que una unidad enemiga termine un movimiento de carga.",
    "target": "Una unidad de tu ejército que esté a 6\" o menos de esa unidad enemiga y que podría ser elegida para cargar contra ella si fuera tu fase de carga.",
    "effect": "Tu unidad declara ahora una carga que tenga como blanco solo a esa unidad enemiga, y resuelves dicha carga como si fuera tu fase de carga.",
    "cost": "2 PM",
    "color": "#a4151f",
    "icons": ["carga"]
  }

};



function stratagemToHTML(stratagem) {
  const { name, type, category, flavorText, when, target, effect, cost, color, icons } = stratagem;
  return `
  <div class="card" id="${name.toLowerCase().replace(/ /g, '-')}" >
    <div class="left-border" style="background-color:${color}">
        ${icons.map(icon =>
    `<div class="when-symbol" style="background-color:${color}; box-shadow: 1px 1px 3px ${color};">
              <img src="./svg/${icon}.svg" alt="${icon}" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            </div>`
  ).join('')
    }
        <div class="cost-diamond" style="background-color:${color}; box-shadow: 1px 1px 3px ${color};">
            <span class="cost-text">${cost}</span>
        </div>
    </div>

    <div class="content">
        <div class="title" style="color:${color}" >${name}</div>
        <div class="subtitle">${type} – ${category}</div>
        <div class="dotted-line"></div>
  
    ${flavorText ? `
            <div class="flavor-text">
                ${flavorText}
            </div>
            <div class="dotted-line"></div>`: ' '
    }
      
    <div class="rule-section">
        <div class="rule-label"> <span style="color:${color}">CUÁNDO</span>:</div>
        <div class="rule-text">${when}</div>
    </div>

    ${target ? `<div class="rule-section">
        <div class="rule-label"> <span style="color:${color}">BLANCO</span>:</div>
        <div class="rule-text"> ${target}</div>
    </div>` : ''}

    <div class="rule-section">
        <div class="rule-label"> <span style="color:${color}">EFECTO</span>:</div>
        <div class="rule-text">${effect}</div>
    </div>

    <div class="dotted-line"></div>
  </div>`
}

document.addEventListener("DOMContentLoaded", function () {
  //add stratagems to body
  const container = document.querySelector(".stratagem-container");

  for (const key in stratagems) {
    const stratagem = stratagems[key];
    const html = stratagemToHTML(stratagem);
    container.innerHTML += html;
  }
})




