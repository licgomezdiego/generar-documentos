
function debug() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const datos = hoja.getDataRange().getValues();
  
  Logger.log("Primeras 5 filas para debugging:");
  
  for (let i = 0; i < Math.min(5, datos.length); i++) {
    Logger.log(`Fila ${i + 1}: ${JSON.stringify(datos[i])}`);
  }
  
  // Probar solo una fila específica
  if (datos.length > 1) {
    Logger.log("\n=== DETALLE FILA 2 ===");
    const fila2 = datos[1];
    for (let j = 0; j < fila2.length; j++) {
      Logger.log(`Columna ${j + 1}: ${fila2[j]} (tipo: ${typeof fila2[j]})`);
    }
  }
}

function test() {
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const datos = hoja.getDataRange().getValues();
    
    Logger.log("Total de filas: " + datos.length);
    Logger.log("Total de columnas en primera fila: " + (datos[0] ? datos[0].length : 0));
    
    for (let i = 2; i < datos.length; i++) {
      const fila = i + 1;
      const filaDatos = datos[i];
      
      // Verificar que la fila tenga datos y suficientes columnas
      if (!filaDatos || filaDatos.length < 19) {
        Logger.log(`Fila ${fila}: No tiene suficientes columnas (${filaDatos ? filaDatos.length : 0})`);
        continue;
      }
      
      // Desestructurar con manejo de valores undefined
      const [
        coordinacion, check, fecha, asistente, dni, cuil, domicilio, 
        localidad, correo, expediente, nucleo, localidadNucleo, 
        inicioVigencia, finVigencia, montoTotalNumero, montoTotalLetras, 
        cuotas, montoCuotasNumero, montoCuotasLetras, enlace
      ] = filaDatos;
      
      // Verificar si ya fue procesado (check como booleano o string)
      const yaEnviado = check === true || check === "TRUE" || check === "✓";
      if (yaEnviado) {
        Logger.log(`Fila ${fila}: Ya fue enviado - SKIP`);
        continue;
      }
      
      // Formatear fechas para logging
      const formatoFecha = (fechaObj) => {
        if (!fechaObj || !(fechaObj instanceof Date)) return "N/A";
        return Utilities.formatDate(fechaObj, Session.getScriptTimeZone(), "dd/MM/yyyy");
      };
      
      Logger.log(`\n=== FILA ${fila} ===`);
      Logger.log(`Coordinación: ${coordinacion || "N/A"}`);
      Logger.log(`Check: ${check}`);
      Logger.log(`Fecha: ${formatoFecha(fecha)}`);
      Logger.log(`Asistente: ${asistente || "N/A"}`);
      Logger.log(`DNI: ${dni || "N/A"}`);
      Logger.log(`CUIL: ${cuil || "N/A"}`);
      Logger.log(`Enlace: ${enlace || "N/A"}`);
      Logger.log(`¿Ya enviado?: ${yaEnviado}`);
      
    }
    
    Logger.log("=== TEST COMPLETADO ===");
    
  } catch (error) {
    Logger.log("ERROR: " + error.toString());
    Logger.log("Stack: " + error.stack);
  }
}

function testContratos(){
  const fila = obtenerFilaPorTipo ("coordinador pedagogico buenos aires");
  const url = obtenerUrl(fila);
  const mostrar = extraerIdDeUrl(url);
  Logger.log (mostrar);
}
function testFila() {
  const probar = 267; // número de fila que querés revisar
  const datos = obtenerDatosFila(probar); // llama a tu función principal

  const campo = "tipoContrato"; // 🔹 acá elegís qué campo mostrar (por ejemplo: "check", "dni", etc.)

  if (datos && datos[campo] !== undefined) {
    Logger.log(`${campo}: ${datos[campo]}`);
  } else {
    Logger.log(`No se encontró el campo "${campo}" o la fila ${probar} está vacía.`);
  }
}

function obtenerDatosFila(numeroFila) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Modelos"); // 🔹 Cambiá el nombre si es necesario
  const ultimaColumna = hoja.getLastColumn(); // 🔹 Detecta la última columna con datos en la hoja
  
  // Obtiene todos los valores de esa fila (desde columna 1 hasta la última con datos)
  const datosFila = hoja.getRange(numeroFila, 1, 1, ultimaColumna).getValues()[0];

  const [
    nombreAgente, check, tipoContrato, dependencia, estado, fecha, enlace, enviado, firmado,
    nucleo, localidadNucleo, viaje, inicioVigencia, finVigencia, cuotas, cuotasLetras,
    dni, cuil, domicilio, localidad, correo, genero, observaciones,
    expediente, montoTotalNumero, montoTotalLetras, montoCuotasNumero, montoCuotasLetras,
    telefono, res, fechaRes
  ] = datosFila;

  // Devuelve un objeto con los valores etiquetados
  return {
    nombreAgente,
    check,
    tipoContrato,
    dependencia,
    estado,
    fecha,
    enlace,
    enviado,
    firmado,
    nucleo,
    localidadNucleo,
    viaje,
    inicioVigencia,
    finVigencia,
    cuotas,
    cuotasLetras,
    dni,
    cuil,
    domicilio,
    localidad,
    correo,
    genero,
    observaciones,
    expediente,
    montoTotalNumero,
    montoTotalLetras,
    montoCuotasNumero,
    montoCuotasLetras,
    telefono,
    res,
    fechaRes
  };
}

function testing (){
  const mostrar = obtenerDatosFila(12);
  Logger.log (mostrar);
}
function obtenerIdDesdeUrlManual (){
const id = extraerIdDeUrl("https://docs.google.com/document/d/1ojQJWDXaYxZma6N8CjS4ioLyoyxn7rgGWAZ0jVD5_Xg/edit?tab=t.0");
Logger.log (id);
}
function extraerIdDeUrl(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
