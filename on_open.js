function onOpen() {
  //Crea el menu cada vez que se abre el documento
  SpreadsheetApp.getUi().createMenu("Generar Notas")
    // Agrega una opción en el menú - "Nombre del comando" , "Nombre de la funnción que ejecuta"
    .addItem("Generar Notas", "generarNotas")
    .addToUi()
}
