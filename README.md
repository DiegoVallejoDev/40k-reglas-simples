# Cartas de Referencia Táctica de Warhammer 40k

<div align="center">

<img src="public/images/warhammer-logo.png" alt="Warhammer 40,000 Logo" width="350">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**Una aplicación web interactiva y completa de referencia táctica para jugadores de Warhammer 40,000**

[Inicio Rápido](#inicio-rápido) • [Documentación](#fases-del-juego) • [Características](#características) • [Instalación](#instalación)

</div>

---

## Acerca de

Esta aplicación web interactiva sirve como una guía de referencia táctica completa para jugadores de **Warhammer 40,000**, cubriendo todas las fases del juego desde Mando hasta Moral. Diseñada tanto para jugadores nuevos como experimentados, proporciona acceso rápido a reglas básicas, estratagemas y mecánicas de combate.

### Beneficios Clave

- **Referencia Completa de Reglas**: Las 6 fases del juego con mecánicas detalladas
- **Navegación Rápida**: Atajos de teclado (1-6) para cambio instantáneo de fase
- **Diseño Interactivo**: Interfaz limpia y responsiva optimizada para el juego
- **Compatible con Móviles**: Funciona perfectamente en tablets y teléfonos
- **Listo para Uso Offline**: No requiere conexión a internet durante las partidas
- **Claridad Visual**: Secciones codificadas por colores e iconografía intuitiva

---

## Características

### Cobertura Completa de Fases del Juego

| Fase                  | Características Principales                                    | Atajos |
| --------------------- | -------------------------------------------------------------- | ------ |
| **Mando**             | Pruebas de acobardamiento, Puntos de Mando, Estratagemas       | `1`    |
| **Movimiento**        | 4 tipos de movimiento, Coherencia de Unidad, Reglas de terreno | `2`    |
| **Disparo**           | Tablas de Impacto/Herida, Habilidades de armas, Salvaciones    | `3`    |
| **Carga**             | Distancia de carga, Mecánicas de Overwatch                     | `4`    |
| **Combate**           | Prioridad de combate, Consolidación, Combate cuerpo a cuerpo   | `5`    |
| **Reglas Especiales** | Tipos de unidades, Habilidades de armas, Modificadores         | `6`    |

### Elementos Interactivos

- **Sistema de Estratagemas**: 13+ estratagemas básicas con filtrado por fase
- **Tablas de Referencia Rápida**: Gráficos de Impacto/Herida, modificadores de salvación
- **Indicadores Visuales**: Fases codificadas por colores y disponibilidad de estratagemas
- **Persistencia de Sesión**: Recuerda tu última fase seleccionada
- **Navegación por Teclado**: Accesibilidad completa por teclado

### Características Técnicas

- **JavaScript Vanilla**: Sin dependencias de frameworks
- **Diseño Responsivo**: Layout con CSS Grid y Flexbox
- **Iconos Personalizados**: Integración con Font Awesome 6.7
- **Almacenamiento Local**: Preferencias de usuario persistentes
- **Amigable para Impresión**: Estilos de impresión limpios para referencia física

---

## Inicio Rápido

### Opción 1: Acceso Directo al Archivo

```bash
# Windows
start public/index.html

# macOS
open public/index.html

# Linux
xdg-open public/index.html
```

### Opción 2: Servidor de Desarrollo Local

```bash
# Using Python
python -m http.server 8000
# Then visit: http://localhost:8000/public

# Using Node.js
npx serve public
# Then visit: http://localhost:3000

# Using VS Code Live Server extension
# Right-click on index.html → "Open with Live Server"
```

---

## Guía de Uso

### Atajos de Teclado

| Tecla | Fase       | Función                                  |
| ----- | ---------- | ---------------------------------------- |
| `1`   | Mando      | Reglas de Fase de Mando y estratagemas   |
| `2`   | Movimiento | Tipos de movimiento y coherencia         |
| `3`   | Disparo    | Mecánicas de combate a distancia         |
| `4`   | Carga      | Declaraciones de carga y overwatch       |
| `5`   | Combate    | Resolución de combate cuerpo a cuerpo    |
| `6`   | Reglas     | Reglas especiales y habilidades de armas |

### Consejos de Navegación

- **Haz clic en las pestañas** para selección de fase
- **Pasa el cursor sobre las estratagemas** para tooltips detallados
- **Usa las fórmulas rápidas** para resolución rápida de combate
- **Consulta las tablas de referencia** para búsquedas precisas de reglas

---

## Fases del Juego

<details>
<summary><strong>Fase de Mando</strong></summary>

### Mecánicas Básicas

- **Puntos de Mando**: Ambos jugadores ganan +1 PM al inicio
- **Pruebas de Acobardamiento**: Unidades bajo la mitad de efectivos hacen pruebas de moral
- **Reservas Estratégicas**: Desplegar refuerzos
- **Habilidades de Señor de la Guerra**: Activar reglas especiales

### Efectos de Acobardamiento

- Control de Objetivo (CO) = 0 para todos los modelos
- No pueden ser afectados por Estratagemas
- Pruebas de Huida Desesperada al Retroceder

</details>

<details>
<summary><strong>Fase de Movimiento</strong></summary>

### Tipos de Movimiento

- **Movimiento Normal**: Hasta M", puede disparar y cargar
- **Avanzar**: M" + 1d6", no puede disparar (excepto armas de Asalto)
- **Retroceder**: Hasta M", debe terminar fuera del Rango de Enfrentamiento
- **Permanecer Estático**: +1 para impactar con armas Pesadas

### Reglas Clave

- **Coherencia de Unidad**: Modelos dentro de 2" de otro modelo de la unidad
- **Embarcar/Desembarcar**: Interacciones de transporte
- **Efectos de Terreno**: Terreno Difícil y Peligroso

</details>

<details>
<summary><strong>Fase de Disparo</strong></summary>

### Secuencia de Ataque

1. **Seleccionar Objetivos**: Elegir unidades enemigas en rango y Línea de Visión
2. **Tiradas de Impacto**: Tirar ataques vs Habilidad de Proyectiles (HP)
3. **Tiradas de Herida**: Comparar Fuerza vs Resistencia
4. **Asignar Heridas**: El defensor asigna heridas a los modelos
5. **Tiradas de Salvación**: Salvaciones de armadura modificadas por FP
6. **Infligir Daño**: Remover salvaciones fallidas como heridas

### Tabla de Heridas

| Fuerza vs Resistencia | Para Herir |
| --------------------- | ---------- |
| F ≥ 2×R               | 2+         |
| F > R                 | 3+         |
| F = R                 | 4+         |
| F < R                 | 5+         |
| F ≤ ½R                | 6+         |

</details>

<details>
<summary><strong>Fase de Carga</strong></summary>

### Secuencia de Carga

1. **Declarar Carga**: Seleccionar unidad que carga y objetivos
2. **Overwatch**: Los defensores pueden disparar (solo 6+ para impactar)
3. **Tirada de Carga**: 2d6 para distancia de carga
4. **Movimiento de Carga**: Moverse a contacto base si es exitoso

### Reglas de Overwatch

- Puede declararse una vez por turno
- Solo impacta con 6+ sin modificar
- Se resuelve antes del movimiento de carga

</details>

<details>
<summary><strong>Fase de Combate</strong></summary>

### Prioridad de Combate

1. **Combate Primero**: Unidades que cargaron + reglas especiales
2. **Combate Normal**: Todas las demás unidades elegibles

### Orden de Activación

- El jugador no activo activa la primera unidad de Combate Primero
- Los jugadores alternan activando unidades
- Consolidar 3" hacia el enemigo más cercano después de combatir

### Resolución de Ataques

- Igual que la Fase de Disparo pero usa Habilidad de Armas (HA)
- Las armas cuerpo a cuerpo tienen perfiles diferentes a las de disparo

</details>

<details>
<summary><strong>Referencia de Reglas Especiales</strong></summary>

### Características de Unidad

- **M** (Movimiento): Distancia en pulgadas
- **HA/HP** (Habilidad de Armas/Proyectiles): Números objetivo de impacto
- **F** (Fuerza): Capacidad ofensiva
- **R** (Resistencia): Resistencia defensiva
- **H** (Heridas): Puntos de vida
- **A** (Ataques): Número de dados de ataque
- **Ld** (Liderazgo): Característica de moral
- **S** (Salvación): Valor de salvación de armadura

### Tipos de Salvación

- **Salvación de Armadura**: Modificada por FP
- **Salvación Invulnerable**: Nunca modificada por FP
- **Feel No Pain**: Salvación adicional después de fallar armadura
- **Salvación de Cobertura**: +1 a la salvación cuando está en cobertura

</details>

---

## Referencia de Habilidades de Armas

<details>
<summary><strong>Habilidades Básicas de Armas</strong></summary>

| Habilidad                 | Efecto                                                        |
| ------------------------- | ------------------------------------------------------------- |
| **ANTI-X n+**             | Tiradas de herida de n+ vs palabra clave X son críticas       |
| **ASALTO**                | Puede disparar después de Avanzar                             |
| **ÁREA**                  | +1 ataque por cada 5 modelos en la unidad objetivo            |
| **HERIDAS DEVASTADORAS**  | Heridas críticas infligen heridas mortales                    |
| **PESADA**                | +1 para impactar si la unidad Permaneció Estática             |
| **IGNORA COBERTURA**      | El objetivo no obtiene bonificación de salvación de cobertura |
| **FUEGO INDIRECTO**       | Puede apuntar a enemigos no visibles                          |
| **IMPACTOS LETALES**      | Impactos críticos hieren automáticamente                      |
| **PISTOLA**               | Puede disparar en cuerpo a cuerpo a enemigos enfrentados      |
| **FUEGO RÁPIDO n**        | +n ataques vs objetivos a la mitad del alcance                |
| **IMPACTOS SOSTENIDOS n** | Impactos críticos obtienen n impactos adicionales             |
| **TORRENTE**              | Impacta automáticamente al objetivo                           |
| **ACOPLADA**              | Repetir tiradas de herida                                     |

</details>

---

## Sistema de Estratagemas

La aplicación incluye 13+ estratagemas básicas organizadas por fase y disponibilidad:

- **Cualquier Turno** (Verde): Usable durante el turno de cualquier jugador
- **Tu Turno** (Azul): Solo durante tu propio turno
- **Turno del Oponente** (Rojo): Solo durante el turno del oponente

### Estratagemas Destacadas

- **Repetición de Mando** (1 PM): Repetir cualquier dado
- **Overwatch** (1 PM): Disparar a enemigos que cargan
- **Intervención Heroíca** (1 PM): Mover Personajes al combate
- **Valor Insensato** (1 PM): Pasar automáticamente prueba de moral

---

## Instalación

### Prerrequisitos

- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+)
- No se requiere software adicional

