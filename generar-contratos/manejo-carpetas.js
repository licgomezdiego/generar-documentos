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
