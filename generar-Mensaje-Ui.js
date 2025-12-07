// Función para generar un mensaje en la interfaz de usuario de Google Sheets
// Recibe el mensaje de texto y el tipo de botón (SI_NO, SI_NO_CANCELAR, ACEPTAR)
// Devuelve "SI", "NO", "CANCELAR" o un mensaje indicando que solo se mostró el mensaje
function generarMensajeUi(mensajeTexto, tipoBoton) {
  const ui = SpreadsheetApp.getUi();

  // Determinar el tipo de botón según el parámetro
  let botones;
  switch (tipoBoton.toUpperCase()) {
    case "SI_NO":
      botones = ui.ButtonSet.YES_NO;
      break;
    case "SI_NO_CANCELAR":
      botones = ui.ButtonSet.YES_NO_CANCEL;
      break;
    case "ACEPTAR":
    default:
      botones = ui.ButtonSet.OK;
      break;
  }

  // Mostrar el mensaje con el conjunto de botones
  const respuesta = ui.alert(mensajeTexto, botones);

  // Si el botón es solo "Aceptar", no hay respuesta útil que devolver
  if (botones === ui.ButtonSet.OK) {
    return "Mensaje mostrado con botón ACEPTAR.";
  }

  // Interpretar la respuesta del usuario
  switch (respuesta) {
    case ui.Button.YES:
      return "SI";
    case ui.Button.NO:
      return "NO";
    case ui.Button.CANCEL:
      return "CANCELAR";
    default:
      return "0";
  }
}