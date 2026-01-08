/**
 * PROYECTO: GESTOR DE USUARIOS (BOUND SCRIPT)
 * Estructura de Hoja "USUARIOS": [MAIL | ROL | NAME]
 */

const SH_NAME = "USUARIOS";

function doGet() {
  // Solo entregamos la página limpia
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Admin de Usuarios')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Verifica si el usuario que abre la URL es un ADMIN en la lista
function verificarAdmin() {
  try {
    const emailActual = Session.getActiveUser().getEmail().toLowerCase().trim();
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH_NAME);
    const datos = hoja.getDataRange().getValues();
    
    // Buscamos si el usuario actual es ADMIN
    const adminEncontrado = datos.find(fila => 
      fila[0].toString().toLowerCase().trim() === emailActual && 
      fila[1].toString() === "Administrador"
    );

    return { 
      success: !!adminEncontrado, 
      email: emailActual,
      nombre: adminEncontrado ? adminEncontrado[2] : "" 
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function obtenerUsuarios() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH_NAME);
  const datos = hoja.getDataRange().getValues();
  datos.shift(); // Quitar encabezados
  
  return datos.map((fila, index) => ({
    mail: fila[0],
    rol: fila[1],
    nombre: fila[2],
    filaOriginal: index + 2
  }));
}

const SH_CAMBIOS = "CAMBIOS";

/**
 * Función central para registrar auditoría usando el NOMBRE
 */
function registrarCambio(accion, usuarioModificado, antes, despues) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let shCambios = ss.getSheetByName(SH_CAMBIOS);
  
  if (!shCambios) {
    shCambios = ss.insertSheet(SH_CAMBIOS);
    shCambios.appendRow(["Fecha y Hora", "Autor del Cambio", "Acción", "Usuario Modificado", "Valor Anterior", "Valor Nuevo"]);
  }

  const autor = Session.getActiveUser().getEmail();
  const fecha = new Date();

  shCambios.appendRow([
    fecha, 
    autor, 
    accion, 
    usuarioModificado, // <-- Ahora aquí llegará el NOMBRE del usuario
    JSON.stringify(antes), 
    JSON.stringify(despues)
  ]);
}

function actualizarUsuario(fila, mail, rol, nombre) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH_NAME);
  
  // 1. Capturamos los datos ANTES
  const datosViejos = hoja.getRange(fila, 1, 1, 3).getValues()[0];
  const valorAnterior = { mail: datosViejos[0], rol: datosViejos[1], nombre: datosViejos[2] };
  
  // 2. Realizamos el cambio
  const valorNuevo = { mail: mail, rol: rol, nombre: nombre };
  hoja.getRange(fila, 1, 1, 3).setValues([[mail, rol, nombre]]);
  
  // 3. Registramos usando NOMBRE (valor nuevo)
  registrarCambio("MODIFICACIÓN", nombre, valorAnterior, valorNuevo);
  
  return "Actualizado";
}

function crearUsuario(mail, rol, nombre) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH_NAME);
  const valorNuevo = { mail: mail, rol: rol, nombre: nombre };
  
  hoja.appendRow([mail.toLowerCase().trim(), rol, nombre]);
  
  // Registramos usando NOMBRE
  registrarCambio("CREACIÓN", nombre, "NUEVO REGISTRO", valorNuevo);
  
  return obtenerUsuarios();
}

function eliminarUsuario(fila) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH_NAME);
  
  // Capturamos antes de borrar para saber el NOMBRE de quien eliminamos
  const datosViejos = hoja.getRange(fila, 1, 1, 3).getValues()[0];
  const nombreBorrado = datosViejos[2]; // Columna C es el nombre
  const valorAnterior = { mail: datosViejos[0], rol: datosViejos[1], nombre: datosViejos[2] };

  hoja.deleteRow(fila);
  
  // Registramos usando NOMBRE
  registrarCambio("ELIMINACIÓN", nombreBorrado, valorAnterior, "REGISTRO BORRADO");
  
  return obtenerUsuarios();
}