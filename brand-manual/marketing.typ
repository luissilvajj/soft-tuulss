// Variables de Color de Kaptiva App (Google Material Dark Palette)
#let kaptiva-gold = rgb("EAB308")
#let kaptiva-gold-dark = rgb("CA8A04")
#let kaptiva-gold-light = rgb("FACC15")
#let carbon-base = rgb("020617")
#let carbon-card = rgb("0F172A")
#let steel-surface = rgb("1E293B")
#let text-white = rgb("FFFFFF")
#let text-dark-body = rgb("94A3B8")
#let text-muted = rgb("64748B")
#let border-dark = rgb("334155")
#let success-color = rgb("10B981")

#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 2.5cm, right: 2.5cm),
  fill: carbon-base,
  background: context {
    let page-num = counter(page).get().first()
    let num-color = rgb("FFFFFF06") // Sutil número de página
    
    // Glowing orbs of gold (Efecto de iluminación de fondo premium)
    place(
      top + right,
      dx: 4.5cm,
      dy: -4.5cm,
      circle(radius: 12cm, fill: rgb("EAB3080A")) // 4% de opacidad para el orbe dorado
    )
    place(
      bottom + left,
      dx: -3cm,
      dy: 3cm,
      circle(radius: 8cm, fill: rgb("EAB30805")) // 2% de opacidad
    )
    // Líneas tecnológicas en diagonal en esquinas
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
      line(length: 3cm, angle: 45deg, stroke: 1.5pt + rgb("EAB3080E"))
    )
    
    // Número de página gigante en el fondo (a partir de la página 2)
    if page-num > 1 {
      place(
        bottom + right,
        dx: 0.5cm,
        dy: 0.5cm,
        text(font: ("Roboto", "Arial"), size: 140pt, fill: num-color, weight: "bold")[#page-num]
      )
    }
  },
  header: context {
    let page-num = counter(page).get().first()
    if page-num > 1 [
      #grid(
        columns: (1fr, 1fr),
        align(left)[#text(size: 8pt, weight: "bold", fill: text-muted, tracking: 1.5pt)[KAPTIVA APP]],
        align(right)[#text(size: 8pt, weight: "bold", fill: border-dark, tracking: 1pt)[ESTRATEGIA DE CRECIMIENTO]]
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
        align(left)[#text(size: 8pt, fill: border-dark)[Confidencial | Plan de Marketing 2026]],
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

// Helpers de Encabezados con Acento Gold
#let h1(body) = {
  v(0.3cm)
  text(font: ("Roboto", "Arial"), size: 24pt, weight: "bold", fill: text-white, tracking: 0.5pt)[#body]
  v(0.15cm)
  rect(width: 30pt, height: 2pt, fill: kaptiva-gold, radius: 1pt)
  v(0.5cm)
}
#let h2(body) = {
  v(0.2cm)
  text(font: ("Roboto", "Arial"), size: 13pt, weight: "bold", fill: text-white)[#body]
  v(0.3cm)
}

// LOGO VECTORIAL SIMPLE DE PORTADA
#let logo-preview(size: 40pt) = {
  let scale-factor = size / 24pt
  block(width: size, height: size)[
    #place(left + top, polygon(
      (12pt * scale-factor, 3.5pt * scale-factor),
      (2pt * scale-factor, 13.5pt * scale-factor),
      (12pt * scale-factor, 23.5pt * scale-factor),
      fill: kaptiva-gold-dark,
      stroke: 1.2pt * scale-factor + carbon-base
    ))
    #place(left + top, polygon(
      (12pt * scale-factor, 3.5pt * scale-factor),
      (22pt * scale-factor, 13.5pt * scale-factor),
      (12pt * scale-factor, 13.5pt * scale-factor),
      fill: kaptiva-gold,
      stroke: 1.2pt * scale-factor + carbon-base
    ))
    #place(left + top, polygon(
      (12pt * scale-factor, 13.5pt * scale-factor),
      (22pt * scale-factor, 13.5pt * scale-factor),
      (12pt * scale-factor, 23.5pt * scale-factor),
      fill: kaptiva-gold-light,
      stroke: 1.2pt * scale-factor + carbon-base
    ))
  ]
}

