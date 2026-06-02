// Variables de Color de Kaptiva App
#let kaptiva-gold = rgb("EAB308") // Amarillo-Dorado principal (#eab308)
#let kaptiva-gold-dark = rgb("CA8A04") // Dorado oscuro (#ca8a04)
#let kaptiva-gold-light = rgb("FACC15") // Dorado claro (#facc15)
#let carbon-base = rgb("020617") // Fondo oscuro base (#020617 / Slate-950)
#let carbon-card = rgb("0F172A") // Tarjetas oscuras (#0f172a / Slate-900)
#let steel-surface = rgb("1E293B") // Superficies secundarias (#1e293b / Slate-800)
#let text-white = rgb("FFFFFF")
#let text-dark = rgb("1E293B")
#let text-secondary-dark = rgb("64748B")
#let border-light = rgb("E2E8F0")
#let border-dark = rgb("334155")
#let success-color = rgb("10B981") // Verde éxito (#10b981)

#set page(
  paper: "a4",
  margin: 1.5cm,
  fill: carbon-base,
  background: context {
    let page-num = counter(page).get().first()
    let is-light-page = page-num in (3, 8, 11)
    let num-color = if is-light-page { rgb("0000000A") } else { rgb("FFFFFF0D") }
    
    // Background decorations (Aura de brillo dorado)
    place(
      top + right,
      dx: 4.5cm,
      dy: -4.5cm,
      circle(radius: 12cm, fill: rgb("EAB3080A"))
    )
    place(
      bottom + left,
      dx: -3cm,
      dy: 3cm,
      circle(radius: 8cm, fill: rgb("EAB30808"))
    )
    
    // Grid Lines for Tech Aesthetic
    place(
      top + left,
      dx: 1.5cm,
      dy: 1.5cm,
      line(length: 4cm, angle: 45deg, stroke: 1pt + rgb("EAB30815"))
    )
    place(
      top + left,
      dx: 1.8cm,
      dy: 1.3cm,
      line(length: 3cm, angle: 45deg, stroke: 1.5pt + rgb("EAB30810"))
    )
    
    // Large page number in bottom-right corner
    if page-num > 1 {
      place(
        bottom + right,
        dx: 0.5cm,
        dy: 0.5cm,
        text(font: ("Plus Jakarta Sans", "Oswald", "Montserrat", "Arial"), size: 140pt, fill: num-color, weight: "bold")[#page-num]
      )
    }
  }
)

// Tipografía global
#set text(
  font: ("Plus Jakarta Sans", "Inter", "Liberation Sans", "Arial"),
  fill: text-white,
  size: 11pt,
)

// Estilos de titulares con color de relleno personalizable
#let h1(fill: kaptiva-gold, body) = text(font: ("Plus Jakarta Sans", "Oswald", "Arial"), size: 28pt, weight: "bold", fill: fill, body)
#let h2(fill: text-white, body) = text(font: ("Plus Jakarta Sans", "Oswald", "Arial"), size: 20pt, weight: "bold", fill: fill, body)

// ==========================================
// PÁGINA 1 - PORTADA (IDENTIDAD CORE)
// ==========================================
#align(center + horizon)[
  #v(-2cm)
  
  // Isotipo Geometrico Digital construido con Typst
  #block(
    width: 90pt,
    height: 90pt,
    radius: 20pt,
    fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold),
    stroke: 2pt + rgb("FFFFFF20"),
  )[
    #align(center + horizon)[
      #text(size: 42pt, fill: text-white, weight: "black")[K]
    ]
  ]
  
  #v(1.5cm)
  #text(font: ("Plus Jakarta Sans", "Oswald", "Arial"), size: 36pt, weight: "black", fill: text-white, tracking: 1.5pt)[
    KAPTIVA APP
  ]
  
  #v(0.5cm)
  #text(font: ("Plus Jakarta Sans", "Montserrat", "Arial"), size: 14pt, weight: "medium", tracking: 4pt, fill: kaptiva-gold)[
    MANUAL DE IDENTIDAD DE MARCA
  ]
  
  #v(0.8cm)
  #rect(width: 80pt, height: 3pt, fill: kaptiva-gold, radius: 1.5pt)
  
  #v(4cm)
  #text(font: ("Plus Jakarta Sans", "Montserrat", "Arial"), size: 10pt, fill: rgb("888888"), tracking: 1pt)[
    KAPTIVA APP SAAS POS \
    Versión 1.0 | 2026
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 2 - FILOSOFÍA DE MARCA Y TONO
// ==========================================
#h1[Filosofía de Marca y Tono]
#v(0.5cm)

