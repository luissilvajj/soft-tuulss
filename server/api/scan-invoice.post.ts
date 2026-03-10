// Phase 25: IA para Compras - Gemini Vision Invoice Scanner
// POST /api/scan-invoice
// Recibe una imagen de factura y la envía a Gemini para extraer datos estructurados

import { GoogleGenerativeAI } from '@google/genai'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    
    if (!config.geminiApiKey) {
        throw createError({ statusCode: 500, message: 'GEMINI_API_KEY no configurada' })
    }

    // Leer la imagen del body (multipart/form-data)
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
        throw createError({ statusCode: 400, message: 'No se recibió ninguna imagen' })
    }

    const imageFile = formData.find(f => f.name === 'image')
    if (!imageFile || !imageFile.data) {
        throw createError({ statusCode: 400, message: 'Archivo de imagen requerido (campo: image)' })
    }

    // Convertir el buffer a base64
    const base64Image = imageFile.data.toString('base64')
    const mimeType = imageFile.type || 'image/jpeg'

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Eres un experto en contabilidad venezolana. Analiza esta imagen de una factura o nota de entrega de un proveedor.

Extrae TODOS los datos en el siguiente formato JSON estricto. Si no puedes determinar un campo, usa null.

{
  "proveedor": {
    "nombre": "Razón Social del Proveedor",
    "rif": "J-12345678-9",
    "direccion": "Dirección si es visible",
    "telefono": "Teléfono si es visible"
  },
  "factura": {
    "numero": "Número de factura",
    "control": "Número de control",
    "fecha": "DD/MM/YYYY",
    "condicion_pago": "Contado o Crédito"
  },
  "items": [
    {
      "descripcion": "Nombre del producto/servicio",
      "cantidad": 10,
      "precio_unitario": 5.50,
      "total": 55.00
    }
  ],
  "totales": {
    "subtotal": 100.00,
    "descuento": 0,
    "base_imponible": 100.00,
    "exento": 0,
    "iva_porcentaje": 16,
    "iva_monto": 16.00,
    "igtf_porcentaje": 3,
    "igtf_monto": 0,
    "total": 116.00
  },
  "moneda": "USD o VES",
  "observaciones": "Cualquier nota adicional visible"
}

IMPORTANTE: 
- Los montos deben ser números, NO strings.
- El RIF debe incluir letra y dígito verificador (J-12345678-9).
- Si la factura está en bolívares, indica "VES". Si está en dólares, "USD".
- Responde SOLO con el JSON, sin texto adicional ni markdown.`

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ])

        const responseText = result.response.text()
        
        // Intentar parsear el JSON de la respuesta
        let parsedData
        try {
            // Limpiar posibles backticks de markdown
            const cleanJson = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            parsedData = JSON.parse(cleanJson)
        } catch (parseErr) {
            return {
                success: false,
                raw: responseText,
                error: 'La IA no pudo estructurar los datos correctamente. Revisa la imagen.'
            }
        }

        return {
            success: true,
            data: parsedData
        }
    } catch (err: any) {
        console.error('Gemini Vision Error:', err)
        throw createError({ 
            statusCode: 500, 
            message: 'Error al procesar la imagen: ' + (err.message || 'Error desconocido')
        })
    }
})
