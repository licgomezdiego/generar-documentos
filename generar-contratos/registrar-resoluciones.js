function registrarResoluciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ❗ AJUSTAR SOLO SI LOS NOMBRES DE HOJA SON OTROS
  const hojaResol = ss.getSheetByName("Registro");     // Primera tabla
  const hojaContratos = ss.getSheetByName("Contratos"); // Segunda tabla

  // Obtener datos de Registro (B → G)
  const lastRowResol = hojaResol.getLastRow();
  const datosResol = hojaResol.getRange(2, 2, lastRowResol - 1, 6).getValues();
  // Columnas: 0=Nombre, 1=CUIT, 2=Núcleo, 3=Vigencia, 4=Resolución, 5=Fecha

  // Obtener datos de Contratos
  const lastRowContratos = hojaContratos.getLastRow();
  const datosContratos = hojaContratos.getRange(2, 1, lastRowContratos - 1, 31).getValues();
  // col 0 = NOMBRE, col 29 = RES (AD), col 30 = FECHA RES (AE)

  // --- Función para normalizar texto (sin acentos, sin espacios, minúsculas)
  const normalizar = t =>
    t ? t.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]/g, "") : "";

  // Crear mapa de búsqueda por nombre + núcleo
  const mapaContratos = {};
  datosContratos.forEach((fila, index) => {
    const nombre = normalizar(fila[0]);
    const nucleo = normalizar(fila[9]);  // Columna J en Contratos → núcleo solo
    if (nombre && nucleo) {
      mapaContratos[nombre + "|" + nucleo] = index + 2; // fila real
    }
  });

  let cargados = 0;

  // Procesar tabla Registro
  datosResol.forEach((fila, i) => {
    const nombre = normalizar(fila[0]);
    const nucleoRaw = fila[2] || "";
    const resol = fila[4];
    const fecha = fila[5];

    if (!nombre || !resol) return;

    // Extrae núcleo antes del "-"
    const nucleoLimpio = normalizar(nucleoRaw.split("-")[0]);

    const clave = nombre + "|" + nucleoLimpio;
    const filaDestino = mapaContratos[clave];

    if (filaDestino) {

      const celdaRes = hojaContratos.getRange(filaDestino, 30);
      const celdaFecha = hojaContratos.getRange(filaDestino, 31);

      // Solo escribir si está vacío
      if (!celdaRes.getValue()) celdaRes.setValue(resol);
      if (!celdaFecha.getValue()) celdaFecha.setValue(fecha);

      // ✔ Borrar RES y FECHA RES de hoja Registro
      hojaResol.getRange(i + 2, 6).clearContent(); // Columna G → Resolución
      hojaResol.getRange(i + 2, 7).clearContent(); // Columna H → Fecha Res

      cargados++;
    }
  });

  SpreadsheetApp.getUi().alert(
    "Proceso completado.\nAgentes cargados con éxito: " + cargados
  );
}
