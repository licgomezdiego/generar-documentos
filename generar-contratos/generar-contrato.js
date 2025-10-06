function generarContrato() {
  const ui = SpreadsheetApp.getUi();

  try {
    const respuesta = ui.alert("Pulsa SI para generar los documentos", ui.ButtonSet.YES_NO);
    if (respuesta !== ui.Button.YES) {
      return ui.alert("Se ha cancelado la generación de documentos");
    }

    const ss = SpreadsheetApp.getActive();
    const hojaActual = ss.getActiveSheet();
    const ultimaFila = hojaActual.getLastRow();

    let docGenerados = 0;
    let carpetasPorCoordinacion = {}; // Objeto para trackear carpetas por coordinación
    let fechaActual = obtenerFecha();
    const idHoja = ss.getId();
    const carpetaPadre = DriveApp.getFileById(idHoja).getParents().next();
    const modelos = ss.getSheetByName("Modelos");

    for (let fila = 3; fila <= ultimaFila; fila++) {
      try {
        const datosFila = hojaActual.getRange(`A${fila}:V${fila}`).getValues()[0];
        const [coordinacion, check, fecha, asistente, dni, cuil, domicilio, localidad, correo, expediente, nucleo, localidadNucleo, inicioVigencia, finVigencia, montoTotalNumero, montoTotalLetras, cuotas, montoCuotasNumero, montoCuotasLetras, genero, enlace, tipoContrato] = datosFila;

        // Validar campos obligatorios
        if (!coordinacion || !asistente || !dni || !cuil || !domicilio || !localidad || !correo || !expediente || !nucleo || !localidadNucleo || !inicioVigencia || !finVigencia || !montoTotalNumero || !montoTotalLetras || !cuotas || !montoCuotasNumero || !montoCuotasLetras || !genero || !tipoContrato) {
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

        // 🔥 GESTIÓN DINÁMICA DE CARPETAS POR COORDINACIÓN
        let carpeta = carpetasPorCoordinacion[coordinacion];

        if (!carpeta) {
          // Crear nueva carpeta para esta coordinación
          let nombreCarpeta = `Contratos de: ${coordinacion} - ${fechaActual}`;
          carpeta = crearCarpetaEnPadre(nombreCarpeta, carpetaPadre);
          carpetasPorCoordinacion[coordinacion] = carpeta;

          Logger.log(`✅ Nueva carpeta creada para: ${coordinacion}`);

          // Actualizar información de carpetas (solo para la primera coordinación o según necesites)
          if (Object.keys(carpetasPorCoordinacion).length === 1) {
            modelos.getRange("C2").setValue(`Carpetas creadas: ${Object.keys(carpetasPorCoordinacion).length}`);
            modelos.getRange("D2").setValue("Carpeta Padre: " + carpetaPadre.getName());
            modelos.getRange("C3").setValue(carpetaPadre.getUrl());
          }
        }

        // Crear y editar documento
        const filaTipo = obtenerFilaPorTipo(tipoContrato)
        const modeloId = obtenerIdDesdeHojaModelos(filaTipo);
        if (!modeloId) {
          throw new Error("No se pudo obtener el ID del documento plantilla");
        }
        const docBase = DriveApp.getFileById(modeloId);
        const docNuevo = docBase.makeCopy(`Contrato de: ${asistente} - ${nucleo}`, carpeta);
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
        continue;
      }
    }

    // MOSTRAR INFO DE TODAS LAS CARPETAS CREADAS
    if (docGenerados > 0) {
      let mensaje = `✅ Se han creado ${docGenerados} contratos en ${Object.keys(carpetasPorCoordinacion).length} carpeta(s):\n\n`;

      for (const [coordinacion, carpeta] of Object.entries(carpetasPorCoordinacion)) {
        mensaje += `📁 ${coordinacion}: ${carpeta.getUrl()}\n`;
      }

      // Guardar todos los enlaces en la hoja Modelos
      let row = 4;
      modelos.getRange("C4:D" + (row + Object.keys(carpetasPorCoordinacion).length)).clearContent();

      for (const [coordinacion, carpeta] of Object.entries(carpetasPorCoordinacion)) {
        modelos.getRange(`C${row}`).setValue(coordinacion);
        modelos.getRange(`D${row}`).setValue(carpeta.getUrl());
        row++;
      }

      ui.alert(mensaje);
    } else {
      ui.alert("ℹ️ No se encontraron datos para procesar.");
    }

  } catch (errorGlobal) {
    Logger.log(`ERROR GLOBAL: ${errorGlobal.toString()}`);
    Logger.log(`STACK: ${errorGlobal.stack}`);
    ui.alert(`❌ Error crítico: ${errorGlobal.message}\n\nRevisa los logs para más detalles.`);
  }
}