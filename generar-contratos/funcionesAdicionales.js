function obtenerFecha() {
  let fecha = new Date();
  let meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  let dia = fecha.getDate();
  let mes = meses[fecha.getMonth()];
  let anio = fecha.getFullYear();
  return dia + " de " + mes + " de " + anio;
}
function obtenerFilaPorTipo(tipoContrato) {
  // Normalizamos el texto para evitar errores por mayúsculas o espacios
  const tipo = tipoContrato.trim().toLowerCase();

  // Diccionario de tipos → número de fila
  const mapaTipos = {
    "asistente educativo": 2,
    "asistente educativo doble núcleo": 3,
    "asistente educativo 50%": 4,
    "asistente educativo itinerante": 5,
    "asistente educativo primaria": 6,
    "coordinador zonal": 7,
    "coordinador pedagógico": 8,
    "evaluador simple": 9,
    "evaluador doble módulo": 10,
    "tutor telemático": 11,
    "corrector de estilos": 12,
    "docente equipo técnico ped.": 13
  };

  // Devolver el número de fila correspondiente o null si no se encuentra
  return mapaTipos[tipo] || null;
}



function obtenerUrl(fila) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Obtener la hoja llamada "Modelos"
    const hojaModelos = spreadsheet.getSheetByName("Modelos");
    
    if (!hojaModelos) {
      throw new Error("No se encontró la hoja llamada 'Modelos'");
    }
    
    // Obtener el valor de la celda 
    const celda = hojaModelos.getRange(`B${fila}`);
    
    if (celda.isBlank()) {
      throw new Error(`La celda B${fila} de la hoja Modelos está vacía`);
    }
    
    return celda.getValue();
    
  } catch (error) {
    Logger.log("Error en obtenerUrl: " + error.message);
    return null;
  }
}
function extraerIdDeUrl(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function obtenerIdDesdeHojaModelos(fila) {
  const url = obtenerUrl(fila);
  return url ? extraerIdDeUrl(url) : null;
}

function determinarTratamiento(tratamiento) {
  // Verificar si el parámetro es válido
  if (!tratamiento || typeof tratamiento !== 'string') {
    return ""; // Valor por defecto si no hay tratamiento
  }

  // Limpiar el texto y convertir a minúsculas
  const textoLimpio = tratamiento.trim().toLowerCase();

  // Verificar si termina en 'a' (para femenino)
  if (textoLimpio.endsWith('F')) {
    return "a la Sra.";
  }

  // Caso por defecto (masculino)
  return "al Sr.";
}

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
