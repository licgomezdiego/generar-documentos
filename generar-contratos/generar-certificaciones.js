/**
 * Versión actualizada:
 * - Reemplaza {{MES}} también en header y footer (si existen)
 * - Inserta tablas reales con body.insertTable(...) en lugar de texto plano
 *
 * CONFIGURAR: revisar los IDs al inicio del archivo (ya los pasaste; están puestos).
 */

const MODEL_DOC_ID = "1ojQJWDXaYxZma6N8CjS4ioLyoyxn7rgGWAZ0jVD5_Xg"; // tu modelo
const TARGET_FOLDER_ID = "1moP4xmloURL1dZICzBRFD2-4FNihjMUJ"; // carpeta destino
const SHEET_NAME_CONTRATOS = "Contratos";
const SHEET_NAME_CERT = "Certificaciones";
const MES_CELL = "C2"; // donde está el mes en texto

function generarCertificacionMes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const contratosSheet = ss.getSheetByName(SHEET_NAME_CONTRATOS);
    const certSheet = ss.getSheetByName(SHEET_NAME_CERT);
    if (!contratosSheet || !certSheet) throw new Error("No se encontró alguna de las hojas esperadas.");

    // Leer mes
    const mesCellVal = (certSheet.getRange(MES_CELL).getDisplayValue() || "").toString().trim();
    if (!mesCellVal) throw new Error(`La celda ${SHEET_NAME_CERT}!${MES_CELL} está vacía. Escribí el mes (ej: "marzo" o "marzo 2025").`);

    // Normalizar entrada: "marzo" o "marzo 2025"
    const partes = mesCellVal.toLowerCase().split(/\s+/);
    const nombreMesRaw = partes[0];
    let año = null;
    if (partes.length > 1 && /^\d{4}$/.test(partes[1])) año = parseInt(partes[1], 10);
    if (!año) año = new Date().getFullYear();

    const meses = {
      "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
      "julio": 6, "agosto": 7, "septiembre": 8, "setiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11
    };
    if (!meses.hasOwnProperty(nombreMesRaw)) throw new Error("Mes desconocido: " + nombreMesRaw);
    const mesNum = meses[nombreMesRaw];
    const monthStart = new Date(año, mesNum, 1, 0, 0, 0, 0);
    const monthEnd = new Date(año, mesNum + 1, 0, 23, 59, 59, 999);

    // Leer datos
    const dataRange = contratosSheet.getDataRange();
    const values = dataRange.getValues();
    if (values.length < 2) throw new Error("Hoja Contratos sin datos.");
    const headers = values[0].map(h => (h || "").toString().trim());
    const rows = values.slice(1);

    function colIndex(name) {
      return headers.findIndex(h => h.toString().toLowerCase() === name.toLowerCase());
    }

    const idxNombre = colIndex("APELLIDO Y NOMBRE");
    const idxTipoContrato = colIndex("TIPO DE CONTRATO");
    const idxEstado = colIndex("ESTADO");
    const idxNucleo = colIndex("NUCLEO / AREA DE TRABAJO");
    const idxLocalidadTrabajo = colIndex("LOCALIDAD TRABAJO");
    const idxInicio = colIndex("INICIO VIGENCIA");
    const idxFin = colIndex("FIN VIGENCIA");
    const idxCUIL = colIndex("CUIL");
    const idxDependencia = colIndex("DEPENDENCIA");

    if ([idxNombre, idxTipoContrato, idxEstado, idxNucleo, idxInicio, idxFin].some(i => i === -1)) {
      throw new Error("No se encontraron columnas requeridas. Revisá encabezados: APELLIDO Y NOMBRE, TIPO DE CONTRATO, ESTADO, NUCLEO / AREA DE TRABAJO, INICIO VIGENCIA, FIN VIGENCIA.");
    }

    // Filtrar
