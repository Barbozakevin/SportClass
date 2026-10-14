# SportClass · Reservas de clases deportivas

Aplicación web para **registrar solicitudes de reserva de clases deportivas** y consultar
clase, participante, fecha, categoría y horario.

Flujo de datos de extremo a extremo:

```
Formulario React → fetch (POST) → API Express → archivo JSON → fetch (GET) → Lista React
```

## Integrantes y distribución

| Integrante | Responsabilidad principal |
|---|---|
| _Integrante 1_ | Backend: Express, rutas GET/POST, almacenamiento JSON |
| _Integrante 2_ | Frontend: rutas, menú, página de inicio, estilos |
| _Integrante 3_ | Frontend: formulario, validaciones, mensajes |
| _Integrante 4_ | Integración con la API, lista, pruebas, README e informe |

> Reemplazar con los nombres reales. Todos los integrantes comprenden el proyecto completo.

## Requisitos

- Node.js 18 o superior (incluye `fetch` y `crypto.randomUUID`)
- npm

## Estructura

```
sportbook/
├── backend/
│   ├── server.js          # Express: rutas y manejo de errores
│   ├── validaciones.js    # Validación de los datos en el servidor
│   ├── almacen.js         # Lectura y escritura del archivo JSON
│   ├── data/registros.json  # Se crea solo al iniciar (lista vacía [])
│   └── test/api.test.js   # Pruebas automáticas de la API
└── frontend/
    └── src/
        ├── pages/         # Inicio, Registro, Lista, NoEncontrada
        ├── components/    # Menu, FormularioReserva, TarjetaRegistro, Mensaje
        ├── services/api.js  # Peticiones fetch a la API
        ├── validaciones.js  # Validación del formulario
        └── config.js      # URL de la API
```

## Instalación y ejecución

Abrir **dos terminales**.

**Terminal 1 · Backend (puerto 4000)**

```bash
cd backend
npm install
npm start
```

**Terminal 2 · Frontend (puerto 5173)**

```bash
cd frontend
npm install
npm run dev
```

Abrir <http://localhost:5173>.

### Conexión de React con la API

React lee la dirección de la API en `frontend/src/config.js`. Por defecto es
`http://localhost:4000`. Para cambiarla, copiar `frontend/.env.example` a `frontend/.env`
y editar `VITE_API_URL`. Como frontend y backend corren en orígenes distintos
(5173 y 4000), el backend habilita **CORS** con el paquete `cors`.

## Rutas del frontend

| Ruta | Contenido |
|---|---|
| `/` | Bienvenida y navegación |
| `/registro` | Formulario de reserva |
| `/registro/:id` | Edición validada de una reserva existente |
| `/lista` | Reservas obtenidas desde la API |

## API REST

Base: `http://localhost:4000`

### `GET /registros`

Devuelve todas las reservas. Código **200**.

```bash
curl http://localhost:4000/registros
```

### `POST /registros`

Crea una reserva. Código **201** si es válida, **400** si hay datos inválidos.

```bash
curl -X POST http://localhost:4000/registros \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana Pérez",
    "email": "ana@correo.com",
    "clase": "Yoga",
    "categoria": "Principiante",
    "fecha": "2026-12-20",
    "horario": "Mañana",
    "hora": "08:00",
    "descripcion": "Prefiero horario de mañana"
  }'
```

Respuesta 201:

```json
{
  "id": "b3c1f6a2-...",
  "nombre": "Ana Pérez",
  "email": "ana@correo.com",
  "clase": "Yoga",
  "categoria": "Principiante",
  "fecha": "2026-12-20",
  "horario": "Mañana",
  "hora": "08:00",
  "descripcion": "Prefiero horario de mañana",
  "creadoEn": "2026-10-13T21:30:00.000Z"
}
```

Respuesta 400:

```json
{
  "mensaje": "Datos inválidos.",
  "errores": { "email": "El formato del email no es válido." }
}
```

### `PUT /registros/:id`

Actualiza una reserva existente. Valida los mismos campos que `POST /registros`;
responde **200** si se actualiza, **400** si los datos son inválidos y **404**
si no existe ese identificador.

### `DELETE /registros/:id`

Elimina la reserva indicada. Responde **200** si se elimina y **404** si no existe.
La interfaz solicita confirmación antes de borrarla.

### `GET /opciones`

Devuelve las clases y categorías permitidas (para llenar los `select`).

## Validaciones

Se validan **en el cliente y en el servidor**:

- Nombre, email, clase, categoría, fecha, horario, hora y descripción obligatorios
- Email con formato válido
- Fecha válida y **no pasada**
- Clase y categoría dentro de las opciones permitidas
- La hora debe corresponder a la franja elegida: Mañana (06:00–11:00), Tarde (12:00–17:00) o Noche (18:00–21:00)

## Pruebas

**Automáticas (API):**

```bash
cd backend
npm test
```

Comprueban: lista vacía, creación válida (201 + id), conservación de registros previos,
casos inválidos (400), JSON mal formado, persistencia en disco y error controlado con
archivo corrupto.

**Manuales (para el video):**

1. Registrar una reserva válida y ver el mensaje de confirmación.
2. Enviar el formulario vacío o con email incorrecto y ver los mensajes de error.
3. Abrir `/lista` con el archivo vacío y ver el mensaje de lista vacía.
4. Apagar el backend y abrir `/lista` para ver el mensaje de error.
5. Registrar datos, **reiniciar el backend** y comprobar en `/lista` que siguen ahí.

## Manejo de errores

- El servidor responde 400 (datos inválidos), 404 (ruta inexistente) y 500 (error de archivo)
  sin detenerse.
- Si el archivo JSON no existe, se crea con `[]`.
- Las escrituras se hacen en un archivo temporal y luego se renombran, y se encolan para
  evitar que dos peticiones simultáneas se pisen.
