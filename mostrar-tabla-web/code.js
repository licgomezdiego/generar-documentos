function doGet() {
  const datos = obtenerDatos();

  const template = HtmlService.createTemplateFromFile('index');
  template.datos = datos;

  return template
    .evaluate()
    .setTitle('Consulta de Comunicaciones');
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

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//implementacion: https://script.google.com/macros/s/AKfycbxGrrVXBMah8OpplSv82pOSPRjL6I7yta4ZetyjOJnImZeOFYzW9a7lNFQx-YMl4KV00g/exec


