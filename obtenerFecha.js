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

// Función para convertir números a letras (hasta 9999)
function numeroALetras(num) {
  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis",
    "diecisiete", "dieciocho", "diecinueve"
  ];
  const decenas = [
    "", "", "veinte", "treinta", "cuarenta", "cincuenta",
    "sesenta", "setenta", "ochenta", "noventa"
  ];
  const centenas = [
    "", "ciento", "doscientos", "trescientos", "cuatrocientos",
    "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"
  ];

  if (num === 0) return "cero";
  if (num === 100) return "cien";
  if (num < 20) return unidades[num];
  if (num < 100) {
    return decenas[Math.floor(num / 10)] +
      (num % 10 !== 0 ? (num < 30 ? "i" : " y ") + unidades[num % 10] : "");
  }
  if (num < 1000) {
    return centenas[Math.floor(num / 100)] +
      (num % 100 !== 0 ? " " + numeroALetras(num % 100) : "");
  }
  if (num < 10000) {
    return (num < 2000 ? "mil" : unidades[Math.floor(num / 1000)] + " mil") +
      (num % 1000 !== 0 ? " " + numeroALetras(num % 1000) : "");
  }
  return num.toString(); // fallback si es mayor a 9999
}

// Función original que no queremos tocar
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

// Función para devolver la fecha en letras
function obtenerFechaEnLetras() {
  let fecha = new Date();
  let meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  let dia = numeroALetras(fecha.getDate());
  let mes = meses[fecha.getMonth()];
  let anio = numeroALetras(fecha.getFullYear());
  return `${dia} de ${mes} de ${anio}`;
}


// Ejemplo de uso
function mostrarFechaLetras (){
let mostrar = obtenerFechaEnLetras();
Logger.log (mostrar);
}