// ==========================================
// PÁGINA 1 - PORTADA
// ==========================================
#align(center + horizon)[
  #v(-1cm)
  #logo-preview(size: 60pt)
  #v(1cm)
  #text(font: ("Roboto", "Arial"), size: 28pt, weight: "bold", fill: text-white, tracking: 1.5pt)[Estrategia de Crecimiento]
  #v(0.2cm)
  #text(font: ("Roboto", "Arial"), size: 11pt, weight: "medium", fill: kaptiva-gold, tracking: 3pt)[CÓMO ATACAR EL MERCADO Y AUMENTAR VENTAS]
  #v(0.8cm)
  #rect(width: 40pt, height: 2pt, fill: kaptiva-gold, radius: 1pt)
  #v(4.5cm)
  #text(font: ("Roboto", "Arial"), size: 8.5pt, fill: text-muted, tracking: 1pt)[
    KAPTIVA APP SAAS ERP/POS \
    Documento de Dirección Comercial \
    Versión 1.0 | 2026
  ]
]

#pagebreak()

// ==========================================
// PÁGINA 2 - RESUMEN EJECUTIVO & PILARES
// ==========================================
#h1[Resumen Ejecutivo]

El mercado de software POS y ERP para microempresas y pymes en Latinoamérica se encuentra altamente fragmentado entre soluciones extremadamente arcaicas de escritorio y sistemas web excesivamente complejos de configurar. 

*Kaptiva App* tiene una oportunidad única al posicionarse como el sistema **"más rápido, intuitivo y resiliente"** del mercado, apalancándose en su capacidad *offline-first* y su diseño optimizado al estilo Google Material. Este plan detalla los canales de adquisición directa e indirecta para acelerar el volumen de transacciones de suscripción (ARR).

#v(0.8cm)

#h2[Pilares de la Estrategia]

#let strategy-card(num, title, body-text) = rect(
  fill: carbon-card,
  radius: 8pt,
  width: 100%,
  stroke: 1pt + border-dark,
  inset: 0.5cm,
)[
  #grid(
    columns: (40pt, 1fr),
    gutter: 10pt,
    align: horizon,
    circle(radius: 15pt, fill: rgb("EAB3081A"), stroke: 1.5pt + kaptiva-gold)[
      #align(center + horizon)[#text(weight: "bold", fill: kaptiva-gold)[#num]]
    ],
    [
      #text(weight: "bold", fill: text-white, size: 11pt)[#title] \
      #v(0.05cm)
      #text(fill: text-dark-body, size: 9pt)[#body-text]
    ]
  )
]

#stack(
  dir: ttb,
  spacing: 0.4cm,
  strategy-card("01", "Facilidad de Adopción (Zero Friction)", "Reducir la fricción de entrada mediante plantillas de inventario pre-cargadas y pruebas guiadas de 14 días."),
  strategy-card("02", "Distribución Multicanal", "Apalancarse en alianzas de hardware POS (balanzas/impresoras) y visitas físicas del equipo de ventas."),
  strategy-card("03", "Bucle de Referidos Orgánico", "Convertir a cada cliente activo en un promotor de la marca mediante incentivos mutuos de gratuidad.")
)

#pagebreak()

// ==========================================
// PÁGINA 3 - BUYER PERSONAS
// ==========================================
#h1[Segmentación de Mercado]

Para optimizar el presupuesto de adquisición, nos enfocaremos en dos perfiles clave que concentran el 80% de la facturación en retail.

#v(0.5cm)

#let persona-card(name, details, pain, solution) = rect(
  fill: carbon-card,
  radius: 8pt,
  width: 100%,
  stroke: 1pt + border-dark,
  inset: 0.5cm,
)[
  #text(weight: "bold", fill: kaptiva-gold, size: 12pt)[#name] \
  #text(size: 7.5pt, fill: text-muted)[#details]
  #v(0.3cm)
  #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      #text(weight: "bold", fill: text-white, size: 9pt)[Puntos de Dolor:] \
      #text(size: 8.5pt, fill: text-dark-body)[#pain]
    ],
    [
      #text(weight: "bold", fill: text-white, size: 9pt)[Ángulo de Venta:] \
      #text(size: 8.5pt, fill: text-dark-body)[#solution]
    ]
  )
]

#stack(
  dir: ttb,
  spacing: 0.6cm,
  persona-card(
    "El Comerciante Tradicional",
    "Dueño de bodegas, pequeños abastos, tiendas de calzado locales.",
    "Falta de control de inventario, pérdida de mercancía por robos menores, temor a sistemas POS difíciles de aprender.",
    "Carga de inventario express en 3 minutos. Interfaz simplificada sin necesidad de entrenamiento previo."
  ),
  persona-card(
    "El Administrador Multi-Tienda",
    "Dueño de mini-markets o farmacias con 2 a 5 sucursales activas.",
    "Desconexión entre locales, reportes financieros atrasados, pérdidas de venta cada vez que falla el internet.",
    "Operación offline-first asegurada. Reportes de caja unificados en tiempo real directo a su dispositivo móvil."
  )
)

