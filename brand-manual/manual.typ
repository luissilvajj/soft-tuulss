// Variables de Color de Kaptiva App (Google Material Dark Palette)
#let kaptiva-gold = rgb("EAB308") // Amarillo-Dorado principal (#eab308)
#let kaptiva-gold-dark = rgb("CA8A04") // Dorado oscuro para contraste (#ca8a04)
#let kaptiva-gold-light = rgb("FACC15") // Dorado claro (#facc15)
#let carbon-base = rgb("020617") // Fondo oscuro base (#020617 / Slate-950)
#let carbon-card = rgb("0F172A") // Tarjetas oscuras (#0f172a / Slate-900)
#let steel-surface = rgb("1E293B") // Tarjetas secundarias (#1e293b / Slate-800)
#let text-white = rgb("FFFFFF") // Texto blanco
#let text-dark-body = rgb("94A3B8") // Texto gris claro cuerpo (#94a3b8 / Slate-400)
#let text-muted = rgb("64748B") // Texto silenciado (#64748b / Slate-500)
#let border-dark = rgb("334155") // Borde oscuro (#334155 / Slate-700)
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
        align(right)[#text(size: 8pt, weight: "bold", fill: border-dark, tracking: 1pt)[GUÍA DE IDENTIDAD DE MARCA]]
      )
      #v(0.2cm)
      #line(length: 100%, stroke: 0.5pt + border-dark)
    ]
  },
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 [
      #line(length: 100%, stroke: 0.5pt + border-dark)
      #v(0.2cm)
      #grid(
        columns: (1fr, 1fr),
        align(left)[#text(size: 8pt, fill: border-dark)[Confidencial | Kaptiva App 2026]],
        align(right)[#text(size: 8pt, fill: text-dark-body, weight: "bold")[Página #page-num]]
      )
    ]
  }
)

// Tipografía y Párrafo Global (Estilo Roboto de Google)
#set text(
  font: ("Roboto", "Helvetica", "Arial", "sans-serif"),
  fill: text-dark-body,
  size: 10pt,
)
#set par(justify: true, leading: 0.75em)

// Helpers de Encabezados
#let h1(body) = {
  v(0.3cm)
  text(font: ("Roboto", "Arial"), size: 24pt, weight: "bold", fill: text-white)[#body]
  v(0.6cm)
}
#let h2(body) = {
  v(0.2cm)
  text(font: ("Roboto", "Arial"), size: 13pt, weight: "bold", fill: text-white)[#body]
  v(0.3cm)
}

// ==========================================
// FUNCIÓN LOGO VECTORIAL: Monograma Material K (Superpuesto tricolor)
// ==========================================
#let kaptiva-logo(size: 60pt, custom-stem: kaptiva-gold-dark, custom-top: kaptiva-gold, custom-bottom: kaptiva-gold-light) = {
  let scale-factor = size / 60pt
  block(
    width: size,
    height: size,
  )[
    // Tallo Vertical Principal (Capa Inferior - Dorado Oscuro)
    #place(
      left + top,
      dx: 12pt * scale-factor,
      dy: 0pt,
      rect(width: 8pt * scale-factor, height: 60pt * scale-factor, fill: custom-stem, radius: 4pt * scale-factor)
    )
    // Brazo Diagonal Superior (Capa Intermedia - Dorado Primario)
    #place(
      left + top,
      dx: 16pt * scale-factor,
      dy: 26pt * scale-factor,
      rotate(-45deg, origin: left + bottom, rect(width: 35pt * scale-factor, height: 8pt * scale-factor, fill: custom-top, radius: 4pt * scale-factor))
    )
    // Brazo Diagonal Inferior (Capa Superior - Dorado Claro)
    #place(
      left + top,
      dx: 16pt * scale-factor,
      dy: 26pt * scale-factor,
      rotate(45deg, origin: left + top, rect(width: 35pt * scale-factor, height: 8pt * scale-factor, fill: custom-bottom, radius: 4pt * scale-factor))
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
  #text(font: ("Roboto", "Arial"), size: 30pt, weight: "bold", fill: text-white, tracking: 1.5pt)[Kaptiva App]
  #v(0.2cm)
  #text(font: ("Roboto", "Arial"), size: 11pt, weight: "medium", fill: kaptiva-gold, tracking: 3pt)[MANUAL DE IDENTIDAD DE MARCA]
  #v(0.8cm)
  #rect(width: 40pt, height: 2pt, fill: kaptiva-gold, radius: 1pt)
  #v(5cm)
  #text(font: ("Roboto", "Arial"), size: 8.5pt, fill: text-muted, tracking: 1pt)[
    KAPTIVA APP SAAS ERP/POS \
    Versión 1.2 | 2026 \
    Diseño estilo Google Material Dark
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 2 - FILOSOFÍA DE MARCA
// ==========================================
#h1[Filosofía de Marca y Tono]

