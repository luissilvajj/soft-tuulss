// Variables de Color de Kaptiva App (Esquema Premium Minimalista)
#let kaptiva-gold = rgb("EAB308") // Amarillo-Dorado principal (#eab308)
#let kaptiva-gold-dark = rgb("CA8A04") // Dorado oscuro para contraste (#ca8a04)
#let carbon-base = rgb("FAFAFA") // Fondo claro base (#fafafa)
#let carbon-card = rgb("FFFFFF") // Tarjetas blancas (#ffffff)
#let text-dark-heading = rgb("0F172A") // Gris pizarra muy oscuro (#0f172a / Slate-900)
#let text-dark-body = rgb("334155") // Gris pizarra cuerpo (#334155 / Slate-700)
#let text-muted = rgb("64748B") // Gris silenciado (#64748B / Slate-500)
#let border-light = rgb("E2E8F0") // Borde claro (#e2e8f0 / Slate-200)
#let border-subtle = rgb("F1F5F9") // Borde muy suave (#f1f5f9 / Slate-100)
#let success-color = rgb("10B981") // Verde éxito (#10b981)

#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 2.5cm, right: 2.5cm),
  fill: carbon-base,
  header: context {
    let page-num = counter(page).get().first()
    if page-num > 1 [
      #grid(
        columns: (1fr, 1fr),
        align(left)[#text(size: 8pt, weight: "bold", fill: text-muted, tracking: 1.5pt)[KAPTIVA APP]],
        align(right)[#text(size: 8pt, weight: "bold", fill: rgb("94A3B8"), tracking: 1pt)[GUÍA DE IDENTIDAD DE MARCA]]
      )
      #v(0.2cm)
      #line(length: 100%, stroke: 0.5pt + border-light)
    ]
  },
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 [
      #line(length: 100%, stroke: 0.5pt + border-light)
      #v(0.2cm)
      #grid(
        columns: (1fr, 1fr),
        align(left)[#text(size: 8pt, fill: rgb("94A3B8"))[Confidencial | Kaptiva App 2026]],
        align(right)[#text(size: 8pt, fill: text-muted, weight: "bold")[Página #page-num]]
      )
    ]
  }
)

// Tipografía y Párrafo Global
#set text(
  font: ("Inter", "Plus Jakarta Sans", "Liberation Sans", "Arial"),
  fill: text-dark-body,
  size: 10pt,
)
#set par(justify: true, leading: 0.75em)

// Helpers de Encabezados
#let h1(body) = {
  v(0.3cm)
  text(font: ("Plus Jakarta Sans", "Inter", "Arial"), size: 24pt, weight: "bold", fill: text-dark-heading)[#body]
  v(0.6cm)
}
#let h2(body) = {
  v(0.2cm)
  text(font: ("Plus Jakarta Sans", "Inter", "Arial"), size: 13pt, weight: "bold", fill: text-dark-heading)[#body]
  v(0.3cm)
}

// ==========================================
// FUNCIÓN LOGO VECTORIAL: Monograma Chevron Flotante
// ==========================================
#let kaptiva-logo(size: 60pt, fill-stem: text-dark-heading, fill-slants: kaptiva-gold, fill-dot: kaptiva-gold) = {
  let scale-factor = size / 60pt
  block(
    width: size,
    height: size,
  )[
    // Tallo Vertical Principal (Píldora geométrica)
    #place(
      left + top,
      dx: 11pt * scale-factor,
      dy: 0pt,
      rect(width: 7pt * scale-factor, height: 60pt * scale-factor, fill: fill-stem, radius: 3.5pt * scale-factor)
    )
    // Chevron Superior (Rama diagonal arriba)
    #place(
      left + top,
      dx: 15pt * scale-factor,
      dy: 6pt * scale-factor,
      rotate(45deg, origin: left + top, rect(width: 6.5pt * scale-factor, height: 33pt * scale-factor, fill: fill-slants, radius: 3.25pt * scale-factor))
    )
    // Chevron Inferior (Rama diagonal abajo)
    #place(
      left + top,
      dx: 15pt * scale-factor,
      dy: 54pt * scale-factor,
      rotate(-45deg, origin: left + bottom, rect(width: 6.5pt * scale-factor, height: 33pt * scale-factor, fill: fill-slants, radius: 3.25pt * scale-factor))
    )
    // Punto de Foco / AI / Captura (Círculo dorado flotante)
    #place(
      left + top,
      dx: 48pt * scale-factor,
      dy: 0pt,
      circle(radius: 4.5pt * scale-factor, fill: fill-dot)
    )
  ]
}

