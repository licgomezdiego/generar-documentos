function extraerIdDeUrl(url) {
  // Expresión regular para capturar el ID
  // Esta expresión busca el patrón "/d/" seguido de una secuencia de caracteres alfanuméricos, guiones o guiones bajos.
  // El ID se captura en un grupo de captura.
  // Por ejemplo, en "https://docs.google.com/document/d/1A2B3C4D5E6F7G8H9I0J/edit", el ID sería "1A2B3C4D5E6F7G8H9I0J".
  // El ID se encuentra entre "/d/" y "/edit" o al final de la URL.
  // Si no se encuentra el ID, la función devuelve null.
  // Esta expresión regular es útil para extraer IDs de documentos de Google Docs, Google Sheets, etc.
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function obtenerUrl(fila) {
  if (typeof fila !== 'number' || fila < 1) return null; // Validación
  
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const celda = hoja.getRange(`H${fila}`);
  
  return celda.isBlank() ? null : celda.getValue();
}

function obtenerIdDesdeFila(fila) {
  const url = obtenerUrl(fila); // Usa la función corregida
  return url ? extraerIdDeUrl(url) : null;
}

function test() {
  console.log(obtenerUrl(2)); // Devuelve el contenido de H2 o null
  console.log(extraerIdDeUrl("https://drive.google.com/file/d/ABC123/edit")); // "ABC123"
  console.log(obtenerIdDesdeFila(2)); // ID extraído de H2 o null
}