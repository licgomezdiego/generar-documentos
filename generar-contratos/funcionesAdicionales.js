function obtenerFecha() {
  let fecha = new Date();
  let meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  let dia = fecha.getDate();
  let mes = meses[fecha.getMonth()];
  let anio = fecha.getFullYear();
  return dia + " de " + mes + " de " + anio;
}

function extraerIdDeUrl(url) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function obtenerUrl(fila) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Obtener la hoja llamada "Modelos"
    const hojaModelos = spreadsheet.getSheetByName("Modelos");

    if (!hojaModelos) {
      throw new Error("No se encontró la hoja llamada 'Modelos'");
    }

    // Obtener el valor de la celda 
    const celda = hojaModelos.getRange(`B${fila}`);

    if (celda.isBlank()) {
      throw new Error(`La celda B${fila} de la hoja Modelos está vacía`);
    }

    return celda.getValue();

  } catch (error) {
    Logger.log("Error en obtenerUrl: " + error.message);
    return null;
  }
}

function obtenerIdDesdeHojaModelos(fila) {
  const url = obtenerUrl(fila);
  return url ? extraerIdDeUrl(url) : null;
}

// Si recibe f devuleve la Sra. y si recibe m el Sr, si está vacío no devuleve nada
function determinarTratamiento(tratamiento) {
  if (typeof tratamiento !== 'string') return "";

  const t = tratamiento.trim().toLowerCase();

  if (t === "f") return "la Sra.";
  if (t === "m") return "el Sr.";

  return "";   // Si no coincide con ninguno
}


function obtenerFilaPorTipo(tipoContrato) {
  // --- Normaliza texto: quita tildes, pasa a minúsculas y elimina espacios sobrantes ---
  const normalizar = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD") // separa letras y acentos
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
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
  "docente equipo tecnico ped. sec. simple": 11,
  "disenador grafico": 12,
  "corrector de estilos": 13,
  "docente equipo tecnico ped. sec. doble modulo": 14,
  "docente equipo tecnico ped. primaria simple": 15,
  "administrativo": 16,
  "coordinador buenos aires": 17,
  "coordinador pedagogico buenos aires":18,
};


  // --- Devuelve el número de fila o null si no se encuentra ---
  return mapaTipos[tipo] || null;
}

function formatearMoneda(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  
  // Si viene como texto con símbolos o separadores, los limpiamos
  if (typeof valor === "string") {
    valor = valor.replace(/[^\d,.-]/g, "")     // elimina símbolos y letras
                 .replace(/\./g, "")            // elimina puntos de miles
                 .replace(",", ".");            // convierte coma en punto decimal
  }

  // Convertir a número
  let numero = Number(valor);
  if (isNaN(numero)) return "";

  // Convertir a texto con formato $XXX.XXX,XX
  let partes = numero.toFixed(2).split(".");
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "$" + partes.join(",");
}

function formatearDNI(valor) {
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