*Kaptiva App* es un ecosistema SaaS ERP/POS moderno, diseñado específicamente para potenciar a las pequeñas y medianas empresas (panaderías, tiendas, bodegones, servicios) mediante herramientas de automatización de inventarios, gestión de ventas en tiempo real, facturación fiscal integrada y análisis inteligente con inteligencia artificial.

Nuestra visión es transformar la complejidad operativa diaria en una experiencia fluida, rápida y sumamente intuitiva. Ya no somos "Soft Tuuls"; hemos evolucionado a *Kaptiva*, una marca que captura oportunidades, retiene la eficiencia y proyecta solidez empresarial.

#v(1.0cm)

#let pillar-card(label, title, desc) = rect(
  fill: carbon-card,
  radius: 10pt,
  width: 100%,
  inset: (x: 0.8cm, y: 0.6cm),
  stroke: (left: 4pt + kaptiva-gold),
)[
  #text(size: 8pt, weight: "bold", tracking: 2pt, fill: kaptiva-gold)[#label]
  #v(0.2cm)
  #text(size: 14pt, weight: "bold", fill: text-white)[#title]
  #v(0.2cm)
  #text(size: 9.5pt, fill: rgb("A0AEC0"))[#desc]
]

#grid(
  columns: (1fr),
  gutter: 0.8cm,
  pillar-card("PILAR 01", "CONTROL TOTAL", "Brindamos una visibilidad absoluta sobre el inventario y las finanzas. Nada se escapa, todo queda registrado y auditable."),
  pillar-card("PILAR 02", "SIMPLICIDAD PREMIUM", "Hacemos que lo complejo parezca fácil. La interfaz fluye con animaciones sutiles, layouts responsivos y acciones instantáneas."),
  pillar-card("PILAR 03", "EVOLUCIÓN E INNOVACIÓN", "Integramos el poder de la IA en la analítica de negocios local para predecir stock y dar recomendaciones inteligentes.")
)

#pagebreak()

// ==========================================
// PÁGINA 3 - EL LOGOTIPO Y CONSTRUCCIÓN (LIGHT MODE)
// ==========================================
#page(fill: rgb("F8FAFC"))[
  #set text(fill: text-dark)
  #h1(fill: kaptiva-gold-dark)[El Logotipo y Construcción]
  #v(0.5cm)
  
  El logotipo de *Kaptiva App* consta de dos componentes fundamentales: el *Isotipo* (el icono de caja/cubo tridimensional simplificado o la letra K icónica) y el *Logotipo* (la palabra Kaptiva App escrita con la fuente Sans-serif geométrica *Plus Jakarta Sans*).
  
  El isotipo representa la estructura, el almacenamiento seguro (caja de inventario) y la adaptabilidad modular de nuestra base de datos.
  
  #v(1cm)
  
  #align(center)[
    #block(
      stroke: (paint: kaptiva-gold-dark, dash: "dashed", thickness: 1.5pt),
      inset: (x: 2.5cm, y: 1.8cm),
      fill: rgb("E2E8F0"),
      radius: 12pt,
    )[
      #align(center + horizon)[
        #grid(
          columns: (auto, auto),
          gutter: 20pt,
          align: horizon,
          block(
            width: 50pt,
            height: 50pt,
            radius: 10pt,
            fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold),
          )[
            #align(center + horizon)[
              #text(size: 24pt, fill: text-white, weight: "black")[K]
            ]
          ],
          text(size: 32pt, weight: "black", fill: text-dark)[Kaptiva]
        )
      ]
    ]
    #v(0.5cm)
    #text(size: 9pt, fill: text-secondary-dark)[
      Proporciones oficiales de marca e isotipo con el bloque K de gradiente dorado.
    ]
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 4 - ÁREA DE PROTECCIÓN Y ESCALA
// ==========================================
#h1[Área de Protección y Escala]
#v(0.8cm)

