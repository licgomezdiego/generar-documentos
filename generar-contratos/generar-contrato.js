function generarContrato() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const respuesta = ui.alert("Pulsa SI para generar los documentos", ui.ButtonSet.YES_NO);
    if (respuesta !== ui.Button.YES) {
      return ui.alert("Se ha cancelado la generación de documentos");
    }

    const id = obtenerIdDesdeHojaModelos();
    if (!id) {
      throw new Error("No se pudo obtener el ID del documento plantilla desde la fila 3");
    }

    const docActual = DriveApp.getFileById(id);
    const ss = SpreadsheetApp.getActive();
    const hojaActual = ss.getActiveSheet();
    const ultimaFila = hojaActual.getLastRow();

    let docGenerados = 0;
    let carpeta = null;
    let fechaActual = obtenerFecha();

    for (let fila = 3; fila <= ultimaFila; fila++) {
      try {
        const datosFila = hojaActual.getRange(`A${fila}:U${fila}`).getValues()[0];
        const [coordinacion, check, fecha, asistente, dni, cuil, domicilio, localidad, correo, expediente, nucleo, localidadNucleo, inicioVigencia, finVigencia, montoTotalNumero, montoTotalLetras, cuotas, montoCuotasNumero, montoCuotasLetras, genero, enlace] = datosFila;

        // Validar campos obligatorios
        if (!coordinacion || !asistente || !dni || !cuil || !domicilio || !localidad || !correo || !expediente || !nucleo || !localidadNucleo || !inicioVigencia || !finVigencia || !montoTotalNumero || !montoTotalLetras || !cuotas || !montoCuotasNumero || !montoCuotasLetras || !genero) {
          hojaActual.getRange("U" + fila).setValue("Faltaron datos suficientes para generar el contrato");
          continue;
        }

        // Verificar si ya fue procesado
        const yaProcesado = check === true || check === "TRUE" || check === "✓" || check === 1;
        if (yaProcesado) {
          continue;
        }

        let trato = determinarTratamiento(genero);
        docGenerados++;

        // Crear carpeta solo para el primer documento
        if (docGenerados === 1) {
          const idHoja = SpreadsheetApp.getActive().getId();
          let nombreCarpeta = `Contratos de: ${coordinacion} - ${fechaActual}`;
          const carpetaPadre = DriveApp.getFileById(idHoja).getParents().next();
          carpeta = crearCarpetaEnPadre(nombreCarpeta, carpetaPadre);
          
          // informacion para tener el enlace a las carpetas
          const modelos = ss.getSheetByName("Modelos");
          // Insertar información de la carpeta
          modelos.getRange("C2").setValue(`Carpeta: ${carpeta.getName()}`);
          modelos.getRange("D2").setValue("Carpeta Padre: " + carpetaPadre.getName());
          modelos.getRange("C3").setValue(carpetaPadre.getUrl());
          modelos.getRange("D3").setValue(carpeta.getUrl());
        }

        // Crear y editar documento
        const docNuevo = docActual.makeCopy(`Contrato de: ${asistente} - ${nucleo}`, carpeta);
        const documento = DocumentApp.openById(docNuevo.getId());
        const body = documento.getBody();

        // Reemplazar textos
        body.replaceText("<<TRATAMIENTO>>", trato);
        body.replaceText("<<ASISTENTE_NOMBRE>>", asistente);
        body.replaceText("<<DNI>>", dni.toString());
        body.replaceText("<<CUIL>>", cuil.toString());
        body.replaceText("<<DOMICILIO>>", domicilio);
        body.replaceText("<<LOCALIDAD>>", localidad);
        body.replaceText("<<CORREO>>", correo);
        body.replaceText("<<EXPEDIENTE>>", expediente);
        body.replaceText("<<NUCLEO>>", nucleo);
        body.replaceText("<<LOCALIDAD_NUCLEO>>", localidadNucleo);
        body.replaceText("<<INICIO_VIGENCIA>>", Utilities.formatDate(inicioVigencia, Session.getScriptTimeZone(), "dd/MM/yyyy"));
        body.replaceText("<<FIN_VIGENCIA>>", Utilities.formatDate(finVigencia, Session.getScriptTimeZone(), "dd/MM/yyyy"));
        body.replaceText("<<MONTO_TOTAL_NUMERO>>", montoTotalNumero.toString());
        body.replaceText("<<MONTO_TOTAL_LETRA>>", montoTotalLetras);
        body.replaceText("<<CUOTAS>>", cuotas.toString());
        body.replaceText("<<MONTO_CUOTAS_NUMERO>>", montoCuotasNumero.toString());
        body.replaceText("<<MONTO_CUOTAS_LETRA>>", montoCuotasLetras);
        //body.replaceText("<<FECHA>>", Utilities.formatDate(fecha, Session.getScriptTimeZone(), "dd/MM/yyyy"));

        documento.saveAndClose();

        // Insertar URL del contrato
        hojaActual.getRange(`U${fila}`).setValue(docNuevo.getUrl());
        hojaActual.getRange(`B${fila}`).setValue(true);
        hojaActual.getRange(`C${fila}`).setValue(new Date());

        // Pequeña pausa para evitar límites
        Utilities.sleep(500);

      } catch (errorFila) {
        Logger.log(`Error en fila ${fila}: ${errorFila.toString()}`);
        hojaActual.getRange(`U${fila}`).setValue(`Error: ${errorFila.message}`);
        continue; // Continuar con la siguiente fila
      }
    }

    if (docGenerados > 0) {
      ui.alert(`✅ Se han creado ${docGenerados} contratos correctamente.`);
    } else {
      ui.alert("ℹ️ No se encontraron datos para procesar.");
    }

  } catch (errorGlobal) {
    Logger.log(`ERROR GLOBAL: ${errorGlobal.toString()}`);
    Logger.log(`STACK: ${errorGlobal.stack}`);
    ui.alert(`❌ Error crítico: ${errorGlobal.message}\n\nRevisa los logs para más detalles.`);
  }
}