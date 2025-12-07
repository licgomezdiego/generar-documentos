// esta es una version con lectura y escritura masiva, y gestion de carpetas por dependencia
// ademas de mejoras en manejo de errores y logs
// y optimizacion de pausas para evitar limites de Drive
// y uso de arrays para escritura masiva al final
// hay que probar si falla si se detiene en algun punto, si es asi, no se si se puede retomar sin problemas
function generarContrato() {
  const ui = SpreadsheetApp.getUi();

  try {
    const respuesta = ui.alert("Pulsa SI para generar los documentos", ui.ButtonSet.YES_NO);
    if (respuesta !== ui.Button.YES) {
      return ui.alert("Se ha cancelado la generación de documentos");
    }

    const ss = SpreadsheetApp.getActive();
    const hojaActual = ss.getActiveSheet();
    const modelos = ss.getSheetByName("Modelos");
    const idHoja = ss.getId();
    const carpetaPadre = DriveApp.getFileById(idHoja).getParents().next();

    const ultimaFila = hojaActual.getLastRow();
    const fechaActual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd-MM-yyyy");

    // 🔹 Mapas y contadores
    const carpetasPordependencia = {};
    let docGenerados = 0;

    // 🔹 Lectura masiva de datos (desde fila 3)
    const datos = hojaActual.getRange(3, 1, ultimaFila - 2, 31).getValues();

    // 🔹 Arrays para escritura masiva
    const urls = [];
    const checks = [];
    const fechas = [];
    const mensajes = [];

    for (let i = 0; i < datos.length; i++) {
      const fila = i + 3;
      const datosFila = datos[i];

      try {
        const [
          nombreAgente, check, tipoContrato, dependencia, estado, fecha, enlace, enviado, firmado,
          nucleo, localidadNucleo, viaje, inicioVigencia, finVigencia, cuotas, cuotasLetras,
          dni, cuil, domicilio, localidad, correo, genero, observaciones,
          expediente, montoTotalNumero, montoTotalLetras, montoCuotasNumero, montoCuotasLetras, telefono, res, fechaRes
        ] = datosFila;

        // Saltear filas sin nombre
        if (!nombreAgente || nombreAgente.toString().trim() === "") {
          urls.push([""]);
          checks.push([""]);
          fechas.push([""]);
          mensajes.push([""]);
          continue;
        }

        // Verificar si ya fue procesado
        const yaProcesado = check === true || check === "TRUE" || check === "✓" || check === 1;
        if (yaProcesado) {
          urls.push([""]);
          checks.push([""]);
          fechas.push([""]);
          mensajes.push([""]);
          continue;
        }

        // Validar campos obligatorios mínimos
        if (!dependencia || !tipoContrato || !dni || !cuil || !domicilio || !localidad ||
          !correo || !expediente || !nucleo || !localidadNucleo ||
          !inicioVigencia || !finVigencia || !montoTotalNumero || !montoTotalLetras ||
          !cuotas || !montoCuotasNumero || !montoCuotasLetras || !genero) {
          urls.push([""]);
          checks.push([""]);
          fechas.push([""]);
          mensajes.push(["Faltaron datos suficientes para generar el contrato"]);
          continue;
        }

        // Determinar trato según género
        let trato = determinarTratamiento(genero);
        docGenerados++;

        // Crear o usar carpeta por dependencia
        let carpeta = carpetasPordependencia[dependencia];
        if (!carpeta) {
          const nombreCarpeta = `Contratos de: ${dependencia}`;
          carpeta = crearCarpetaEnPadre(nombreCarpeta, carpetaPadre);
          carpetasPordependencia[dependencia] = carpeta;

          Logger.log(`✅ Nueva carpeta creada para: ${dependencia}`);

          if (Object.keys(carpetasPordependencia).length === 1) {
            modelos.getRange("D2").setValue(`Carpetas creadas: ${Object.keys(carpetasPordependencia).length}`);
            modelos.getRange("E2").setValue("Carpeta Padre: " + carpetaPadre.getName());
            modelos.getRange("D3").setValue(carpetaPadre.getUrl());
          }
        }

        // Obtener ID del modelo según tipo de contrato (normalizado)
        const tipoNormalizado = normalizarTexto(tipoContrato);
        const filaTipo = obtenerFilaPorTipo(tipoNormalizado);
        const modeloId = obtenerIdDesdeHojaModelos(filaTipo);
        if (!modeloId) throw new Error("No se pudo obtener el ID del documento plantilla");

        // Duplicar plantilla y editar documento
        const docBase = DriveApp.getFileById(modeloId);
        const docNuevo = docBase.makeCopy(`Contrato de: ${nombreAgente} - ${nucleo}`, carpeta);
        const documento = DocumentApp.openById(docNuevo.getId());
        const body = documento.getBody();

        // Reemplazo de campos
        body.replaceText("<<TRATAMIENTO>>", trato);
        body.replaceText("<<NOMBRE_AGENTE>>", nombreAgente);
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
        body.replaceText("<<CUOTAS_LETRAS>>", cuotasLetras.toString());
        body.replaceText("<<MONTO_CUOTAS_NUMERO>>", montoCuotasNumero.toString());
        body.replaceText("<<MONTO_CUOTAS_LETRA>>", montoCuotasLetras);

        documento.saveAndClose();

        // Guardar resultados en arrays
        urls.push([docNuevo.getUrl()]);
        checks.push([true]);
        fechas.push([new Date()]);
        mensajes.push([""]);

        Utilities.sleep(300);

      } catch (errorFila) {
        Logger.log(`❌ Error en fila ${fila}: ${errorFila.toString()}`);
        urls.push([""]);
        checks.push([""]);
        fechas.push([""]);
        mensajes.push([`Error: ${errorFila.message}`]);
      }
    }

    // 🔹 Escritura masiva al final
    hojaActual.getRange(3, 7, urls.length, 1).setValues(urls);     // Columna G (URL)
    hojaActual.getRange(3, 2, checks.length, 1).setValues(checks); // Columna B (Check)
    hojaActual.getRange(3, 6, fechas.length, 1).setValues(fechas); // Columna F (Fecha)
    hojaActual.getRange(3, 8, mensajes.length, 1).setValues(mensajes); // Columna H (Mensajes)

    // 🔹 Registro de carpetas creadas
    if (docGenerados > 0) {
      let mensaje = `✅ Se han creado ${docGenerados} contratos en ${Object.keys(carpetasPordependencia).length} carpeta(s):\n\n`;

      let row = 4;
      modelos.getRange("D4:E" + (row + Object.keys(carpetasPordependencia).length)).clearContent();

      for (const [dependencia, carpeta] of Object.entries(carpetasPordependencia)) {
        modelos.getRange(`D${row}`).setValue(dependencia);
        modelos.getRange(`E${row}`).setValue(carpeta.getUrl());
        mensaje += `📁 ${dependencia}\n`;
        row++;
      }

      ui.alert(mensaje);
    } else {
      ui.alert("ℹ️ No se encontraron datos para procesar.");
    }

  } catch (errorGlobal) {
    Logger.log(`🚨 ERROR GLOBAL: ${errorGlobal.toString()}`);
    Logger.log(`STACK: ${errorGlobal.stack}`);
    SpreadsheetApp.getUi().alert(`❌ Error crítico: ${errorGlobal.message}`);
  }
}

/**
 * Normaliza texto: pasa a minúsculas, elimina tildes y espacios extra
 */
function normalizarTexto(texto) {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .trim()
    .toLowerCase();
}