const filtrados = [];
rows.forEach((r) => {
  const estado = (r[idxEstado] || "").toString().trim().toLowerCase();
  if (estado !== "activo") return; // sólo activos

  const inicioDate = parseDateFlexible(r[idxInicio]);
  const finDate = parseDateFlexible(r[idxFin]);
  if (!inicioDate || !finDate) return; // saltar si no hay fechas completas

  if (inicioDate <= monthEnd && finDate >= monthStart) {
    const nombre = (r[idxNombre] || "").toString().trim();
    const tipoContrato = (r[idxTipoContrato] || "").toString().trim();
    const nucleoRaw = (r[idxNucleo] || "").toString().trim();

    const locVal = (r[idxLocalidadTrabajo] || "").toString().trim();
    const localidad = locVal.includes(",") ? locVal.split(",")[0].trim() : locVal;

    const cuil = (r[idxCUIL] || "").toString().trim();
    const dependencia = (r[idxDependencia] || "").toString().trim();

    // si NO hay CUIL → no generar nada
    if (!cuil || cuil.trim() === "") return;

    const nucleos = splitNucleos(nucleoRaw);
    nucleos.forEach(nuc => {
      let nombreFinal = nombre;

      if (/convenio/i.test(tipoContrato)) {
        if (!/CONVENIO/i.test(nombreFinal)) {
          nombreFinal = nombreFinal + " CONVENIO 50%";
        }
      }

      filtrados.push({
        nombre: nombreFinal,
        tipoContrato: tipoContrato,
        nucleo: nuc.trim(),
        localidad: localidad,
        cuil: cuil,
        inicio: inicioDate,
        fin: finDate,
        dependencia: dependencia
      });
    });
  }
});


    if (filtrados.length === 0) {
      SpreadsheetApp.getUi().alert("No se encontraron agentes activos con vigencia en " + capitalize(nombreMesRaw) + " " + año + ".");
      return;
    }

    // Agrupar por categoría
    const grupos = {};
    filtrados.forEach(item => {
      const cat = categorizeTipo(item.tipoContrato);
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(item);
    });

    // Crear copia del modelo
    const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    const nombreArchivo = `Certificación_${capitalize(nombreMesRaw)}_${año}`;
    const copyFile = DriveApp.getFileById(MODEL_DOC_ID).makeCopy(nombreArchivo, folder);
    const doc = DocumentApp.openById(copyFile.getId());
    const body = doc.getBody();
    
    // Guardar enlace del documento generado en Certificaciones!D2
    certSheet.getRange("D2").setValue(doc.getUrl());


    // Reemplazar {{MES}} en header/footer/body (header/footer si existen)
    const mesTextoPresentacion = capitalize(nombreMesRaw);
    try {
      const header = doc.getHeader();
      if (header) header.editAsText().replaceText("\\{\\{MES\\}\\}", mesTextoPresentacion);
    } catch (e) { /* no header o no permiso - ignorar */ }
    try {
      const footer = doc.getFooter();
      if (footer) footer.editAsText().replaceText("\\{\\{MES\\}\\}", mesTextoPresentacion);
    } catch (e) { /* no footer - ignorar */ }
    // reemplazo en body (por si quedara)
    body.replaceText("\\{\\{MES\\}\\}", mesTextoPresentacion);

    // Construir e insertar tablas (si existe {{TABLAS}} se inserta allí; si no, se agregan al final)
    const placeholderParagraph = findParagraphContaining(body, "{{TABLAS}}");
    if (placeholderParagraph) {
      // índice del párrafo marcador
      const insertIndex = body.getChildIndex(placeholderParagraph);
      // vaciamos el texto del marcador (lo dejamos como párrafo vacío)
      try {
        placeholderParagraph.editAsText().setText("");
      } catch (e) {
        // si por alguna razón falla, no detenemos el proceso
        Logger.log("No se pudo vaciar el placeholder: " + e);
      }
      // Insertar las tablas justo después del párrafo marcador vacío
      insertTablasEnBody(body, grupos, insertIndex + 1);
    } else {
      // insertar al final
      insertTablasEnBody(body, grupos, body.getNumChildren());
    }


    doc.saveAndClose();

    const url = copyFile.getUrl();
    SpreadsheetApp.getUi().alert("Documento generado: " + nombreArchivo + "\n\nSe guardó en la carpeta indicada.\n\n" + url);

  } catch (e) {
    SpreadsheetApp.getUi().alert("Error: " + e.message);
    Logger.log(e);
  }
}

/** Inserta las tablas en el body en la posición indicada (childIndex).
 * Crea una tabla por sección: primera fila encabezado, luego filas con datos.
 */
