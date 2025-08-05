function obtenerFecha() {
  var fecha = new Date();
  var meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  var dia = fecha.getDate();
  var mes = meses[fecha.getMonth()];
  var anio = fecha.getFullYear();
  return dia + " de " + mes + " de " + anio;
}
