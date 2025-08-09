function enviarCorreo(fila, destinatario, asunto, cuerpoTexto, adjunto) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (!destinatario || !asunto || !cuerpoTexto) {
    console.error("Faltan parámetros requeridos");
    hoja.getRange(`J${fila}`).setValue("Error: campos vacíos");
    return false;
  }

  const nombre = hoja.getRange(`B${fila}`).getValue(); // Asume que el nombre está en la columna B
  const htmlBody = generarPlantillaHTML(nombre, cuerpoTexto);

  try {
    GmailApp.sendEmail(destinatario, asunto, cuerpoTexto, {
      htmlBody: htmlBody,
      attachments: adjunto ? [adjunto] : [],
      name: "Sistema de Notas Automáticas de Coordinación General"
    });

    hoja.getRange(`I${fila}`).setValue(true);
    return true;
  } catch (error) {
    console.error(`Error al enviar correo a ${destinatario}:`, error);
    hoja.getRange(`J${fila}`).setValue(`Error: ${error.message}`);
    return false;
  }
}

// Función para procesar las filas de la hoja de cálculo
// Recorre las filas y envía correos si no se ha enviado previamente
// Asume que la columna I indica si el correo ya fue enviado
// La columna J se usa para registrar errores
// La columna A tiene el municipio, B el nombre, C el correo, D el asunto, E el cuerpo, F el ID del adjunto
// La columna G indica si ya fue enviado
// La columna H se usa para registrar la fecha de envío
// La columna I se usa para marcar si el correo fue enviado
// La columna J se usa para registrar errores 
function procesarFilas() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const datos = hoja.getDataRange().getValues();

  for (let i = 1; i < datos.length; i++) {
    const fila = i + 1; // Ajuste para la numeración de filas en Google Sheets
    // Asumimos que los datos están en las columnas A a H
    // A: Municipio, B: Nombre, C: Correo, D: Asunto, E: Cuerpo, F: ID del adjunto, G: Enviado
    if (datos[i].length < 8) continue; // Verifica que haya suficientes columnas
    const [ , nombre, correo, asunto, cuerpo, adjuntoId, enviado ] = datos[i];

    if (enviado === true) continue;  // Ya fue enviado

    const adjunto = adjuntoId ? obtenerAdjuntoPorId(adjuntoId) : null;
    const cuerpoPersonalizado = generarCuerpo(nombre, cuerpo);

    enviarCorreo(fila, correo, asunto, cuerpoPersonalizado, adjunto);
  }
}
// Crea una función para obtener el adjunto recibe el ID
function obtenerAdjuntoPorId(id) {
  try {
    return DriveApp.getFileById(id).getBlob();
  } catch (e) {
    console.error(`Error al obtener adjunto con ID ${id}:`, e);
    return null;
  }
}
// Función para generar el cuerpo del correo personalizado
function generarCuerpo(nombre, cuerpoBase) {
  return `Estimado/a ${nombre},\n\n${cuerpoBase}\n\nSaludos cordiales,\nEquipo de Coordinación General`;
}
// Función para generar una plantilla HTML para el correo
// Recibe el nombre y el cuerpo del mensaje base
// Devuelve el contenido HTML para el correo 
function generarPlantillaHTML(nombre, cuerpoBase) {
  const plantilla = HtmlService.createTemplateFromFile("plantillaCorreo");
  plantilla.nombre = nombre;
  plantilla.cuerpo = cuerpoBase;
  return plantilla.evaluate().getContent();
}
