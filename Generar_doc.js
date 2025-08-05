function generarNotas() {
  var ui = SpreadsheetApp.getUi();

  //ventana de alerta
  var respuesta = ui.alert(
    "Pulsa SI para generar los documentos",
    ui.ButtonSet.YES_NO
  );
  if (respuesta == ui.Button.YES) {
    //Obteniendo el documento de origen
    var docActual = DriveApp.getFileById(
      "1QTg9l6MXE7bnqUXix8p-MRAe3gW1fQKj_ernJ9X0R5g"
    );

    var hojaActual = SpreadsheetApp.getActive();
    var fila = 2;
    var nombreCelda = "A" + fila;
    var celdaActual = hojaActual.getRange(nombreCelda);
    var docGenerados = 0;

    //Comprobamos si la celda no esta vacia
    //isBlank() devuelve true si la celda esta vacia
    //si no esta vacia se ejecuta el bucle
    //signo de admiracion indica negacion
    while (!celdaActual.isBlank()) {
      if (hojaActual.getRange("C" + fila).getValue() != true) {
        //incremento contador
        docGenerados++;

        if (docGenerados == 1) {
          //creamos una carpeta donde se generan los archivos
          var idHoja = SpreadsheetApp.getActive().getId();
          var carpetaPadre = DriveApp.getFileById(idHoja).getParents().next();
          //si la condicion no se ejecuta la variable carpeta no se genera y da error
          var carpeta = carpetaPadre.createFolder("Notas: " + new Date());
        }

        //Crear Documento
        var docNuevo = docActual.makeCopy("Nombre : " + celdaActual.getValue());
        var documento = DocumentApp.openById(docNuevo.getId());
        //openById(docNuevo.getId());

                //reemplazar los datos
        documento
          .getBody()
          .replaceText(
            "<<municipio>>",
            hojaActual.getRange("A" + fila).getValue()
          );
        documento
          .getBody()
          .replaceText(
            "<<nombre>>",
            hojaActual.getRange("B" + fila).getValue()
          );

        //añadir check box
        hojaActual.getRange("C" + fila).insertCheckboxes();

        //marcar check
        hojaActual.getRange("C" + fila).setValue("true");

        //Anadir fecha
        hojaActual.getRange("D" + fila).setValue(new Date());

        //convertimos en PDF
        documento.saveAndClose();
        var docPdf = documento.getAs("application/pdf");
        docPdf.setName(documento.getName() + ",pdf");
        var docNuevoPdf = DriveApp.createFile(docPdf);

        //Guardar el los documentos en la carpeta
        docNuevo.moveTo(carpeta);
        docNuevoPdf.moveTo(carpeta);
      }

      //Bajamos una fila
      fila++;
      nombreCelda = "A" + fila;
      celdaActual = hojaActual.getRange(nombreCelda);
    }

    if (docGenerados > 0) {
      ui.alert(
        "Se han creados correctamente " +
          docGenerados +
          " documentos con sus respectivos PDF"
      );
    } else {
      ui.alert("NO Se han encontrado datos para generar documentos");
    }
  } else {
    ui.alert("Se ha cancelado la generación de documentos");
  }
  //fin de la funcion
}