Para asegurar la legibilidad e impacto visual del logotipo de *Kaptiva App* en todas sus aplicaciones, se establece un área de protección obligatoria equivalente a la altura total de la letra *K* en el logotipo. Ningún elemento (texto, imágenes o bordes) debe invadir este espacio circundante.

El tamaño mínimo de reproducción digital recomendado es de *120px* de ancho para el conjunto completo y *32px* para el isotipo solo (favicon / barra de navegación móvil).

#v(1.5cm)

#align(center)[
  #block(
    stroke: 1pt + border-dark,
    inset: (x: 2cm, y: 1.5cm),
    fill: carbon-card,
    radius: 12pt,
  )[
    #rect(
      stroke: (paint: kaptiva-gold, dash: "dashed", thickness: 1pt),
      inset: 1cm,
      fill: steel-surface,
      radius: 8pt,
    )[
      #grid(
        columns: (auto, auto),
        gutter: 15pt,
        align: horizon,
        block(
          width: 40pt,
          height: 40pt,
          radius: 8pt,
          fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold),
        )[
          #align(center + horizon)[
            #text(size: 20pt, fill: text-white, weight: "black")[K]
          ]
        ],
        text(size: 26pt, weight: "black", fill: text-white)[Kaptiva]
      )
    ]
  ]
  #v(0.5cm)
  #text(size: 9pt, fill: rgb("888888"))[
    Línea punteada amarilla indicando el límite de seguridad (Área X de protección).
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 5 - VARIANTES CROMÁTICAS
// ==========================================
#h1[Variantes Cromáticas]
#v(0.5cm)

Para mantener una consistencia visual rigurosa, se especifican las cuatro variantes autorizadas del logotipo. Cualquier otra combinación de colores o alteración del contraste queda estrictamente prohibida.

#v(1.0cm)

