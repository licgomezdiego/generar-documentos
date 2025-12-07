// 🌐 Permite cargar el formulario desde una URL (opcional)
//Para que funcione debe estar publicada como app web, es necesario hacer una implementación nueva

//Más simple - usar para html estático, cuando no va cambiar
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('formulario-novedades.html');
}

//Más avanzado - usar para html dinámico, cuando va a cambiar según datos de hoja u otros
function doGet(){
    const template = HtmlService.createTemplateFromFile('formulario-novedades.html');
    return template.evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}