// ==========================================
// PÁGINA 1 - PORTADA
// ==========================================
#align(center + horizon)[
  #v(-1.5cm)
  #kaptiva-logo(size: 80pt)
  #v(1.5cm)
  #text(font: ("Plus Jakarta Sans", "Inter", "Arial"), size: 30pt, weight: "bold", fill: text-dark-heading, tracking: 1.5pt)[Kaptiva App]
  #v(0.2cm)
  #text(font: ("Inter", "Arial"), size: 11pt, weight: "medium", fill: text-muted, tracking: 3pt)[MANUAL DE IDENTIDAD DE MARCA]
  #v(0.8cm)
  #rect(width: 40pt, height: 2pt, fill: kaptiva-gold, radius: 1pt)
  #v(5cm)
  #text(font: ("Inter", "Arial"), size: 8.5pt, fill: rgb("94A3B8"), tracking: 1pt)[
    KAPTIVA APP SAAS ERP/POS \
    Versión 1.1 | 2026 \
    Estilo Premium Minimalista
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 2 - FILOSOFÍA DE MARCA
// ==========================================
#h1[Filosofía de Marca y Tono]

*Kaptiva App* es una plataforma SaaS de facturación, inventario y punto de venta diseñada bajo los principios de agilidad y robustez técnica. Creemos que la tecnología empresarial debe simplificar la vida del comerciante, no complicarla.

Nuestra identidad representa una transición desde herramientas aisladas hacia un ecosistema integrado, inteligente y confiable. El tono de Kaptiva es profesional, limpio y directo: eliminamos lo innecesario para centrarnos en lo que genera valor.

#v(0.8cm)

#let pillar-card(label, title, desc) = rect(
  fill: carbon-card,
  radius: 8pt,
  width: 100%,
  inset: (x: 0.6cm, y: 0.5cm),
  stroke: (left: 3pt + kaptiva-gold, rest: 1pt + border-light),
)[
  #text(size: 7.5pt, weight: "bold", tracking: 1.5pt, fill: text-muted)[#label]
  #v(0.1cm)
  #text(size: 11pt, weight: "bold", fill: text-dark-heading)[#title]
  #v(0.1cm)
  #text(size: 9pt, fill: text-dark-body)[#desc]
]

#stack(
  dir: ttb,
  spacing: 0.5cm,
  pillar-card("PILAR 01", "EFICIENCIA PURA", "Reducimos la fricción operativa. El software responde instantáneamente y asiste al usuario de manera limpia y transparente."),
  pillar-card("PILAR 02", "CONTROL ABSOLUTO", "Seguimiento riguroso de inventarios y flujos financieros. Información confiable e inmutable para la toma de decisiones."),
  pillar-card("PILAR 03", "SIMPLICIDAD ELEGANTE", "Diseño sofisticado, limpio y ordenado que se adapta a cualquier dispositivo, transmitiendo una sensación premium.")
)

#pagebreak()

// ==========================================
// PÁGINA 3 - CONSTRUCCIÓN DEL LOGO
// ==========================================
#h1[El Logotipo y Construcción]

El identificador de *Kaptiva App* está compuesto por nuestro símbolo (*Isotipo*) y el nombre tipográfico (*Logotipo*). 

El Isotipo es un monograma estilizado de la letra *K* llamado *Monograma Chevron Flotante*. Se compone de un tallo vertical estable y dos brazos diagonales en forma de chevron que representan la captura y retención de valor, rematado con un punto superior que simboliza precisión y análisis inteligente (AI).

#v(0.8cm)

#align(center)[
  #block(
    stroke: 1pt + border-light,
    inset: (x: 2cm, y: 1.5cm),
    fill: carbon-card,
    radius: 8pt,
  )[
    #grid(
      columns: (auto, auto),
      gutter: 20pt,
      align: horizon,
      kaptiva-logo(size: 50pt),
      text(font: ("Plus Jakarta Sans", "Inter", "Arial"), size: 28pt, weight: "bold", fill: text-dark-heading)[Kaptiva]
    )
  ]
  #v(0.4cm)
  #text(size: 8.5pt, fill: text-muted)[
    Logotipo oficial de marca en su configuración horizontal preferida.
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 4 - ÁREA DE PROTECCIÓN Y ESCALABILIDAD
// ==========================================
#h1[Área de Protección y Escala]