*Kaptiva App* es una solución SaaS integral que redefine la gestión comercial en microempresas y pymes de comercio retail. Nos alineamos con la filosofía de Google: la tecnología empresarial debe ser visualmente simple, estructuralmente limpia y accesible desde cualquier lugar.

Nuestros pilares se centran en el control inmutable, la resiliencia operativa y la claridad visual. Nos comunicamos de forma directa, sobria y asertiva, enfocándonos siempre en resolver de manera limpia la complejidad del negocio.

#v(0.8cm)

#let pillar-card(label, title, desc) = rect(
  fill: carbon-card,
  radius: 8pt,
  width: 100%,
  inset: (x: 0.6cm, y: 0.5cm),
  stroke: (left: 3pt + kaptiva-gold, rest: 1pt + border-dark),
)[
  #text(size: 7.5pt, weight: "bold", tracking: 1.5pt, fill: kaptiva-gold)[#label]
  #v(0.1cm)
  #text(size: 11pt, weight: "bold", fill: text-white)[#title]
  #v(0.1cm)
  #text(size: 9pt, fill: text-dark-body)[#desc]
]

#stack(
  dir: ttb,
  spacing: 0.5cm,
  pillar-card("PILAR 01", "CONTROL MATERIAL", "Visibilidad transparente de inventarios y cajas registradoras. Cada transacción es auditable e inmutable."),
  pillar-card("PILAR 02", "SIMPLICIDAD GEOMÉTRICA", "Interfaces planas, limpias y altamente estructuradas con la tipografía Roboto. Información directa al usuario."),
  pillar-card("PILAR 03", "RESILIENCIA TOTAL", "Operación offline-first y adaptabilidad ágil ante fluctuaciones del mercado y cortes de red.")
)

#pagebreak()

// ==========================================
// PÁGINA 3 - CONSTRUCCIÓN DEL LOGO
// ==========================================
#h1[El Logotipo y Construcción]

El logotipo oficial de *Kaptiva App* combina el *Isotipo* (Monograma Material K) con el *Logotipo* tipográfico en fuente Roboto Bold.

El Isotipo se basa en la superposición de planos geométricos propia de Material Design. Sus tres capas redondeadas en dorados cromáticos simbolizan la confluencia de tres ramas operativas fundamentales del SaaS: Facturación, Control de Stock y Análisis de Negocio.

#v(0.8cm)

#align(center)[
  #block(
    stroke: 1pt + border-dark,
    inset: (x: 2cm, y: 1.5cm),
    fill: carbon-card,
    radius: 8pt,
  )[
    #grid(
      columns: (auto, auto),
      gutter: 20pt,
      align: horizon,
      kaptiva-logo(size: 50pt),
      text(font: ("Roboto", "Arial"), size: 28pt, weight: "bold", fill: text-white)[Kaptiva]
    )
  ]
  #v(0.4cm)
  #text(size: 8.5pt, fill: text-muted)[
    Isotipo y logotipo compuesto en su alineación horizontal recomendada.
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 4 - ÁREA DE PROTECCIÓN
// ==========================================
#h1[Área de Protección y Escala]

Para resguardar el impacto visual de la marca, se define un perímetro de exclusión obligatorio donde ningún elemento gráfico o tipográfico ajeno debe ingresar. Este espacio equivale al ancho de una de las barras verticales principales de la letra K ($Y$).

El tamaño mínimo de visualización en pantallas digitales es de *120px* de ancho para el logotipo completo y *32px* para el isotipo de la app.

#v(0.8cm)

#align(center)[
  #block(
    stroke: 1pt + border-dark,
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
        text(font: ("Roboto", "Arial"), size: 22pt, weight: "bold", fill: text-white)[Kaptiva]
      )
    ]
  ]
  #v(0.4cm)
  #text(size: 8.5pt, fill: text-muted)[
    Borde punteado de seguridad que delimita la zona de exclusión mínima ($Y$).
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 5 - VARIANTES CROMÁTICAS
// ==========================================
#h1[Variantes de Color]

Para garantizar el reconocimiento inmediato de la marca, solo se autoriza el uso de las siguientes configuraciones de contraste y color.

#v(0.5cm)

