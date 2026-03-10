# Softtuuls Fiscal Agent 🖨️

Agente local puente entre **Softtuuls Web** y la **Impresora Fiscal** (USB/Serial).  
Compatible con Bixolon, PNP, Aclas y cualquier impresora ESC/POS estándar.

## ¿Qué hace?

Los navegadores web (Chrome, Edge, Safari) **no pueden** comunicarse directamente con puertos USB o Serial por razones de seguridad. Este pequeño programa se instala en la computadora de la **caja registradora** y actúa como intermediario:

```
Softtuuls Web ──► HTTP POST (JSON) ──► Agente Local (localhost:4040) ──► Puerto Serial ──► Impresora Fiscal
```

## Instalación

### 1. Requisitos
- Node.js 18+ instalado en la PC de la caja
- Impresora Fiscal conectada por USB/Serial (Bixolon, PNP, Aclas)

### 2. Instalar dependencias
```bash
cd fiscal-agent
npm install
```

### 3. Configurar
Edite el archivo `config.json`:
```json
{
    "serialPort": "COM3",
    "baudRate": 9600,
    "printerWidth": 48,
    "businessName": "Mi Bodegón",
    "rif": "J-123456789-0",
    "address": "Av. Principal, Local 1",
    "phone": "0412-1234567",
    "footer": "Gracias por su compra"
}
```

**Para encontrar el puerto COM de tu impresora:**
- **Windows:** Administrador de Dispositivos → Puertos (COM & LPT)
- **Mac/Linux:** `ls /dev/tty*` (buscar `/dev/ttyUSB0` o similar)

### 4. Ejecutar
```bash
npm start
```

Verás el banner de confirmación:
```
╔═══════════════════════════════════════════════════╗
║     SOFTTUULS FISCAL AGENT v1.0                   ║
║     Escuchando en http://localhost:4040            ║
║     Puerto Impresora: COM3                         ║
╚═══════════════════════════════════════════════════╝
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/status` | Verificar que el agente está activo |
| `GET` | `/ports` | Listar puertos seriales disponibles |
| `POST` | `/config` | Actualizar configuración en caliente |
| `POST` | `/print` | Imprimir factura/nota de crédito |
| `POST` | `/open-drawer` | Abrir gaveta de efectivo |

## Ejemplo de uso (desde Softtuuls)
```javascript
await fetch('http://localhost:4040/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData)
})
```

## Empaquetado (.exe para Windows)
Para crear un ejecutable portátil sin necesidad de instalar Node.js:
```bash
npm install -g pkg
pkg server.js --targets node18-win-x64 --output SofttuulsFiscalAgent.exe
```
