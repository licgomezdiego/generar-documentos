/**
 * @fileoverview Configuración central y conexión a Base de Datos.
 * Proyecto: Sistema de Gestión de Núcleos (CRUD)
 */

const DB_ID = "1KXD61TcodkIJq8Vaj-GpWs2GSNFX5g1U_DToWFXDoLc"; 
const DB_USER = "1a-qZ93vmldOuPf_hYUbUGdMWrhks7U9yvH0fOue3iss"; 
const SH_NAME = "NUCLEOS";
const SH_USER = "USUARIOS";

const getDB = () => {
  try { return SpreadsheetApp.openById(DB_ID); } 
  catch (e) { throw new Error("Error: No se pudo conectar con la Base de Núcleos."); }
};

const getUserDB = () => {
  try { return SpreadsheetApp.openById(DB_USER); } 
  catch (e) { throw new Error("Error: No se pudo conectar con la Base de Usuarios."); }
};

/**
 * Valida el acceso con limpieza de datos
 */
function validarAccesoUsuario() {
  try {
    const emailActual = Session.getActiveUser().getEmail().toLowerCase().trim();
    if (!emailActual) return { hasAccess: false, error: "No se detectó sesión de Google activa." };

    const ss = getUserDB();
    const sh = ss.getSheetByName(SH_USER);
    if (!sh) return { hasAccess: false, error: "No se encontró la pestaña de usuarios autorizados." };

    const data = sh.getDataRange().getValues();
    data.shift(); // Eliminar encabezados
    
    // Buscamos coincidencia robusta
    const registro = data.find(fila => {
      if (!fila[0]) return false; // Ignorar filas vacías
      return fila[0].toString().toLowerCase().trim() === emailActual;
    });
    
    if (registro) {
      return { 
        hasAccess: true, 
        email: emailActual, 
        rol: registro[1], 
        nombre: registro[2] 
      };
    } else {
      return { hasAccess: false, email: emailActual, error: "Usuario no registrado en la lista de permitidos." };
    }
      
  } catch (e) {
    return { hasAccess: false, error: "Error de servidor: " + e.toString() };
  }
}

function doGet() {
  // Ahora el doGet solo entrega la interfaz limpia
  return HtmlService.createTemplateFromFile('Interfaz')
      .evaluate()
      .setTitle('Gestión de Núcleos - MVP')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Asegúrate de que tu función include sea simple:
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getTodosLosNucleos() {
  try {
    const ss = getDB();
    const sheet = ss.getSheetByName(SH_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    return data.map(row => {
      let obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
  } catch (e) {
    throw new Error("Error al leer núcleos: " + e.toString());
  }
}