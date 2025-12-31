function doGet() {
  const datos = obtenerDatos(); // ya sabemos que funciona

  const template = HtmlService.createTemplateFromFile('tabla');
  template.datos = datos;

  return template
    .evaluate()
    .setTitle('Prueba');
}


function obtenerDatos() {
  try {
    const ss = SpreadsheetApp.openById(
      '1mdCx-19bj1Z-8C69MnlklNG27tyckUB61ah20gE6SMI'
    );

    const hoja = ss.getSheetByName('comunicaciones');

    if (!hoja) {
      throw new Error('No existe la hoja comunicaciones');
    }

    const datos = hoja.getDataRange().getValues();

    Logger.log('Datos obtenidos correctamente. Filas: ' + datos.length);

    return datos;

  } catch (e) {
    Logger.log('ERROR EN obtenerDatos: ' + e.message);
    throw e; // importante
  }
}

//implementacion: https://script.google.com/macros/s/AKfycbwB19gonwxElWHws9aOMlBW_pDqnznvEOVqvHmbtYJd/dev