#let variant-card(bg, logo-stem, logo-top, logo-bottom, text-col, label, border) = rect(
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
        custom-stem: logo-stem, 
        custom-top: logo-top, 
        custom-bottom: logo-bottom
      ),
      text(
        font: ("Roboto", "Arial"), 
        size: 18pt, 
        weight: "bold", 
        fill: text-col
      )[Kaptiva]
    )
    #v(0.6cm)
    #text(size: 8.5pt, fill: if bg == text-white { rgb("64748B") } else { rgb("CCCCCC") }, weight: "bold")[#label]
  ]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.8cm,
  variant-card(carbon-card, kaptiva-gold-dark, kaptiva-gold, kaptiva-gold-light, text-white, "Corporativa Dark", 1pt + border-dark),
  variant-card(text-white, kaptiva-gold-dark, kaptiva-gold, kaptiva-gold-light, rgb("020617"), "Corporativa Light", 1pt + border-dark),
  variant-card(kaptiva-gold, rgb("020617"), rgb("020617"), rgb("020617"), rgb("020617"), "Alto Contraste Invertido", none),
  variant-card(carbon-base, text-muted, text-muted, text-muted, text-white, "Monocroma Grises", 1pt + border-dark)
)

#pagebreak()

// ==========================================
// PÁGINA 6 - USOS INCORRECTOS
// ==========================================
#h1[Usos Incorrectos]

El isotipo tricolor Material K no debe verse alterado bajo ninguna circunstancia. Abajo se ilustran deformaciones y malas prácticas comunes que comprometen la seriedad de la marca.

#v(0.5cm)

#let wrong-card(reason, content-fn) = rect(
  fill: carbon-card,
  radius: 8pt,
  width: 100%,
  height: 5.5cm,
  stroke: 1pt + border-dark,
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
    scale(x: 130%, y: 55%)[
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
      kaptiva-logo(size: 24pt, custom-stem: rgb("EC4899"), custom-top: rgb("3B82F6"), custom-bottom: rgb("10B981")),
      text(size: 14pt, weight: "bold", fill: rgb("EF4444"))[Kaptiva]
    )
  }),
  wrong-card("NO CAMBIAR TIPOGRAFÍA", () => {
    v(0.6cm)
    grid(
      columns: 2,
      gutter: 8pt,
      align: horizon,
      kaptiva-logo(size: 24pt),
      text(font: "Times New Roman", size: 16pt, weight: "regular")[Kaptiva]
    )
  })
)

#pagebreak()

// ==========================================
// PÁGINA 7 - SISTEMA DE COLOR
// ==========================================
#h1[Sistema de Color]

Los colores principales respetan la paleta original de la app. El *Oro Kaptiva* en sus tres variaciones aporta el dinamismo tricolor propio de Google, mientras que la profundidad sobria de la *Pizarra Base* actúa como un excelente lienzo.

#v(0.8cm)

#let color-block(title, hex, rgb-val, usage) = stack(
  dir: ttb,
  spacing: 8pt,
  rect(
    fill: rgb(hex),
    width: 100%,
    height: 4.5cm,
    radius: 6pt,
    stroke: if hex == "#FFFFFF" { 1pt + border-dark } else { none }
  ),
  text(weight: "bold", size: 12pt, fill: text-white)[#title],
  text(size: 8.5pt, fill: text-dark-body)[*HEX:* #hex],
  text(size: 8.5pt, fill: text-dark-body)[*RGB:* #rgb-val],
  text(size: 8.5pt, fill: text-dark-body)[*USO:* #usage]
)

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 0.8cm,
  color-block("Oro Kaptiva", "#EAB308", "234, 179, 8", "Identidad Primaria / CTA"),
  color-block("Pizarra Base", "#020617", "2, 6, 23", "Fondo Base de la App"),
  color-block("Pizarra Tarjeta", "#0F172A", "15, 23, 42", "Paneles y Cajas de Venta")
)

#pagebreak()

// ==========================================
// PÁGINA 8 - TIPOGRAFÍA (ROBOTO)
// ==========================================
#h1[Sistema Tipográfico]

*Roboto* es la tipografía exclusiva para el ecosistema corporativo de Kaptiva App. Su estructura geométrica neo-grotesca y sus curvas limpias garantizan legibilidad perfecta y una apariencia corporativa impecable tanto en reportes densos como en la interfaz POS.

#v(0.6cm)

#let type-spec(weight-name, weight-val) = [
  #block(
    stroke: (left: 2pt + kaptiva-gold),
    inset: (left: 0.4cm, top: 0.1cm, bottom: 0.1cm),
  )[
    #text(font: "Roboto", size: 18pt, weight: weight-val, fill: text-white)[Aa Bb Cc 0123] \
    #v(0.05cm)
    #text(font: "Roboto", size: 8.5pt, fill: text-dark-body)[Roboto - #weight-name]
  ]
  #v(0.3cm)
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1cm,
  [
    #h2[Titulares y Botones]
    #type-spec("Bold", "bold")
    #type-spec("Medium", "medium")
  ],
  [
    #h2[Cuerpo de Texto y Datos]
    #type-spec("Regular", "regular")
    #type-spec("Light", "light")
  ]
)

