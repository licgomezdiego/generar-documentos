function onOpen() {
  //Crea el menu cada vez que se abre el documento
  SpreadsheetApp.getUi().createMenu("SIPTED")
    // Agrega una opción en el menú - "Nombre del comando" , "Nombre de la funnción que ejecuta"
    .addItem("Generar Contratos", "generarContrato")
    .addItem('Cargar Altas y Bajas', 'mostrarFormulario') // agrega un item al menú
    //.addItem("Generar Contrato de Coordinadores", "contratosCoordinadores")
    .addItem('Registrar Resoluciones y fechas', 'registrarResoluciones')
    .addItem('Generar Certificaciones', 'generarCertificacionMes')
    .addToUi()
}