### Configuración Local

1. **Clonar o Descargar**

   ```bash
   git clone https://github.com/DiegoVallejoDev/40k-reglas-simples.git
   cd 40k-reglas-simples
   ```

2. **Abrir en Navegador**

   ```bash
   # Direct file access
   open public/index.html

   # Or serve locally
   npx serve public
   ```

3. **Opcional: Configuración de VS Code**
   - Instalar extensión "Live Server"
   - Clic derecho en `index.html` → "Open with Live Server"

---

## Estructura del Proyecto

```
40k-reglas-simples/
├── public/
│   ├── index.html          # Main application file
│   ├── main.css           # Styles and responsive design
│   ├── stratagems.js      # Stratagem data and logic
│   ├── tooltip.js         # Interactive tooltip system
│   ├── images/           # Game assets and logos
│   └── svg/              # Custom icons and graphics
├── README.md             # This documentation
└── .gitignore           # Git ignore rules
```

---

## Aviso Legal

Esta aplicación es una herramienta de referencia no oficial creada para uso personal y propósitos educativos. No está afiliada, respaldada o patrocinada por Games Workshop Ltd.

**Warhammer 40,000** es una marca registrada de Games Workshop Ltd. Todas las reglas del juego, terminología y contenido son propiedad intelectual de Games Workshop Ltd.

Esta herramienta se proporciona bajo principios de Uso Justo solo para propósitos educativos y de referencia. Para reglas oficiales y contenido completo del juego, consulte los libros de reglas oficiales de **Warhammer 40,000** y publicaciones de Games Workshop.

---

## Soporte y Contacto

- **GitHub Issues**: [Reportar errores o solicitar características](https://github.com/DiegoVallejoDev/40k-reglas-simples/issues)
- **Desarrollador**: [Diego Vallejo](https://github.com/diegovallejodev/)
- **Licencia**: Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles

---

## Historial de Versiones

- **v2.0** - Implementación completa de fases con estratagemas
- **v1.5** - Añadidas fases de Combate y Carga
- **v1.0** - Lanzamiento inicial con fases básicas

---

<div align="center">

**¡Por el Emperador!**

_Hecho con dedicación para la comunidad de Warhammer 40k_

</div>
