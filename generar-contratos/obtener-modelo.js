/* como se llama a estas funciones desde generar contratos:

const filaTipo = obtenerFilaPorTipo(tipoContrato)
        const modeloId = obtenerIdDesdeHojaModelos(filaTipo);
        if (!modeloId) {
          throw new Error("No se pudo obtener el ID del documento plantilla");
        }*/


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

function obtenerIdDesdeHojaModelos(fila) {
  const url = obtenerUrl(fila);
  return url ? extraerIdDeUrl(url) : null;
}