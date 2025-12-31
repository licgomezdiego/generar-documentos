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
    let carpetasPordependencia = {}; // Objeto para trackear carpetas por coordinación
    let fechaActual = obtenerFecha();
    const idHoja = ss.getId();
    const carpetaPadre = DriveApp.getFileById(idHoja).getParents().next();
    const modelos = ss.getSheetByName("Modelos");

    // Lectura masiva de todas las filas desde la fila 3
    const datos = hojaActual.getRange(3, 1, ultimaFila - 2, 31).getValues(); // 31 columnas (A → AE)

    for (let i = 0; i < datos.length; i++) {
      const fila = i + 3; // fila real en la hoja
      const datosFila = datos[i];

      try {
        const [
          nombreAgente, check, tipoContrato, dependencia, estado, fecha, enlace, enviado, firmado,
          nucleo, localidadNucleo, viaje, inicioVigencia, finVigencia, cuotas, cuotasLetras,
          dni, cuil, domicilio, localidad, correo, genero, observaciones,
          expediente, montoTotalNumero, montoTotalLetras, montoCuotasNumero, montoCuotasLetras, telefono, res, fechaRes
        ] = datosFila;

        // 🔸 Si no hay nombre, se saltea directamente la fila
        if (!nombreAgente || nombreAgente.toString().trim() === "") {
          continue;
        }

        // 🔸 Verificar si ya fue procesado
        const yaProcesado = check === true || check === "TRUE" || check === "✓" || check === 1;
        if (yaProcesado) continue;

        // 🔸 Validar que el estado sea ACTIVO
        if (!estado || estado.toString().toUpperCase().trim() !== "ACTIVO") {
          hojaActual.getRange(`G${fila}`).setValue("Contrato no generado: estado no es ACTIVO");
          continue;
        }

        // 🔸 Validar campos obligatorios mínimos
        if (!dependencia || !tipoContrato || !dni || !cuil || !domicilio || !localidad ||
          !correo || !expediente || !nucleo || !localidadNucleo ||
          !inicioVigencia || !finVigencia || !montoTotalNumero || !montoTotalLetras ||
          !cuotas || !montoCuotasNumero || !montoCuotasLetras || !genero) {
          hojaActual.getRange(`G${fila}`).setValue("Faltaron datos suficientes para generar el contrato");
          continue;
        }

        let trato = determinarTratamiento(genero);
        docGenerados++;

        // 🔥 GESTIÓN DINÁMICA DE CARPETAS POR COORDINACIÓN
        let carpeta = carpetasPordependencia[dependencia];

        if (!carpeta) {
          // Crear nueva carpeta para esta coordinación
          //let nombreCarpeta = `Contratos de: ${dependencia} - ${fechaActual}`;
          let nombreCarpeta = `Contratos de: ${dependencia}`;
          carpeta = crearCarpetaEnPadre(nombreCarpeta, carpetaPadre);
          carpetasPordependencia[dependencia] = carpeta;

          Logger.log(`✅ Nueva carpeta creada para: ${dependencia}`);

          // Actualizar información de carpetas (solo para la primera coordinación o según necesites)
          if (Object.keys(carpetasPordependencia).length === 1) {
            modelos.getRange("D2").setValue(`Carpetas creadas: ${Object.keys(carpetasPordependencia).length}`);
            modelos.getRange("E2").setValue("Carpeta Padre: " + carpetaPadre.getName());
            modelos.getRange("D3").setValue(carpetaPadre.getUrl());
          }
        }

        // Crear y editar documento
        const filaTipo = obtenerFilaPorTipo(tipoContrato)
        const modeloId = obtenerIdDesdeHojaModelos(filaTipo);
        if (!modeloId) {
          throw new Error("No se pudo obtener el ID del documento plantilla");
        }
        const docBase = DriveApp.getFileById(modeloId);
        const docNuevo = docBase.makeCopy(`Contrato de: ${nombreAgente} - ${nucleo}`, carpeta);
        const documento = DocumentApp.openById(docNuevo.getId());
        const body = documento.getBody();

        // Reemplazar textos
        body.replaceText("<<TRATAMIENTO>>", trato);
        body.replaceText("<<NOMBRE_AGENTE>>", nombreAgente.toString().toUpperCase());
        body.replaceText("<<DNI>>", formatearDNI(dni));
        body.replaceText("<<CUIL>>", cuil.toString());
        body.replaceText("<<DOMICILIO>>", domicilio);
        body.replaceText("<<LOCALIDAD>>", localidad);
        body.replaceText("<<CORREO>>", correo);
        body.replaceText("<<EXPEDIENTE>>", expediente);
        body.replaceText("<<NUCLEO>>", nucleo);
        body.replaceText("<<LOCALIDAD_NUCLEO>>", localidadNucleo);
        body.replaceText("<<INICIO_VIGENCIA>>", Utilities.formatDate(inicioVigencia, Session.getScriptTimeZone(), "dd/MM/yyyy"));
        body.replaceText("<<FIN_VIGENCIA>>", Utilities.formatDate(finVigencia, Session.getScriptTimeZone(), "dd/MM/yyyy"));
        body.replaceText("<<MONTO_TOTAL_NUMERO>>", formatearMoneda(montoTotalNumero));
        body.replaceText("<<MONTO_TOTAL_LETRA>>", montoTotalLetras);
        body.replaceText("<<CUOTAS>>", cuotas.toString());
        body.replaceText("<<CUOTAS_LETRAS>>", cuotasLetras.toString());
        body.replaceText("<<MONTO_CUOTAS_NUMERO>>", formatearMoneda(montoCuotasNumero));
        body.replaceText("<<MONTO_CUOTAS_LETRA>>", montoCuotasLetras);

        documento.saveAndClose();

        // Insertar URL del contrato
        hojaActual.getRange(`G${fila}`).setValue(docNuevo.getUrl());
        hojaActual.getRange(`B${fila}`).setValue(true);
        hojaActual.getRange(`F${fila}`).setValue(new Date());

        // Pequeña pausa para evitar límites
        Utilities.sleep(500);

      } catch (errorFila) {
        Logger.log(`Error en fila ${fila}: ${errorFila.toString()}`);
        hojaActual.getRange(`G${fila}`).setValue(`Error: ${errorFila.message}`);
        continue;
      }
    }

    // MOSTRAR INFO DE TODAS LAS CARPETAS CREADAS
    if (docGenerados > 0) {
      let mensaje = `✅ Se han creado ${docGenerados} contratos en ${Object.keys(carpetasPordependencia).length} carpeta(s):\n\n`;

      // si el enlace a la carpeta
      for (const [dependencia, carpeta] of Object.entries(carpetasPordependencia)) {
        mensaje += `📁 ${dependencia}\n`;
      }

      //Con el enlace a la carpeta
      //for (const [dependencia, carpeta] of Object.entries(carpetasPordependencia)) {
      //    mensaje += `📁 ${dependencia}: ${carpeta.getUrl()}\n`;
      //}
      // Guardar todos los enlaces en la hoja Modelos
      let row = 4;
      modelos.getRange("D4:E" + (row + Object.keys(carpetasPordependencia).length)).clearContent();

      for (const [dependencia, carpeta] of Object.entries(carpetasPordependencia)) {
        modelos.getRange(`D${row}`).setValue(dependencia);
        modelos.getRange(`E${row}`).setValue(carpeta.getUrl());
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