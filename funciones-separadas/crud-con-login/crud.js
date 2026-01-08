function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Admin de Usuarios')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function verificarCredenciales(usuario, password) {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
    const datos = hoja.getDataRange().getValues();
    const filaEncontrada = datos.find(fila => 
      fila[0].toString().toLowerCase() === usuario.toLowerCase().trim() && 
      fila[1].toString() === password.toString().trim()
    );
    return { success: !!filaEncontrada }; // Retorna true si existe, false si no
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

function obtenerUsuarios() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  const datos = hoja.getDataRange().getValues();
  datos.shift(); // Eliminar encabezado
  return datos.map((fila, index) => ({
    nombre: fila[0],
    password: fila[1],
    filaOriginal: index + 2
  }));
}

function actualizarUsuario(fila, nuevoNombre, nuevaPassword) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  hoja.getRange(fila, 1).setValue(nuevoNombre);
  hoja.getRange(fila, 2).setValue(nuevaPassword);
  return "Usuario actualizado correctamente";
}

function crearUsuario(nombre, password) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  hoja.appendRow([nombre, password]);
  return obtenerUsuarios();
}

function eliminarUsuario(fila) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Usuarios");
  hoja.deleteRow(fila);
  return "Usuario eliminado correctamente";
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}