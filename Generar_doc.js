function generarNotas() {

  var ui = SpreadsheetApp.getUi();

  //ventana de alerta
  var respuesta = ui.alert("Pulsa SI para generar los documentos", ui.ButtonSet.YES_NO);
  if(respuesta == ui.Button.YES){

 //Obteniendo el documento de origen
    var docActual = DriveApp.getFileById("1QTg9l6MXE7bnqUXix8p-MRAe3gW1fQKj_ernJ9X0R5g");

  var fila = 2;
  var nombreCelda = 'A'+ fila;
  var hojaActual = SpreadsheetApp.getActive();
  var celdaActual = hojaActual.getRange(nombreCelda);
  var docGenerados =0;

  //Comprobamos si la celda no esta vacia
  //isBlank() devuelve true si la celda esta vacia
  //si no esta vacia se ejecuta el bucle
  //signo de admiracion indica negacion
  while(!celdaActual.isBlank()){
  
    if(hojaActual.getRange('C'+fila).getValue()!=true)
  {
    //incremento contador
    docGenerados++;

      if(docGenerados == 1) 
      {
        //creamos una carpeta donde se generan los archivos
        var idHoja = SpreadsheetApp.getActive().getId();
        var carpetaPadre = DriveApp.getFileById(idHoja).getParents().next();
        //si la condicion no se ejecuta la variable carpeta no se genera y da error
        var carpeta =carpetaPadre.createFolder("Notas: "+ new Date);
      }
    
      //Crear Documento
    var docNuevo = docActual.makeCopy("Nombre : "+  celdaActual.getValue());
    var documento = DocumentApp.openById(docNuevo.getId());
    //openById(docNuevo.getId());

  //Obtener fecha actual
    var fecha = new Date();
    var mes = fecha.getMonth();
    var dia = fecha.getDate();
    var anyo = fecha.getFullYear();

    //obtener el mes en formato text
    switch(mes){
      case 0: mes = "Enero"; break;
      case 1: mes = "Febrero"; break;
      case 2: mes = "Marzo"; break;
      case 3: mes = "Abril"; break;
      case 4: mes = "Mayo"; break;
      case 5: mes = "Junio"; break;
      case 6: mes = "Julio"; break;
      case 7: mes = "Agosto"; break;
      case 8: mes = "Septiembre"; break;
      case 9: mes = "Octubre"; break;
      case 10: mes = "Noviembre"; break;
      case 11: mes = "Diciembre"; break;
      }

    //reemplazar los datos
    documento.getBody().replaceText("<<municipio>>" , hojaActual.getRange('A'+fila).getValue());
    documento.getBody().replaceText("<<nombre>>" , hojaActual.getRange('B'+fila).getValue());
    

    //añadir check box
    hojaActual.getRange('C'+fila).insertCheckboxes();

    //marcar check
    hojaActual.getRange('C'+fila).setValue('true');

    //Anadir fecha
    hojaActual.getRange('D'+fila).setValue(fecha);

    //convertimos en PDF
    documento.saveAndClose();
    var docPdf= documento.getAs("application/pdf");
    docPdf.setName(documento.getName()+",pdf");
    var docNuevoPdf = DriveApp.createFile(docPdf);

    //Guardar el los documentos en la carpeta
    docNuevo.moveTo(carpeta);
    docNuevoPdf.moveTo(carpeta);

    }

    //Bajamos una fila
    fila++;
    nombreCelda = 'A'+fila;
    celdaActual = hojaActual.getRange(nombreCelda);
  }
  
  if(docGenerados>0 ) 
  {
    ui.alert("Se han creados correctamente "+docGenerados+ " documentos con sus respectivos PDF");
  }
  else {
      ui.alert("NO Se han encontrado datos para generar documentos");
    }
    
  }
  else
  {
    ui.alert("Se ha cancelado la generación de documentos");
  }
  //fin de la funcion
  
}