Para asegurar la máxima legibilidad del logotipo en cualquier contexto, se establece un área de seguridad a su alrededor que debe permanecer libre de textos, imágenes u otros elementos gráficos. Esta distancia equivale a la mitad del ancho total del isotipo ($X/2$).

El tamaño mínimo recomendado para reproducciones digitales es de *120px* de ancho para el logotipo compuesto y *32px* para el isotipo aislado (aplicaciones móviles o favicons).

#v(0.8cm)

#align(center)[
  #block(
    stroke: 1pt + border-light,
    inset: (x: 1.5cm, y: 1.2cm),
    fill: carbon-card,
    radius: 8pt,
  )[
    #rect(
      stroke: (paint: kaptiva-gold, dash: "dashed", thickness: 0.75pt),
      inset: 0.6cm,
      fill: carbon-base,
      radius: 4pt,
    )[
      #grid(
        columns: (auto, auto),
        gutter: 15pt,
        align: horizon,
        kaptiva-logo(size: 40pt),
        text(font: ("Plus Jakarta Sans", "Inter", "Arial"), size: 22pt, weight: "bold", fill: text-dark-heading)[Kaptiva]
      )
    ]
  ]
  #v(0.4cm)
  #text(size: 8.5pt, fill: text-muted)[
    Línea de contorno dorada discontinua representando el margen de seguridad mínimo ($X/2$).
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 5 - VARIANTES PERMITIDAS
// ==========================================
#h1[Variantes de Color Autorizadas]

La marca debe aplicarse utilizando únicamente las variantes oficiales detalladas a continuación para garantizar la coherencia e integridad visual.

#v(0.5cm)

#let variant-card(bg, is-dark-logo, label, border) = rect(
  fill: bg,
  width: 100%,
  height: 5.5cm,
  radius: 8pt,
  stroke: border,
)[
  #align(center + horizon)[
    #grid(
      columns: (auto, auto),
      gutter: 10pt,
      align: horizon,
      kaptiva-logo(
        size: 32pt, 
        fill-stem: if is-dark-logo { text-dark-heading } else { carbon-card },
        fill-slants: kaptiva-gold,
        fill-dot: kaptiva-gold
      ),
      text(
        font: ("Plus Jakarta Sans", "Inter", "Arial"), 
        size: 18pt, 
        weight: "bold", 
        fill: if is-dark-logo { text-dark-heading } else { carbon-card }
      )[Kaptiva]
    )
    #v(0.6cm)
    #text(size: 8.5pt, fill: if is-dark-logo { text-muted } else { rgb("CCCCCC") }, weight: "bold")[#label]
  ]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.8cm,
  variant-card(carbon-card, true, "Corporativa (Fondo Claro)", 1pt + border-light),
  variant-card(rgb("0F172A"), false, "Corporativa (Fondo Oscuro)", none),
  variant-card(kaptiva-gold, true, "Invertida Alto Impacto", none),
  variant-card(carbon-base, true, "Monocroma (Escala de Grises)", 1pt + border-light)
)

#pagebreak()

// ==========================================
// PÁGINA 6 - USOS INCORRECTOS
// ==========================================
#h1[Usos Incorrectos]

El logotipo es el activo visual más valioso de Kaptiva. Modificar su composición, alterar sus proporciones o usar tipografías no autorizadas devalúa la percepción del software y su consistencia.

#v(0.5cm)

