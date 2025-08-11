function onOpen() {
  //Crea el menu cada vez que se abre el documento
  SpreadsheetApp.getUi().createMenu("Generar Notas")
    // Agrega una opción en el menú - "Nombre del comando" , "Nombre de la funnción que ejecuta"
    .addItem("Generar Notas", "generarNotas")
    .addItem("Ver Fecha Actual", "MensajeUi")

    .addToUi()
}
function mensajeUi() {
  const fecha = obtenerFecha();
  const boton = "ACEPTAR";
  generarMensajeUi(fecha, boton);

}

function generarNotas() {
  const ui = SpreadsheetApp.getUi();
  const respuesta = ui.alert("Pulsa SI para generar los documentos", ui.ButtonSet.YES_NO);

  if (respuesta !== ui.Button.YES) {
    return ui.alert("Se ha cancelado la generación de documentos");
  }
  const id = obtenerIdDesdeCelda("L", 3);
  const docActual = DriveApp.getFileById(id);
  const hojaActual = SpreadsheetApp.getActive().getActiveSheet();
  const ultimaFila = hojaActual.getLastRow();

  let docGenerados = 0;
  let carpeta; // Declarada fuera del while
  let fecha = obtenerFecha();

  for (let fila = 2; fila <= ultimaFila; fila++) {
    const datosFila = hojaActual.getRange(`A${fila}:H${fila}`).getValues()[0];
    const [municipio, nombre, procesado, , email, tratamiento, cargo] = datosFila;

    // Saltear si la fila está vacía (por ejemplo, si no hay nombre ni municipio)
    if (!municipio || !nombre) {
      continue;
    }

    let ala = determinarTratamiento(tratamiento);

    if (procesado !== true) {
      docGenerados++;

      if (docGenerados === 1) {
        const idHoja = SpreadsheetApp.getActive().getId();
        carpeta = DriveApp.getFileById(idHoja).getParents().next()
          .createFolder(`Notas: ${fecha}`);
        hojaActual.getRange("M4").setValue(`Carpeta: ${carpeta.getName()}`);
        hojaActual.getRange("L4").setValue(carpeta.getUrl());

      }

      const docNuevo = docActual.makeCopy(`Nota - ${municipio} - ${fecha}`);
      const documento = DocumentApp.openById(docNuevo.getId());
      const body = documento.getBody();

      body.replaceText("<<fecha>>", fecha);
      body.replaceText("<<ala>>", ala);
      body.replaceText("<<municipio>>", municipio);
      body.replaceText("<<nombre>>", nombre);
      body.replaceText("<<tratamiento>>", tratamiento);
      body.replaceText("<<cargo>>", cargo);

      documento.saveAndClose();

      const pdf = documento.getAs("application/pdf").setName(`${documento.getName()}.pdf`);
      const pdfFile = DriveApp.createFile(pdf);

      docNuevo.moveTo(carpeta);
      pdfFile.moveTo(carpeta);

      hojaActual.getRange(`H${fila}`).setValue(pdfFile.getUrl());

      hojaActual.getRange(`C${fila}`).insertCheckboxes().setValue(true);
      hojaActual.getRange(`D${fila}`).setValue(new Date());
    }
  }

  ui.alert(docGenerados > 0
    ? `Se han creado ${docGenerados} documentos correctamente.`
    : "No se encontraron datos para procesar.");
}
