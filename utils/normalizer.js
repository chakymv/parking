// utils/normalizer.js

/**
 * Normaliza una placa eliminando espacios y caracteres no alfanuméricos,
 * convirtiéndola en mayúsculas.
 */
const normalizePlaca = (str) => {
  str = str?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
  return str.length === 6 ? str.slice(0, 3) + '-' + str.slice(3) : str;
};


/**
 * Normaliza el número de documento eliminando caracteres no numéricos.
 */
const normalizeDocumento = (str) =>
  str?.trim().replace(/\D/g, '') || '';

/**
 * Normaliza correos electrónicos en minúsculas y sin espacios.
 */
const normalizeCorreo = (str) =>
  str?.trim().toLowerCase() || '';

/**
 * Normaliza texto genérico quitando espacios y mayúsculas controladas.
 */
const normalizeTexto = (str) =>
  str?.trim() || '';

/**
 * Convierte cualquier fecha recibida en formato ISO estándar.
 * Retorna null si el valor no es convertible.
 */
const normalizeFecha = (str) => {
  const fecha = new Date(str);
  return isNaN(fecha.getTime()) ? null : fecha.toISOString();
};

module.exports = {
  normalizePlaca,
  normalizeDocumento,
  normalizeCorreo,
  normalizeTexto,
  normalizeFecha,
};
