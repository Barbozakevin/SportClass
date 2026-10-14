const express = require("express");
const cors = require("cors");
const {
  leerRegistros,
  agregarRegistro,
  actualizarRegistro,
  eliminarRegistro,
  asegurarArchivo,
} = require("./almacen");
const { validarReserva, CATEGORIAS, CLASES } = require("./validaciones");

const app = express();
const PUERTO = process.env.PORT || 4000;

// CORS: el frontend (Vite, puerto 5173) y la API (puerto 4000) están en orígenes distintos.
app.use(cors());
app.use(express.json());

// Si el JSON enviado está mal formado, respondemos 400 en lugar de dejar caer el servidor.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ mensaje: "El cuerpo de la petición no es un JSON válido." });
  }
  next(err);
});

// Datos auxiliares para llenar los select del formulario.
app.get("/opciones", (req, res) => {
  res.status(200).json({ clases: CLASES, categorias: CATEGORIAS });
});

// GET /registros -> lista todas las reservas
app.get("/registros", async (req, res) => {
  try {
    const registros = await leerRegistros();
    res.status(200).json(registros);
  } catch (error) {
    console.error("Error al leer registros:", error.message);
    res.status(500).json({ mensaje: "No se pudieron leer los registros." });
  }
});

// POST /registros -> crea una reserva nueva
app.post("/registros", async (req, res) => {
  const { errores, datos } = validarReserva(req.body);

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ mensaje: "Datos inválidos.", errores });
  }

  try {
    const nuevo = await agregarRegistro(datos);
    res.status(201).json(nuevo);
  } catch (error) {
    console.error("Error al guardar el registro:", error.message);
    res.status(500).json({ mensaje: "No se pudo guardar el registro." });
  }
});

// PUT /registros/:id -> valida y actualiza una reserva existente
app.put("/registros/:id", async (req, res) => {
  const { errores, datos } = validarReserva(req.body);

  if (Object.keys(errores).length > 0) {
    return res.status(400).json({ mensaje: "Datos inválidos.", errores });
  }

  try {
    const actualizado = await actualizarRegistro(req.params.id, datos);
    if (!actualizado) {
      return res.status(404).json({ mensaje: "La reserva no existe." });
    }
    res.status(200).json(actualizado);
  } catch (error) {
    console.error("Error al actualizar el registro:", error.message);
    res.status(500).json({ mensaje: "No se pudo actualizar el registro." });
  }
});

// DELETE /registros/:id -> elimina una reserva existente
app.delete("/registros/:id", async (req, res) => {
  try {
    const eliminado = await eliminarRegistro(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "La reserva no existe." });
    }
    res.status(200).json({ mensaje: "La reserva se eliminó correctamente." });
  } catch (error) {
    console.error("Error al eliminar el registro:", error.message);
    res.status(500).json({ mensaje: "No se pudo eliminar el registro." });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada." });
});

// Último recurso: cualquier error inesperado no tumba el servidor.
app.use((err, req, res, next) => {
  console.error("Error inesperado:", err.message);
  res.status(500).json({ mensaje: "Error interno del servidor." });
});

if (require.main === module) {
  asegurarArchivo()
    .then(() => {
      app.listen(PUERTO, () => {
        console.log(`API de reservas escuchando en http://localhost:${PUERTO}`);
      });
    })
    .catch((error) => {
      console.error("No se pudo inicializar el archivo de datos:", error.message);
      process.exit(1);
    });
}

module.exports = app;
