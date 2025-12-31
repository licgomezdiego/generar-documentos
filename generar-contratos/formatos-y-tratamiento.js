
// Si recibe f devuleve la Sra. y si recibe m el Sr, si está vacío no devuleve nada
function determinarTratamiento(tratamiento) {
  if (typeof tratamiento !== 'string') return "";

  const t = tratamiento.trim().toLowerCase();

  if (t === "f") return "la Sra.";
  if (t === "m") return "el Sr.";

  return "";   // Si no coincide con ninguno
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