#pagebreak()

// ==========================================
// PÁGINA 4 - CANALES DE ADQUISICIÓN
// ==========================================
#h1[Canales de Captación de Clientes]

Implementaremos un mix de canales directos de campo (Outbound) e indirectos (Inbound/Alianzas) para mantener un costo de adquisición (CAC) saludable.

#v(0.5cm)

#let channel-box(title, metrics, tactics) = rect(
  fill: carbon-card,
  radius: 8pt,
  stroke: 1pt + border-dark,
  inset: 0.5cm,
  width: 100%,
)[
  #text(weight: "bold", fill: text-white, size: 12pt)[#title] \
  #text(size: 7.5pt, fill: kaptiva-gold, weight: "bold")[MÉTRICA CLAVE: #metrics]
  #v(0.2cm)
  #text(size: 8.5pt, fill: text-dark-body)[#tactics]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.6cm,
  channel-box(
    "Ventas de Campo (Outbound)",
    "Conversión de Visita a Trial (>25%)",
    "Equipo comercial local visitando zonas de alto flujo de retail. Se ofrece un diagnóstico gratuito de caja en 15 minutos en el propio comercio para enganchar la prueba gratuita."
  ),
  channel-box(
    "POS Hardware Bundles",
    "Ventas por Alianzas (Unidades POS)",
    "Acuerdos con importadores locales de impresoras térmicas, balanzas y lectores de barra. Ofrecer Kaptiva pre-instalado como el software oficial en combos listos para usar."
  ),
  channel-box(
    "Búsqueda Local (SEO)",
    "Tráfico Orgánico Calificado",
    "Posicionamiento de artículos y guías prácticas de inventarios y facturación fiscal local. Captura de leads mediante plantillas descargables de control diario."
  ),
  channel-box(
    "Ads en Meta e Instagram",
    "Costo por Conversión (CPA < $12)",
    "Videos de corta duración mostrando lo fácil que es registrar una venta o realizar un reporte. Enfoque hiper-localizado a administradores y dueños de negocio."
  )
)

#pagebreak()

// ==========================================
// PÁGINA 5 - FUNNEL & ONBOARDING
// ==========================================
#h1[Activación del Embudo de Ventas]

Adquirir un lead no sirve de nada si este no experimenta el valor real del sistema en sus primeras horas. Nuestro embudo está optimizado para agilizar la activación de la cuenta.

#v(0.8cm)

#let funnel-step(num, title, metric, action) = rect(
  fill: carbon-card,
  radius: 8pt,
  stroke: (left: 3pt + kaptiva-gold, rest: 1pt + border-dark),
  inset: (x: 0.6cm, y: 0.4cm),
  width: 100%,
)[
  #grid(
    columns: (1fr, auto),
    [
      #text(size: 8pt, weight: "bold", fill: text-muted)[PASO #num] \
      #text(weight: "bold", fill: text-white, size: 11pt)[#title] \
      #text(size: 9pt, fill: text-dark-body)[#action]
    ],
    align(right + horizon)[
      #rect(fill: rgb("EAB30810"), radius: 4pt, stroke: 0.5pt + kaptiva-gold, inset: 4pt)[
        #text(size: 8pt, fill: kaptiva-gold, weight: "bold")[#metric]
      ]
    ]
  )
]

#stack(
  dir: ttb,
  spacing: 0.4cm,
  funnel-step("01", "Registro & Magic Onboarding", "Fricción Mínima", "El usuario inicia la prueba. Para evitar el bloqueo de carga de datos, se le asigna una plantilla base de productos precargados de acuerdo a su rubro comercial."),
  funnel-step("02", "Primer Cierre de Caja", "Hito de Activación", "Al realizar su primer registro de caja diario exitoso, el sistema le envía un reporte automatizado a su celular móvil para evidenciar el control."),
  funnel-step("03", "Hito de Valor (50 Ventas)", "Conversión a Pago (>15%)", "Al acumular 50 ventas procesadas, el usuario recibe soporte dedicado de bienvenida para ayudarle a elegir su plan mensual de pago."),
  funnel-step("04", "Efecto Red (Referidos)", "Bucle Viral", "Se premia al comerciante activo otorgando 1 mes gratuito por cada referido que complete su primer pago del sistema POS.")
)

#pagebreak()

// ==========================================
// PÁGINA 6 - ESTRATEGIA DE REDES SOCIALES (INSTAGRAM)
// ==========================================
#h1[Estrategia de Instagram & Redes]

Instagram no es solo una vitrina estética para Kaptiva App; es nuestro canal principal de generación de leads consultivos (conversaciones por Mensaje Directo). La estrategia se centra en la empatía con el dolor diario del comerciante y la demostración inmediata de la solución.