#let variant-card(bg, content-fn, desc, border) = rect(
  fill: bg,
  width: 100%,
  height: 6.8cm,
  radius: 10pt,
  stroke: border,
)[
  #align(center + horizon)[
    #content-fn()
    #v(0.8cm)
    #text(size: 9.5pt, fill: if bg == text-white { text-dark } else { rgb("AAAAAA") }, weight: "bold")[#desc]
  ]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1cm,
  variant-card(carbon-card, () => {
    grid(
      columns: (auto, auto),
      gutter: 10pt,
      align: horizon,
      block(width: 30pt, height: 30pt, radius: 6pt, fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold))[#align(center + horizon)[#text(size: 15pt, fill: text-white, weight: "black")[K]]],
      text(size: 20pt, weight: "bold", fill: text-white)[Kaptiva]
    )
  }, "Color Oficial (Fondo Oscuro)", 1pt + border-dark),
  
  variant-card(text-white, () => {
    grid(
      columns: (auto, auto),
      gutter: 10pt,
      align: horizon,
      block(width: 30pt, height: 30pt, radius: 6pt, fill: kaptiva-gold-dark)[#align(center + horizon)[#text(size: 15pt, fill: text-white, weight: "black")[K]]],
      text(size: 20pt, weight: "bold", fill: text-dark)[Kaptiva]
    )
  }, "Negativo (Fondo Claro)", 1pt + border-light),
  
  variant-card(kaptiva-gold, () => {
    grid(
      columns: (auto, auto),
      gutter: 10pt,
      align: horizon,
      block(width: 30pt, height: 30pt, radius: 6pt, fill: carbon-base)[#align(center + horizon)[#text(size: 15pt, fill: kaptiva-gold, weight: "black")[K]]],
      text(size: 20pt, weight: "bold", fill: carbon-base)[Kaptiva]
    )
  }, "Alto Contraste Invertido", none),
  
  variant-card(steel-surface, () => {
    grid(
      columns: (auto, auto),
      gutter: 10pt,
      align: horizon,
      block(width: 30pt, height: 30pt, radius: 6pt, fill: rgb("E2E8F0"))[#align(center + horizon)[#text(size: 15pt, fill: steel-surface, weight: "black")[K]]],
      text(size: 20pt, weight: "bold", fill: rgb("E2E8F0"))[Kaptiva]
    )
  }, "Monocromo Escala de Grises", 1pt + border-dark)
)

#pagebreak()

// ==========================================
// PÁGINA 6 - USOS INCORRECTOS
// ==========================================
#h1[Usos Incorrectos]
#v(0.5cm)

El logotipo de Kaptiva App es el activo más representativo del software. A continuación se muestran aplicaciones incorrectas que distorsionan el mensaje de la marca y comprometen su seriedad y calidad técnica.

#v(0.8cm)

#let wrong-card(reason, content-fn) = rect(
  fill: carbon-card,
  radius: 10pt,
  width: 100%,
  height: 6.8cm,
  stroke: 1pt + border-dark,
)[
  #align(center)[
    #v(0.8cm)
    #content-fn()
    #v(1fr)
    #text(fill: rgb("EF4444"), weight: "bold", size: 12pt)[#reason]
    #v(0.8cm)
  ]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1cm,
  wrong-card("NO DEFORMAR", () => {
    v(0.5cm)
    scale(x: 150%, y: 50%)[
      #grid(columns: 2, gutter: 8pt, align: horizon, block(width: 20pt, height: 20pt, fill: kaptiva-gold)[], text(size: 14pt, weight: "bold")[Kaptiva])
    ]
  }),
  wrong-card("NO ROTAR", () => {
    v(0.8cm)
    rotate(15deg)[
      #grid(columns: 2, gutter: 8pt, align: horizon, block(width: 25pt, height: 25pt, fill: kaptiva-gold)[], text(size: 18pt, weight: "bold")[Kaptiva])
    ]
  }),
  wrong-card("NO ALTERAR COLORES", () => {
    v(0.8cm)
    grid(
      columns: 2,
      gutter: 8pt,
      align: horizon,
      block(width: 25pt, height: 25pt, fill: rgb("E6007E"))[],
      text(size: 18pt, weight: "bold", fill: rgb("3B82F6"))[Kaptiva]
    )
  }),
  wrong-card("NO USAR TIPOGRAFÍA SERIF", () => {
    v(0.8cm)
    grid(
      columns: 2,
      gutter: 8pt,
      align: horizon,
      block(width: 25pt, height: 25pt, fill: kaptiva-gold)[],
      text(font: "Times New Roman", size: 20pt, style: "italic", weight: "regular")[Kaptiva]
    )
  })
)

#pagebreak()

// ==========================================
// PÁGINA 7 - SISTEMA DE COLOR
// ==========================================
#h1[Sistema de Color]
#v(0.8cm)

El color principal de Kaptiva es el *Oro Kaptiva* (representado por el código `#eab308`), un tono vibrante que simboliza la prosperidad comercial, el éxito transaccional y la energía emprendedora. Se acompaña por la profundidad sobria y elegante del *Gris Pizarra Oscuro* (nuestros fondos de interfaz en modo noche).

#v(1.2cm)