#pagebreak()

// ==========================================
// PÁGINA 9 - ELEMENTOS DE INTERFAZ
// ==========================================
#h1[Elementos de Interfaz y UX]

Los componentes de UI se estructuran bajo las normas Material Design 3 Dark Theme: bordes redondeados medianos, uso sutil del color primario en botones principales y cajas de texto de fondo plano.

#v(0.6cm)

#let ui-box(name, preview-block) = rect(
  fill: carbon-card,
  width: 100%,
  inset: 0.5cm,
  radius: 8pt,
  stroke: 1pt + border-dark,
)[
  #text(size: 8.5pt, weight: "bold", fill: text-dark-body)[#name]
  #v(0.4cm)
  #align(center)[#preview-block]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.8cm,
  ui-box("Botón Principal (Filled)", [
    #rect(
      fill: kaptiva-gold,
      radius: 6pt,
      inset: (x: 1.2cm, y: 0.3cm),
    )[
      #text(weight: "bold", size: 9pt, fill: carbon-base)[Procesar Venta]
    ]
  ]),
  ui-box("Botón Secundario (Outlined)", [
    #rect(
      fill: none,
      radius: 6pt,
      inset: (x: 1.2cm, y: 0.3cm),
      stroke: 1pt + border-dark,
    )[
      #text(weight: "bold", size: 9pt, fill: text-dark-body)[Ver Historial]
    ]
  ]),
  ui-box("Input de Formulario", [
    #rect(
      fill: steel-surface,
      width: 80%,
      radius: 6pt,
      inset: (x: 0.3cm, y: 0.25cm),
      stroke: 1pt + kaptiva-gold,
    )[
      #align(left)[
        #text(size: 9.5pt, fill: text-white)[\$ 1,250.00]
      ]
    ]
  ]),
  ui-box("Badge de Licencia", [
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
#h1[Papelería y Tarjetas de Presentación]

La tarjeta de presentación institucional de Kaptiva App se rige por la geometría pura de Google, empleando una distribución horizontal con tipografía Roboto muy equilibrada.

#v(0.6cm)

#text(font: "Roboto", size: 7pt, tracking: 1.5pt, fill: text-muted)[FRENTE DE TARJETA (HORIZONTAL)]
#v(0.2cm)
#align(center)[
  #rect(
    fill: text-white,
    width: 9cm,
    height: 5cm,
    radius: 4pt,
    stroke: 0.5pt + border-dark,
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
            text(font: "Roboto", size: 12pt, weight: "bold", fill: rgb("020617"))[Kaptiva]
          )
          #v(1.6cm)
          #text(size: 6pt, fill: rgb("64748B"))[kaptiva-app.com]
        ]
      ],
      pad(right: 0.6cm, top: 0.5cm)[
        #align(right)[
          #text(size: 10pt, weight: "bold", fill: rgb("020617"))[Luis Silva] \
          #text(size: 6pt, fill: kaptiva-gold-dark, weight: "bold")[Fundador & CTO]
          #v(1.5cm)
          #text(size: 5.5pt, fill: rgb("334155"))[
            +58 412 000 0000 \
            soporte\@kaptiva-app.com
          ]
        ]
      ]
    )
  ]
]

#v(0.6cm)

#text(font: "Roboto", size: 7pt, tracking: 1.5pt, fill: text-muted)[REVERSO DE TARJETA (HORIZONTAL)]
#v(0.2cm)
#align(center)[
  #rect(
    fill: carbon-card,
    width: 9cm,
    height: 5cm,
    radius: 4pt,
    stroke: 0.5pt + border-dark,
  )[
    #align(center + horizon)[
      #kaptiva-logo(size: 32pt)
      #v(0.3cm)
      #text(font: "Roboto", size: 14pt, weight: "bold", fill: text-white)[Kaptiva]
      #v(0.1cm)
      #text(size: 5.5pt, tracking: 2pt, fill: text-muted)[CONTROL · EFICACIA · CRECIMIENTO]
    ]
  ]
]