#v(0.5cm)

#h2[Pilares de Contenido (Content Pillars)]

#let pillar-item(num, name, description) = rect(
  fill: carbon-card,
  radius: 8pt,
  stroke: 1pt + border-dark,
  inset: 0.4cm,
  width: 100%,
)[
  #text(weight: "bold", fill: kaptiva-gold, size: 10pt)[Pilar #num: #name] \
  #v(0.05cm)
  #text(size: 8.5pt, fill: text-dark-body)[#description]
]

#grid(
  columns: (1fr, 1fr),
  gutter: 0.5cm,
  pillar-item("01", "Dolores de Caja", "Videos humorísticos o empáticos sobre el descuadre de caja al final del día, billetes falsos o robos hormiga. Genera identificación inmediata."),
  pillar-item("02", "Demos Flash (15s)", "Grabaciones de pantalla fluidas en tableta o laptop mostrando: 'Cómo facturar un producto en 3 clics' o 'Cierre de caja en 10 segundos'."),
  pillar-item("03", "Casos de Éxito", "Testimonios en formato Reel de dueños de comercios reales locales (ej. 'Antes tardaba 1 hora en cerrar caja, ahora lo hago en 2 minutos con Kaptiva')."),
  pillar-item("04", "Educación de Negocios", "Carruseles informativos y educativos: 'Cómo calcular tu margen de ganancia real', 'Cómo evitar pérdidas en tu inventario'.")
)

#v(0.5cm)

#h2[Estrategia de Conversión: DM & ManyChat]
El objetivo de cada publicación orgánica o pautada es llevar al usuario a comentar una palabra clave (ej. *CAJA* o *PRUEBA*). 
*   **Gancho (Caption)**: Explicar el dolor del inventario y terminar con: *"Comenta la palabra CAJA abajo y te enviamos un acceso exclusivo de 14 días gratis por DM"*.
*   **ManyChat (Automatización)**: Envío automático por mensaje directo de un enlace optimizado que abre una conversación de WhatsApp con el soporte para activar la cuenta o registra su email directamente en la web.

#pagebreak()

// ==========================================
// PÁGINA 7 - CALENDARIO SEMANAL Y GUIONES
// ==========================================
#h1[Calendario Semanal & Guión Reel]

Para mantener consistencia, se propone un calendario de publicación ágil enfocado en formatos de alto impacto orgánico (Reels y Carruseles) y venta directa.

#v(0.4cm)

#h2[Calendario de Publicación Semanal]
*   **Lunes (Reel - Pilar Dolores)**: Humor o situación real sobre el dolor de contar billetes al final del día.
*   **Miércoles (Carrusel - Pilar Educación)**: 3 errores que cometen los comercios de retail al fijar precios.
*   **Viernes (Reel - Pilar Demo)**: Demostración rápida de cómo Kaptiva factura sin conexión a internet.
*   **Domingo (Historias - Interacción)**: Caja de preguntas con stickers para resolver dudas sobre control de inventario.

#v(0.5cm)

#h2[Guión de Reel de Alta Conversión (Ejemplo)]
#rect(
  fill: carbon-card,
  radius: 8pt,
  stroke: 1pt + border-dark,
  inset: 0.5cm,
  width: 100%,
)[
  #text(weight: "bold", fill: text-white, size: 10.5pt)[Estructura de Reel: 'El Misterio del Dinero Perdido'] \
  #v(0.2cm)
  #text(size: 8.5pt, fill: text-dark-body)[
    *   **0:00 - 0:03 (Gancho Visual)**: Muestra al dueño de un comercio rascándose la cabeza al lado de una calculadora. Texto en pantalla: *"¿Por qué nunca cuadra la caja al final del día?"*.
    *   **0:03 - 0:10 (Dolor)**: Explicación de los pequeños robos hormiga y las ventas no anotadas en el cuaderno comercial. *"Escribir todo a mano hace que pierdas hasta un 15% de tus ganancias mensuales sin darte cuenta..."*.
    *   **0:10 - 0:20 (Solución/Demo)**: Se muestra la pantalla de Kaptiva en una tableta registrando un producto rápidamente con lector de barras. *"Con Kaptiva App, cada venta queda registrada al instante. Haces tu cierre de caja con 1 botón y controlas tu stock en tiempo real desde tu móvil"*.
    *   **0:20 - 0:25 (Llamado a la Acción)**: *"Comenta la palabra 'PRUEBA' y te damos 14 días gratis para que automatices tu negocio hoy mismo"*.
  ]
]
