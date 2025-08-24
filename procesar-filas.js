function testing() {
  const hoja = SpreadsheetApp.getActive().getActiveSheet();
  const ultimaFila = hoja.getLastRow();
  
  if (ultimaFila > 1) {
    const rango = hoja.getRange(2, 1, ultimaFila - 1, 9);
    const datos = rango.getValues();
    
    datos.forEach((fila, index) => {
      const filaNumero = index + 2;
      
      // Desestructuración directa del array
      const [municipio, nombre, creado, fecha, correo, tratamiento, cargo, url, enviado] = fila;
      
      if (!creado || enviado === true) return;
      
      const adjuntoId = extraerIdDeUrl(url || '');
      
      Logger.log(`Fila: ${filaNumero}, Municipio: ${municipio || ''}, Nombre: ${nombre || ''}, Creado: ${creado || ''}, Fecha: ${fecha || ''}, Correo: ${correo || ''}, Tratamiento: ${tratamiento || ''}, Cargo: ${cargo || ''}, ID: ${adjuntoId}, Enviado: ${enviado || false}`);
    });
  }
}

function procesarFilas() {
  const hoja = SpreadsheetApp.getActive().getActiveSheet();
  const ultimaFila = hoja.getLastRow();
  
  // Leer solo el rango necesario (evita leer miles de celdas vacías)
  if (ultimaFila > 1) {
    const rango = hoja.getRange(2, 1, ultimaFila - 1, 9); // fila 2, 9 columnas (A-I)
    const datos = rango.getValues();
    
    datos.forEach((fila, index) => {
      const filaNumero = index + 2; // +2 porque empezamos desde fila 2
      
      // Saltar si no hay datos en columna C (índice 2 del array) o si ya fue enviado (índice 8)
      if (!fila[2] || fila[8] === true) return;
      
      // Extraer todos los valores de la fila
      const municipio = fila[0] || '';
      const nombre = fila[1] || '';
      const creado = fila[2] || '';
      const fecha = fila[3] || '';
      const correo = fila[4] || '';
      const tratamiento = fila[5] || '';
      const cargo = fila[6] || '';
      const url = fila[7] || '';
      const enviado = fila[8] || false;
      
      const adjuntoId = extraerIdDeUrl(url);
      
      Logger.log(`Fila: ${filaNumero}, Municipio: ${municipio}, Nombre: ${nombre}, Creado: ${creado}, Fecha: ${fecha}, Correo: ${correo}, Tratamiento: ${tratamiento}, Cargo: ${cargo}, ID: ${adjuntoId}, Enviado: ${enviado}`);
    });
  } else {
    Logger.log("No hay datos para procesar (solo encabezados)");
  }
}