function obtenerFecha() {
  const fecha = new Date();
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return `${dia} de ${mes} de ${anio}`;
}

function extraerIdDeUrl(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url?.match(regex);
  return match ? match[1] : null;
}

function obtenerUrl(fila) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const hojaModelos = spreadsheet.getSheetByName("Modelos");

    if (!hojaModelos)
      throw new Error("No se encontró la hoja llamada 'Modelos'.");

    const celda = hojaModelos.getRange(`B${fila}`);
    const valor = celda.getValue();

    if (!valor)
      throw new Error(`La celda B${fila} de la hoja Modelos está vacía.`);

    return valor;
  } catch (error) {
    Logger.log("Error en obtenerUrl: " + error.message);
    return null;
  }
}

function obtenerIdDesdeHojaModelos(fila) {
  const url = obtenerUrl(fila);
  return url ? extraerIdDeUrl(url) : null;
}

function determinarTratamiento(tratamiento) {
  if (!tratamiento || typeof tratamiento !== "string") return "";

  const textoLimpio = tratamiento.trim().toUpperCase();

  if (textoLimpio.endsWith("F")) {
    return "a la Sra.";
  }

  return "al Sr.";
}

function obtenerFilaPorTipo(tipoContrato) {
  // --- Normaliza texto: quita tildes, pasa a minúsculas y elimina espacios sobrantes ---
  const normalizar = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const tipo = normalizar(tipoContrato);

  // --- Diccionario de tipos → número de fila ---
  const mapaTipos = {
    "asistente educativo multiarea": 2,
    "asistente educativo doble nucleo": 3,
    "asistente educativo 50%": 4,
    "asistente educativo itinerante": 5,
    "asistente educativo primaria": 6,
    "coordinador zonal": 7,
    "coordinador pedagogico": 8,
    "evaluador simple": 9,
    "evaluador doble modulo": 10,
    "tutor telematico": 11,
    "tutor telematico doble": 12,
    "corrector de estilos": 13,
    "docente equipo tecnico ped. sec. doble modulo": 14,
    "docente equipo tecnico ped. sec. simple": 15,
    "docente equipo tecnico ped. primaria simple": 16,
    "administrativo": 17,
  };

  return mapaTipos[tipo] ?? null;
}