#let color-details(title, hex, rgb-val, usage) = stack(
  dir: ttb,
  spacing: 12pt,
  rect(
    fill: rgb(hex),
    width: 100%,
    height: 8.5cm,
    radius: 10pt,
    stroke: if hex == "#020617" { 1pt + border-dark } else { none }
  ),
  text(weight: "bold", size: 16pt, fill: text-white)[#title],
  v(0.1cm),
  text(size: 10pt, fill: rgb("CBD5E1"))[*HEX:* #hex],
  text(size: 10pt, fill: rgb("CBD5E1"))[*RGB:* #rgb-val],
  text(size: 10pt, fill: rgb("CBD5E1"))[*USO:* #usage]
)

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 1cm,
  color-details("Kaptiva Gold", "#EAB308", "234, 179, 8", "Color Primario / CTA / Enfoque"),
  color-details("Slate Dark Base", "#020617", "2, 6, 23", "Fondo Base de la Aplicación"),
  color-details("Steel Surface", "#1E293B", "30, 41, 59", "Tarjetas y Bordes de Interfaz")
)

#pagebreak()

// ==========================================
// PÁGINA 8 - SISTEMA TIPOGRÁFICO (LIGHT MODE)
// ==========================================
#page(fill: rgb("F8FAFC"))[
  #set text(fill: text-dark)
  #h1(fill: kaptiva-gold-dark)[Sistema Tipográfico]
  #v(0.5cm)
  
  Kaptiva App utiliza tipografías modernas de corte geométrico y alta legibilidad para interfaces de usuario avanzadas y paneles densos en datos de facturación.
  
  #v(0.8cm)
  
  #let spec(font-name, weight-name, weight-val) = [
    #block(
      stroke: (left: 4pt + kaptiva-gold-dark),
      inset: (left: 0.6cm, top: 0.2cm, bottom: 0.2cm),
    )[
      #text(font: font-name, size: 22pt, weight: weight-val, fill: text-dark)[Aa Bb Cc Dd Ee]
      #v(0.05cm)
      #text(font: font-name, size: 14pt, weight: weight-val, fill: text-dark)[0123456789]
      #v(0.2cm)
      #text(font: font-name, size: 9pt, fill: text-secondary-dark)[#font-name - #weight-name]
    ]
    #v(0.4cm)
  ]
  
  #grid(
    columns: (1fr, 1fr),
    gutter: 1cm,
    [
      #h2(fill: text-dark)[Titulares: Plus Jakarta Sans]
      #v(0.3cm)
      #spec("Plus Jakarta Sans", "ExtraBold", "extrabold")
      #spec("Plus Jakarta Sans", "Bold", "bold")
    ],
    [
      #h2(fill: text-dark)[Lectura y Datos: Inter]
      #v(0.3cm)
      #spec("Inter", "SemiBold", "semibold")
      #spec("Inter", "Medium", "medium")
    ]
  )
]

#pagebreak()

// ==========================================
// PÁGINA 9 - INTERFAZ DE USUARIO (BRANDING)
// ==========================================
#h1[Diseño de Interfaz y Componentes]
#v(0.5cm)

El sistema visual de *Kaptiva App* implementa un diseño tecnológico sofisticado conocido como *Glassmorphism*, el cual combina fondos oscuros y profundos con paneles semitransparentes, bordes definidos y acentos resplandecientes en color dorado.

#v(1.0cm)

#let comp-preview(name, preview-block) = rect(
  fill: carbon-card,
  width: 100%,
  inset: 0.6cm,
  radius: 12pt,
  stroke: 1pt + border-dark,
)[
  #text(size: 10pt, weight: "bold", fill: kaptiva-gold)[#name]
  #v(0.5cm)
  #align(center)[#preview-block]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 1cm,
  comp-preview("Botón Primario (CTA)", [
    #rect(
      fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold),
      radius: 12pt,
      inset: (x: 1.5cm, y: 0.4cm),
      stroke: none,
    )[
      #text(weight: "bold", size: 10pt, fill: text-white)[Procesar Venta]
    ]
  ]),
  comp-preview("Botón Secundario / Outline", [
    #rect(
      fill: none,
      radius: 12pt,
      inset: (x: 1.5cm, y: 0.4cm),
      stroke: 1.5pt + border-dark,
    )[
      #text(weight: "bold", size: 10pt, fill: rgb("CBD5E1"))[Ver Historial]
    ]
  ]),
  comp-preview("Input de Formulario", [
    #rect(
      fill: steel-surface,
      width: 80%,
      radius: 8pt,
      inset: (x: 0.4cm, y: 0.3cm),
      stroke: 1pt + kaptiva-gold,
    )[
      #align(left)[
        #text(size: 9pt, fill: text-white)[\$ 125.00]
      ]
    ]
  ]),
  comp-preview("Badge de Suscripción", [
    #rect(
      fill: rgb("10B98115"),
      radius: 10pt,
      inset: (x: 0.6cm, y: 0.2cm),
      stroke: 1pt + rgb("10B98150"),
    )[
      #text(weight: "black", size: 8pt, fill: success-color)[LICENCIA GOLD]
    ]
  ])
)