#let wrong-card(reason, content-fn) = rect(
  fill: carbon-card,
  radius: 8pt,
  width: 100%,
  height: 5.5cm,
  stroke: 1pt + border-light,
)[
  #align(center)[
    #v(0.6cm)
    #content-fn()
    #v(1fr)
    #text(fill: rgb("EF4444"), weight: "bold", size: 9.5pt)[#reason]
    #v(0.6cm)
  ]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.8cm,
  wrong-card("NO DEFORMAR", () => {
    v(0.4cm)
    scale(x: 140%, y: 60%)[
      #grid(columns: 2, gutter: 8pt, align: horizon, kaptiva-logo(size: 24pt), text(size: 14pt, weight: "bold")[Kaptiva])
    ]
  }),
  wrong-card("NO ROTAR", () => {
    v(0.6cm)
    rotate(15deg)[
      #grid(columns: 2, gutter: 8pt, align: horizon, kaptiva-logo(size: 24pt), text(size: 14pt, weight: "bold")[Kaptiva])
    ]
  }),
  wrong-card("NO ALTERAR COLORES", () => {
    v(0.6cm)
    grid(
      columns: 2,
      gutter: 8pt,
      align: horizon,
      kaptiva-logo(size: 24pt, fill-stem: rgb("EF4444"), fill-slants: rgb("3B82F6"), fill-dot: rgb("10B981")),
      text(size: 14pt, weight: "bold", fill: rgb("EC4899"))[Kaptiva]
    )
  }),
  wrong-card("NO CAMBIAR TIPOGRAFÍA", () => {
    v(0.6cm)
    grid(
      columns: 2,
      gutter: 8pt,
      align: horizon,
      kaptiva-logo(size: 24pt),
      text(font: "Georgia", size: 16pt, style: "italic", weight: "regular")[Kaptiva]
    )
  })
)

#pagebreak()

// ==========================================
// PÁGINA 7 - SISTEMA DE COLOR
// ==========================================
#h1[Sistema de Color]

La paleta cromática se basa en el contraste entre el dorado enérgico, representativo del comercio y el éxito, y tonos oscuros limpios y superficies claras elegantes, brindando una estética moderna, clara y pulida.

#v(0.8cm)

#let color-block(title, hex, rgb-val, usage) = stack(
  dir: ttb,
  spacing: 8pt,
  rect(
    fill: rgb(hex),
    width: 100%,
    height: 4.5cm,
    radius: 6pt,
    stroke: if hex == "#FFFFFF" { 1pt + border-light } else { none }
  ),
  text(weight: "bold", size: 12pt, fill: text-dark-heading)[#title],
  text(size: 8.5pt, fill: text-muted)[*HEX:* #hex],
  text(size: 8.5pt, fill: text-muted)[*RGB:* #rgb-val],
  text(size: 8.5pt, fill: text-muted)[*USO:* #usage]
)

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 0.8cm,
  color-block("Oro Kaptiva", "#EAB308", "234, 179, 8", "Identidad / Enfoque / CTA"),
  color-block("Pizarra Oscuro", "#0F172A", "15, 23, 42", "Tipografía / Fondos Noche"),
  color-block("Blanco Puro", "#FFFFFF", "255, 255, 255", "Espacios de Trabajo / Fondo")
)

#pagebreak()

// ==========================================
// PÁGINA 8 - TIPOGRAFÍA
// ==========================================
#h1[Sistema Tipográfico]

Kaptiva App adopta tipografías sans-serif de carácter geométrico y contemporáneo. *Plus Jakarta Sans* aporta legibilidad de alto impacto a los encabezados, mientras que *Inter* optimiza la visualización de datos y tablas densas en el sistema POS.

#v(0.6cm)

#let type-spec(font-name, weight-name, weight-val) = [
  #block(
    stroke: (left: 2pt + kaptiva-gold),
    inset: (left: 0.4cm, top: 0.1cm, bottom: 0.1cm),
  )[
    #text(font: font-name, size: 18pt, weight: weight-val, fill: text-dark-heading)[Aa Bb Cc 0123] \
    #v(0.05cm)
    #text(font: font-name, size: 8.5pt, fill: text-muted)[#font-name - #weight-name]
  ]
  #v(0.3cm)
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1cm,
  [
    #h2[Titulares: Plus Jakarta Sans]
    #type-spec("Plus Jakarta Sans", "Bold", "bold")
    #type-spec("Plus Jakarta Sans", "Medium", "medium")
  ],
  [
    #h2[Lectura y Datos: Inter]
    #type-spec("Inter", "SemiBold", "semibold")
    #type-spec("Inter", "Regular", "regular")
  ]
)

#pagebreak()

// ==========================================
// PÁGINA 9 - ELEMENTOS DE INTERFAZ
// ==========================================
#h1[Elementos de Interfaz y UX]

Los componentes interactivos de *Kaptiva App* exhiben bordes suaves, micro-sombras elegantes y un diseño plano pulido que reduce la fatiga visual en entornos comerciales de uso prolongado.

#v(0.6cm)

