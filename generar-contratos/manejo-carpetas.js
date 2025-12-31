/**
 * Crear carpeta si no existe (a nivel raíz).
 * Si ya existe una carpeta con el mismo nombre, devuelve esa.
 * Si no existe, la crea y devuelve la nueva.
 */
function crearCarpeta(nombre) {
  const iterator = DriveApp.getFoldersByName(nombre);
  if (iterator.hasNext()) {
    return iterator.next(); // Devolver primera coincidencia
  }
  return DriveApp.createFolder(nombre);
}

/**
 * Crear carpeta dentro de una carpeta padre.
 * Evita duplicados: si existe, devuelve la existente.
 */
function crearCarpetaEnPadre(nombre, carpetaPadre) {
  const iterator = carpetaPadre.getFoldersByName(nombre);
  if (iterator.hasNext()) {
    return iterator.next();
  }
  return carpetaPadre.createFolder(nombre);
}

/**
 * Buscar carpetas por nombre exacto (pueden ser varias).
 * Devuelve un array de objetos Folder.
 */
function buscarCarpetaExacta(nombre) {
  const iterator = DriveApp.getFoldersByName(nombre);
  const resultados = [];
  while (iterator.hasNext()) {
    resultados.push(iterator.next());
  }
  return resultados;
}

/**
 * Buscar carpetas por coincidencia parcial en el nombre.
 * Usa searchFolders con query avanzada.
 * Devuelve un array de objetos Folder.
 */
function buscarCarpetaNoExacta(nombre) {
  const iterator = DriveApp.searchFolders(
    `title contains '${nombre}' and trashed = false`
  );
  const resultados = [];
  while (iterator.hasNext()) {
    resultados.push(iterator.next());
  }
  return resultados;
}

/**
 * Obtener la ID de una carpeta (más cómodo para guardar referencias).
 */
function obtenerIdCarpeta(carpeta) {
  return carpeta.getId();
}

/**
 * Obtener carpeta a partir de su ID.
 */
function obtenerCarpetaPorId(id) {
  return DriveApp.getFolderById(id);
}

// función para obtener la url de la carpeta donde se encuentra un archivo a partir de un enlace
function obtenerUrlCarpetaPorEnlace(enlace) {
  const archivo = DriveApp.getFileById(enlace);
  const carpeta = archivo.getParents().next();
  return carpeta.getUrl();
}
// obtener carpeta de la selección y escribir su url en la hoja
function obtenerCarpetaDeSeleccion() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = spreadsheet.getSheetByName("Modelos");
  
  // Obtener el rango seleccionado
  const seleccion = spreadsheet.getActiveRange();
  const filaInicio = seleccion.getRow();
  const numFilas = seleccion.getNumRows();
  
  let procesados = 0;

  for (let i = 0; i < numFilas; i++) {
    const filaActual = filaInicio + i;
    
    // 1. Obtener el ID del archivo usando tus funciones
    const fileId = obtenerIdDesdeHojaModelos(filaActual);
    
    if (!fileId) continue;

    try {
      // 2. Acceder al archivo y obtener sus padres (carpetas)
      const archivo = DriveApp.getFileById(fileId);
      const carpetas = archivo.getParents();
      
      if (carpetas.hasNext()) {
        const carpetaPadre = carpetas.next();
        const urlCarpeta = carpetaPadre.getUrl();
        
        // 3. Escribir el enlace en la columna C (o la que prefieras)
        // Si la URL del archivo está en B (2), escribimos en C (3)
        hoja.getRange(filaActual, 3).setValue(urlCarpeta);
        procesados++;
      }
    } catch (e) {
      Logger.log("Error obteniendo carpeta en fila " + filaActual + ": " + e.message);
    }
  }

  SpreadsheetApp.getUi().alert("Se han obtenido " + procesados + " enlaces de carpetas.");
}