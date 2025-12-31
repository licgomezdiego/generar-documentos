
function convertirSeleccionAPdf() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = spreadsheet.getSheetByName("Modelos");
  
  // Obtener el rango que el usuario tiene resaltado con el mouse
  const seleccion = spreadsheet.getActiveRange();
  const filaInicio = seleccion.getRow();
  const numFilas = seleccion.getNumRows();
  
  let procesados = 0;
  let errores = 0;

  // Bucle para recorrer cada fila de la selección
  for (let i = 0; i < numFilas; i++) {
    const filaActual = filaInicio + i;
    
    // 1. Usar tu función existente para obtener el ID
    const fileId = obtenerIdDesdeHojaModelos(filaActual);
    
    if (!fileId) {
      Logger.log("Fila " + filaActual + " saltada: No se encontró ID.");
      continue;
    }

    try {
      // 2. Acceder al archivo y su carpeta
      const docFile = DriveApp.getFileById(fileId);
      const nombreArchivo = docFile.getName();
      const carpetaPadre = docFile.getParents().next();

      // 3. Crear el PDF
      const pdfBlob = docFile.getAs(MimeType.PDF);
      pdfBlob.setName(nombreArchivo); // Mismo nombre que el original

      // 4. Guardar en Drive
      const nuevoPdf = carpetaPadre.createFile(pdfBlob);
      
      // 5. Escribir el enlace en la columna D (columna 4)
      hoja.getRange(filaActual, 4).setValue(nuevoPdf.getUrl());
      
      procesados++;
    } catch (e) {
      Logger.log("Error en fila " + filaActual + ": " + e.message);
      errores++;
    }
  }

  // Avisar al usuario al terminar
  SpreadsheetApp.getUi().alert(
    "Proceso terminado.\n\n✅ Éxitos: " + procesados + 
    "\n❌ Errores: " + errores + 
    "\n\nLos enlaces se guardaron en la columna C."
  );
}