function insertTablasEnBody(body, grupos, childIndexStart) {
  const secciones = Object.keys(grupos).sort();
  let idx = childIndexStart;

  secciones.forEach(seccion => {
    const titulo = body.insertParagraph(idx++, seccion);
  titulo.setHeading(DocumentApp.ParagraphHeading.NORMAL); // evita estilos automáticos
  titulo.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  const tituloText = titulo.editAsText();
  tituloText.setBold(true);
  tituloText.setFontSize(14);
  tituloText.setFontFamily("Times New Roman");

 // Preparar datos de la tabla: array de arrays
const headerRow = ["Nº", "Apellidos y Nombres", "Núcleo y localidad", "CUIT/CUIL", "Vigencia"];
const lista = grupos[seccion];

lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

const tableRows = [];
tableRows.push(headerRow);

for (let i = 0; i < lista.length; i++) {
  const it = lista[i];
  const vig = formatoFecha(it.inicio) + " al " + formatoFecha(it.fin);
  const nucYLoc = (it.nucleo || "") + (it.localidad ? ("\n" + it.localidad) : "");
  const cuil = it.cuil || "";
  tableRows.push([(i + 1).toString(), it.nombre, nucYLoc, cuil, vig]);
}

// Insertar tabla
const table = body.insertTable(idx++, tableRows);

// === Aplicar formato al encabezado ===
const headerRowObj = table.getRow(0);
const numHeaderCols = headerRowObj.getNumCells();

for (let c = 0; c < numHeaderCols; c++) {
  const cell = headerRowObj.getCell(c);
  const text = cell.editAsText();
  text.setFontFamily("Times New Roman");
  text.setFontSize(14);
  text.setBold(true);     // ENCABEZADO EN NEGRITA
}

// === Aplicar formato a las filas de datos (sin negrita) ===
for (let r = 1; r < table.getNumRows(); r++) {  // desde 1 → excluye header
  const row = table.getRow(r);
  const numCols = row.getNumCells();
  for (let c = 0; c < numCols; c++) {
    const cell = row.getCell(c);
    const text = cell.editAsText();
    text.setFontFamily("Times New Roman");
    text.setFontSize(14);
    text.setBold(false);  // RESTO DEL TEXTO SIN NEGRITA
  }
}

// Párrafo en blanco
body.insertParagraph(idx++, "");

  });
}

/** Busca un párrafo que contenga exactamente el marcador (o que lo incluya) */
function findParagraphContaining(body, marcador) {
  const num = body.getNumChildren();
  for (let i = 0; i < num; i++) {
    const child = body.getChild(i);
    if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      const text = child.asParagraph().getText();
      if (text && text.indexOf(marcador) !== -1) return child.asParagraph();
    }
  }
  return null;
}

/** ---------- Helpers (misma lógica previa) ---------- **/

function parseDateFlexible(v) {
  if (!v && v !== 0) return null;
  if (v instanceof Date && !isNaN(v)) return v;
  const s = v.toString().trim();
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let day = parseInt(m[1], 10);
    let mon = parseInt(m[2], 10) - 1;
    let yr = parseInt(m[3], 10);
    if (yr < 100) yr += yr < 50 ? 2000 : 1900;
    const dt = new Date(yr, mon, day);
    if (!isNaN(dt)) return dt;
  }
  const dt2 = new Date(s);
  if (dt2 instanceof Date && !isNaN(dt2)) return dt2;
  return null;
}

function splitNucleos(raw) {
  if (!raw) return [""];
  const parts = raw.split(/(?:\r?\n|,|;|\/|–|—|-| {2,}|\s-\s)/).map(p => p.trim()).filter(p => p !== "");
  if (parts.length === 0) return [raw.trim()];
  return parts;
}

function categorizeTipo(tipo) {
  if (!tipo) return "Otros";
  const t = tipo.toString().toLowerCase();
  if (t.indexOf("coordinador") !== -1) return "Coordinadores Zonales";
  if (t.indexOf("administrativ") !== -1) return "Administrativos";
  if (t.indexOf("asistente") !== -1) return "Asistentes educativos multiárea";
  if (t.indexOf("tutor") !== -1 && t.indexOf("primaria") !== -1) return "Tutor Educación Primaria";
  if (t.indexOf("itinerante") !== -1) return "Asistente Itinerante";
  if (t.indexOf("evaluador") !== -1) return "Evaluadores";
  if (t.indexOf("diseñador") !== -1) return "Diseñador Gráfico";
  if (t.indexOf("corrector") !== -1) return "Corrector de Estilos";
  return capitalize(tipo);
}

function formatoFecha(d) {
  if (!(d instanceof Date)) return "";
  const dd = ("0" + d.getDate()).slice(-2);
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const yy = ("" + d.getFullYear()).slice(-2);
  return dd + "/" + mm + "/" + yy;
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
