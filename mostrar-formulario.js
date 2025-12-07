// 📋 Muestra el formulario en un cuadro de diálogo modal
function mostrarFormulario() {
  var html = HtmlService.createHtmlOutputFromFile("formularioDatos.html")
    .setWidth(800)
    .setHeight(900);
  SpreadsheetApp.getUi().showModalDialog(html, "Altas y Bajas");
}

// 🌐 Permite cargar el formulario desde una URL (opcional)
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('formularioDatos.html');
}

// 🧾 Recibe los datos del formulario y los escribe en la hoja “Altas y Bajas”
function enviarDatosAHoja(fecha, novedad, area, nombre, motivo, tipoContrato, reemplazo, dependencia, inicioVigencia, finVigencia) {
  // Abre la hoja específica “Altas y Bajas”
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName("Altas y Bajas");
  if (!hoja) throw new Error("No se encontró la hoja 'Altas y Bajas'.");

  // Convierte las fechas al formato Date
  var fechaGoogle = fecha ? new Date(fecha) : "";
  var inicioVigenciaGoogle = inicioVigencia ? new Date(inicioVigencia) : "";
  var finVigenciaGoogle = finVigencia ? new Date(finVigencia) : "";

  // Determina la primera fila vacía
  var ultimaFila = hoja.getLastRow();
  var filaDestino = ultimaFila + 1;

  // Escribe los valores en la fila
  hoja.getRange(filaDestino, 1, 1, 10).setValues([[
    fechaGoogle,
    novedad,
    area,
    nombre,
    motivo,
    tipoContrato,
    reemplazo,
    dependencia,
    inicioVigenciaGoogle,
    finVigenciaGoogle
  ]]);

  // Opcional: formatea las fechas en la hoja
  hoja.getRange(filaDestino, 1).setNumberFormat("dd/MM/yyyy");
  hoja.getRange(filaDestino, 9).setNumberFormat("dd/MM/yyyy");
  hoja.getRange(filaDestino, 10).setNumberFormat("dd/MM/yyyy");
}