#pagebreak()

// ==========================================
// PÁGINA 10 - PAPELERÍA CORPORATIVA
// ==========================================
#page(fill: text-white)[
  #set text(fill: text-dark)
  #h1(fill: kaptiva-gold-dark)[Papelería y Tarjetas]
  #v(0.2cm)
  
  Diseño de la tarjeta de presentación institucional (formato estándar de 9 x 5 cm) que refleja el espíritu tecnológico y la sobriedad premium de *Kaptiva App*.
  
  #v(1cm)
  
  // FRENTE DE TARJETA
  #text(font: "Inter", size: 7pt, tracking: 2pt, fill: text-secondary-dark)[FRENTE DE TARJETA]
  #v(0.3cm)
  #align(center)[
    #rect(
      fill: carbon-base,
      width: 9cm,
      height: 5cm,
      radius: 6pt,
      stroke: 0.5pt + rgb("334155"),
    )[
      // Barra de acento dorado izquierda
      #place(left + top, dx: 0pt, dy: 0pt,
        rect(fill: kaptiva-gold, width: 3pt, height: 100%, radius: (top-left: 6pt, bottom-left: 6pt))
      )
      
      #grid(
        columns: (50%, 50%),
        pad(left: 0.5cm, top: 0.6cm)[
          #align(left)[
            #grid(
              columns: (auto, auto),
              gutter: 6pt,
              align: horizon,
              block(width: 15pt, height: 15pt, radius: 4pt, fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold))[
                #align(center + horizon)[#text(size: 8pt, fill: text-white, weight: "black")[K]]
              ],
              text(size: 11pt, weight: "black", fill: text-white)[Kaptiva]
            )
            #v(1.6cm)
            #text(size: 5pt, fill: rgb("94A3B8"))[kaptiva-app.com]
          ]
        ],
        pad(right: 0.5cm, top: 0.6cm)[
          #align(right + top)[
            #text(size: 9pt, weight: "extrabold", fill: text-white)[Luis Silva] \
            #text(size: 5.5pt, fill: kaptiva-gold, weight: "bold")[Fundador & CTO]
            #v(1.5cm)
            #text(size: 5pt, fill: rgb("E2E8F0"))[
              +58 412 000 0000 \
              soporte\@kaptiva-app.com
            ]
          ]
        ]
      )
    ]
  ]
  
  #v(1.0cm)
  
  // REVERSO DE TARJETA
  #text(font: "Inter", size: 7pt, tracking: 2pt, fill: text-secondary-dark)[REVERSO DE TARJETA]
  #v(0.3cm)
  #align(center)[
    #rect(
      fill: carbon-card,
      width: 9cm,
      height: 5cm,
      radius: 6pt,
      stroke: 0.5pt + rgb("334155"),
    )[
      #place(center + horizon,
        circle(radius: 2.5cm, fill: rgb("EAB30803"))
      )
      #place(center + horizon,
        circle(radius: 1.5cm, fill: rgb("EAB30805"))
      )
      
      #align(center + horizon)[
        #grid(
          columns: (auto, auto),
          gutter: 8pt,
          align: horizon,
          block(width: 22pt, height: 22pt, radius: 6pt, fill: gradient.linear(kaptiva-gold-dark, kaptiva-gold))[
            #align(center + horizon)[#text(size: 11pt, fill: text-white, weight: "black")[K]]
          ],
          text(size: 16pt, weight: "black", fill: text-white)[Kaptiva]
        )
        #v(0.5cm)
        #text(size: 6pt, tracking: 3pt, fill: rgb("CBD5E1"))[EFICACIA · CONTROL · CRECIMIENTO]
      ]
    ]
  ]
]