#let ui-box(name, preview-block) = rect(
  fill: carbon-card,
  width: 100%,
  inset: 0.5cm,
  radius: 8pt,
  stroke: 1pt + border-light,
)[
  #text(size: 8.5pt, weight: "bold", fill: text-muted)[#name]
  #v(0.4cm)
  #align(center)[#preview-block]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.8cm,
  ui-box("Botón Principal (CTA)", [
    #rect(
      fill: kaptiva-gold,
      radius: 6pt,
      inset: (x: 1.2cm, y: 0.3cm),
    )[
      #text(weight: "bold", size: 9pt, fill: text-dark-heading)[Procesar Venta]
    ]
  ]),
  ui-box("Botón Secundario (Outline)", [
    #rect(
      fill: none,
      radius: 6pt,
      inset: (x: 1.2cm, y: 0.3cm),
      stroke: 1pt + border-light,
    )[
      #text(weight: "bold", size: 9pt, fill: text-dark-body)[Ver Historial]
    ]
  ]),
  ui-box("Entrada de Texto Enfocada", [
    #rect(
      fill: carbon-base,
      width: 80%,
      radius: 6pt,
      inset: (x: 0.3cm, y: 0.25cm),
      stroke: 1pt + kaptiva-gold,
    )[
      #align(left)[
        #text(size: 9.5pt, fill: text-dark-heading)[\$ 1,250.00]
      ]
    ]
  ]),
  ui-box("Badge de Estado", [
    #rect(
      fill: rgb("10B9811A"),
      radius: 12pt,
      inset: (x: 0.5cm, y: 0.15cm),
      stroke: 1pt + rgb("10B98140"),
    )[
      #text(weight: "bold", size: 7.5pt, fill: success-color)[LICENCIA ACTIVA]
    ]
  ])
)

#pagebreak()

// ==========================================
// PÁGINA 10 - PAPELERÍA CORPORATIVA
// ==========================================
#h1[Papelería y Tarjeta de Presentación]

La tarjeta de presentación institucional utiliza un formato estándar horizontal de $9.0 times 5.0$ cm. El diseño mantiene una estética sumamente depurada con un amplio uso del espacio en blanco.

#v(0.6cm)

#text(font: "Inter", size: 7pt, tracking: 1.5pt, fill: text-muted)[FRENTE DE TARJETA (HORIZONTAL)]
#v(0.2cm)
#align(center)[
  #rect(
    fill: carbon-card,
    width: 9cm,
    height: 5cm,
    radius: 4pt,
    stroke: 0.5pt + border-light,
  )[
    #grid(
      columns: (55%, 45%),
      pad(left: 0.6cm, top: 0.5cm)[
        #align(left)[
          #grid(
            columns: (auto, auto),
            gutter: 8pt,
            align: horizon,
            kaptiva-logo(size: 20pt),
            text(font: "Plus Jakarta Sans", size: 12pt, weight: "bold", fill: text-dark-heading)[Kaptiva]
          )
          #v(1.6cm)
          #text(size: 6pt, fill: text-muted)[kaptiva-app.com]
        ]
      ],
      pad(right: 0.6cm, top: 0.5cm)[
        #align(right)[
          #text(size: 10pt, weight: "bold", fill: text-dark-heading)[Luis Silva] \
          #text(size: 6pt, fill: kaptiva-gold-dark, weight: "bold")[Fundador & CTO]
          #v(1.5cm)
          #text(size: 5.5pt, fill: text-dark-body)[
            +58 412 000 0000 \
            soporte\@kaptiva-app.com
          ]
        ]
      ]
    )
  ]
]

#v(0.6cm)

#text(font: "Inter", size: 7pt, tracking: 1.5pt, fill: text-muted)[REVERSO DE TARJETA (HORIZONTAL)]
#v(0.2cm)
#align(center)[
  #rect(
    fill: text-dark-heading,
    width: 9cm,
    height: 5cm,
    radius: 4pt,
    stroke: none,
  )[
    #align(center + horizon)[
      #kaptiva-logo(size: 32pt, fill-stem: carbon-card, fill-slants: kaptiva-gold, fill-dot: kaptiva-gold)
      #v(0.3cm)
      #text(font: "Plus Jakarta Sans", size: 14pt, weight: "bold", fill: carbon-card)[Kaptiva]
      #v(0.1cm)
      #text(size: 5.5pt, tracking: 2pt, fill: rgb("94A3B8"))[CONTROL · EFICACIA · CRECIMIENTO]
    ]
  ]
]
